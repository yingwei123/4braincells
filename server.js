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
    socket.on('init',async user => {
        socket.userId = user;
        const getUser = await Users.findByIdAndUpdate(user,{online:true});
        const userRes = {
            id: getUser._id,
            online: getUser.online,
            firstname: getUser.firstname,
            lastname: getUser.lastname,
            profilePic: getUser.profilePic
        }
        console.log(userRes)
        for (let key in userSockets) {
            userSockets[key].emit('status', {user : userRes, online: true});
        }
        userSockets[user] = socket;

    })

    //for chatroom to update  message
    socket.on('newChatRoom', message => {
        if (userSockets.hasOwnProperty(message.receiver)) userSockets[message.receiver].emit('newChatRoom', message);
    })

    //Chat message when a user sends another user a message
    socket.on('message', async message => {
        let msg = await chatFunc.incommingMessage(message.user, message.receiver,message.msg,message.chatroom_id);
        userSockets[message.user].emit('message', message);
        if ( userSockets.hasOwnProperty(message.receiver))  userSockets[message.receiver].emit('message', message);

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
        rooms.delete(socket.userId)
        const userToRemove = socket.userId

        if(userSockets.hasOwnProperty(socket.userId)){
            console.log(socket.userId  + " socket is removed")
            const getUser = await Users.findByIdAndUpdate(socket.userId,{online:false})
            delete userSockets[socket.userId];
            const userResponse = {
                id: getUser._id,
                online: getUser.online,
                firstname: getUser.firstname,
                lastname: getUser.lastname,
                profilePic: getUser.profilePic
            }
            for (let key in userSockets) {
                userSockets[key].emit('status', {user : userResponse, online: false});
            }
        }
        const stuff = userPlayer[userToRemove]
        if(stuff){
            delete userPlayer[userToRemove]
            for(let key in userSockets){
                userSockets[key].emit('leftGame',{user:userToRemove, x:stuff.x,y:stuff.y} )
            }
        }

    })


})



require('./routes/chatRoutes')(app);
require('./routes/pages')(app);
require('./routes/tokensRoutes')(app);
require('./routes/usersRoutes')(app);
// require('./routes/randomStuff')(app);


