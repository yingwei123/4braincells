const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const bodyparser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose');
const socketio = require("socket.io")
const http = require("http")
const chatFunc = require('./routes/chatFunc.js');
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

    
    socket.on('init',message =>{
        console.log(message.user + " socket is added")
        userSockets[message.user.toString()] = socket;
        for (var key in userSockets) {
    
           userSockets[key].emit('status', {user : message.user, online:"online"})
        }
     
    })

    socket.on('msg', async message=>{

        // socket.broadcast.emit("message", message)
        let msg = await chatFunc.incommingMessage(message.user, message.reciever,message.msg, message.date,message.chatroom_id)

            userSockets[msg.receiver].emit('message',msg)
            userSockets[message.user].emit('message',msg)
        
    })

    socket.on('gameStart', async message=>{
        userPlayer[message.user.toString()] = {x:message.x, y:message.y};
       // for (var key in userPlayer) {
        console.log(message)
            //userSockets[key].emit('status', {user : message.user, online:"online"})
         //}
    })

    socket.on('movement', async message=>{
        userPlayer[message.user]= {x:message.x, y:message.y}
        console.log(message)
    })

    socket.on('disconnect', () =>{
        userToRemove = "user id"
        for (var key in userSockets) {
            if(userSockets[key] == socket){
                console.log(key  + " socket is removed")
                userToRemove = key
                delete userSockets[key];
                break;
            }
            
         }
         for (var key in userSockets) {
    
            userSockets[key].emit('status', {user : userToRemove, online:"offline"})
         }
    })

    
})



require('./routes/chatRoutes')(app);
require('./routes/pages')(app);
require('./routes/tokensRoutes')(app);
require('./routes/usersRoutes')(app);
require('./routes/randomStuff')(app);


