const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const bodyparser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose');
const socketio = require("socket.io")
const http = require("http")
const chatFunc = require('./routes/chatFunc.js');
const Users = require('./models/Users')
require('dotenv').config()



app.use(bodyparser.json())
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

userPlayer ={}

io.on('connection',async socket=>{
    console.log("Socket Connected")

    
    socket.on('init',async message =>{
        
        if( userSockets[message.user.toString()] == undefined){
          
            userSockets[message.user.toString()] = socket;
            console.log(message.user + " socket is added")
        }
         await Users.findByIdAndUpdate(message.user,{online:true})

        console.log(await Users.findById(message.user))
        
        for (var key in userSockets) {
    
           userSockets[key].emit('status', {user : message.user, online:"online"})
        //    userSockets[message.user].emit('status', {user:key, online:"online"})
           
        }
     
    })

    socket.on('msg', async message=>{

        // socket.broadcast.emit("message", message)
        let msg = await chatFunc.incommingMessage(message.user, message.reciever,message.msg, message.date,message.chatroom_id)

            userSockets[msg.receiver].emit('message',msg)
            userSockets[message.user].emit('message',msg)
        
    })

    socket.on('gameStart', async message=>{
         userPlayer[message.user] = {x:message.x, y:message.y};
         if(userSockets[message.user] == undefined){
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


