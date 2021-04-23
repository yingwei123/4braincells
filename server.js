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


mongoose.connect(process.env.MONGODB_URI||'mongodb://mongo:27017/4braincells',  { useNewUrlParser: true,useUnifiedTopology: true })
mongoose.set('useFindAndModify', false);

io.on('connection',async socket=>{
    console.log("Socket Connected")

    // socket.broadcast.emit('initial_connect',"initial backend")
    // socket.broadcast.emit('message',"User has joined");
    socket.on('init',message =>{
        console.log(message)
        // console.log(socket)
    })

    socket.on('msg', async message=>{

        // socket.broadcast.emit("message", message)
        let msg = await chatFunc.incommingMessage(message.user, message.reciever,message.msg, message.date,message.chatroom_id)
        io.emit('message',msg);
        // io.emit('message',message);
    })
    
})



require('./routes/chatRoutes')(app);
require('./routes/pages')(app);
require('./routes/tokensRoutes')(app);
require('./routes/usersRoutes')(app);
require('./routes/randomStuff')(app);


