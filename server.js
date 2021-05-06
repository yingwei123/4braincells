const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose');
const socketio = require("socket.io")
const http = require("http")
const chatFunc = require('./routes/chatFunc.js');
const Users = require('./models/Users')
require('dotenv').config()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'views')));

const server = http.createServer(app);


app.set('view engine', 'pug');
server.listen(process.env.PORT || 3000,()=>{
    console.log("Server is listening on port " + 3000)
})



const io = socketio(server)


mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost:27017/4braincells',  { useNewUrlParser: true,useUnifiedTopology: true })
mongoose.set('useFindAndModify', false);

let userSockets ={}
let rooms = new Set()

userPlayer ={}

io.on('connection',async socket => {
    console.log("Socket Connected")
    socket.on('init',async user => {
        socket.join(user);
        rooms.add(user);
        await Users.findByIdAndUpdate(user,{online:true});
        for (let key in userSockets) {
           userSockets[key].emit('status', {user : user, online:"online"});
        }

    })

    socket.on('newChatRoom', message => {
        if (rooms.has(message.receiver)) io.in(message.receiver).emit('newChatRoom', message);
    })
    socket.on('message', async message => {
        console.log(message);
        console.log(io.sockets.adapter.rooms);
        //let msg = await chatFunc.incommingMessage(message.user, message.receiver,message.msg,message.chatroom_id);
        io.in(message.user).emit('message', message);
        if (rooms.has(message.receiver)) socket.in(message.receiver).emit('message', message);
    })

    socket.on('gameStart', async message=>{
         userPlayer[message.user] = {x:message.x, y:message.y};
         if(userSockets[message.user] === undefined){
            userSockets[message.user.toString()] = socket;
         }
        //  userSockets[message.user.toString()] = socket;
    //    for (var key in userPlayer) {
    //         // userPlayer[key]

    //         console.log("This Key " + key + " Length = "+ userSockets.length)
    //         userSockets[message.user].emit('newConnect', {user : key, x:userPlayer[key].x,y:userPlayer[key].y})
    //      }
         positions = []
        for(var key in userPlayer){
            positions.push({user:key, x:userPlayer[key].x, y:userPlayer[key].y})
            // console.log("User Socket "+ key +" Caller key = "+ message.user)
        }
        for(var key in userPlayer){
           userSockets[key].emit('newConnect',positions)
        }
        // console.log(positions)
    })

    socket.on('movement', async message=>{
        userPlayer[message.user]= {x:message.x, y:message.y}
        // for (var key in userPlayer) {
        //     userSockets[key].emit('update', message)

        //  }
        positions = []
        for(var key in userPlayer){
            positions.push({user:key, x:userPlayer[key].x, y:userPlayer[key].y})
            // console.log("User Socket "+ key +" Caller key = "+ message.user)
        }
        for(var key in userPlayer){
           userSockets[key].emit('newConnect',positions)
        }
        // console.log(message)
    })

    socket.on('disconnect', async() =>{
        userToRemove = "user id"
        for (var key in userSockets) {
            if(userSockets[key] == socket){
                console.log(key  + " socket is removed")
                userToRemove = key
                await Users.findByIdAndUpdate(key,{online:false})
                console.log(await Users.findById(key))
                delete userSockets[key];
                break;
            }

         }
         for (var key in userSockets) {

            userSockets[key].emit('status', {user : userToRemove, online:"offline"})
         }
         stuff = userPlayer[userToRemove]
         delete userPlayer[userToRemove]
         if(stuff != undefined){
         for(var key in userPlayer){
             if(key != userToRemove){
             userSockets[key].emit('leftGame',{user:userToRemove, x:stuff.x,y:stuff.y} )
             }
         }
        }

    })


})



require('./routes/chatRoutes')(app);
require('./routes/pages')(app);
require('./routes/tokensRoutes')(app);
require('./routes/usersRoutes')(app);
require('./routes/randomStuff')(app);


