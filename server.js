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
server.listen(process.env.PORT || 8000,()=>{
    console.log("Server is listening on port " + 8000)
})



const io = socketio(server)


mongoose.connect('mongodb://mongo:27017/4braincells',  { useNewUrlParser: true,useUnifiedTopology: true })
mongoose.set('useFindAndModify', false);

let userSockets ={}
let rooms = new Set()

userPlayer ={}

io.on('connection',async socket => {
    console.log("Socket Connected")
    //Initial socket connection to add user to sockets and rooms
    socket.on('init',async user => {
        socket.join(user);
        rooms.add(user);
        await Users.findByIdAndUpdate(user,{online:true});
        for (let key in userSockets) {
           userSockets[key].emit('status', {user : user, online:"online"});
        }

    })

    //for chatroom to update message
    socket.on('newChatRoom', message => {
        if (rooms.has(message.receiver)) io.in(message.receiver).emit('newChatRoom', message);
    })

    //Chat message when a user sends another user a message
    socket.on('message', async message => {
        console.log(message);
        console.log(io.sockets.adapter.rooms);
        io.in(message.user).emit('message', message);
        if (rooms.has(message.receiver)) socket.in(message.receiver).emit('message', message);
    })

    //game start triggers when a new player joins the game. It tells all the users their position as well as telling the person who
    //joined the other player's positions
    socket.on('gameStart', async message=>{
         userPlayer[message.user] = {x:message.x, y:message.y};
         if(userSockets[message.user] === undefined){
            userSockets[message.user.toString()] = socket;
         }
         positions = []
        for(var key in userPlayer){
            positions.push({user:key, x:userPlayer[key].x, y:userPlayer[key].y})

        }
        for(var key in userPlayer){
           userSockets[key].emit('newConnect',positions)
        }
    })

    //player movements that gets broadcasted to all users that are playing the game
    socket.on('movement', async message=>{
        userPlayer[message.user]= {x:message.x, y:message.y}
        positions = []
        for(var key in userPlayer){
            positions.push({user:key, x:userPlayer[key].x, y:userPlayer[key].y})
        }
        for(var key in userPlayer){
           userSockets[key].emit('newConnect',positions)
        }
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
// require('./routes/randomStuff')(app);


