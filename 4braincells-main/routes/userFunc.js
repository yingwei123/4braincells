const Users = require('../models/Users')
const Tokens = require('../models/Tokens')
const tokenFunc = require("./tokenFunc.js")
const bcrypt = require('bcryptjs');
const ChatRooms = require("../models/ChatRooms");

async function createUser(email,password,fname,lname){
    try{
        let exist = await Users.findOne({ email });
        if(exist){
            console.log("User Exist")
            return 400
        }else{
            const hashedPassword = await bcrypt.hashSync(password,10)
            const newUser = new Users();
            newUser.email = email
            newUser.password = hashedPassword
            newUser.firstname = fname
            newUser.lastname = lname
            const user = await newUser.save();
            const newToken = new Tokens();
            newToken.user = user._id
            newToken.active = true
            const token = await newToken.save();
            return token._id
        }

      }catch(err){
        console.log(err)
        return null
      }
}

async function getUserById(id){
    try{
        user = await Users.findById(id)

        return user
      }catch(err){
        return err
      }

}

async function getAllUsers(){
    try{
        allUser = await Users.find({})
        return allUser
      }catch(err){
        return error
      }

}

async function login(email,password){
    try{
        let userToGet = await Users.findOne({email:email})
        let isUser = await bcrypt.compareSync(password,userToGet.password)
        if(isUser){
          let deleteCurrent = await tokenFunc.delteTokenByUserId(userToGet._id)
          console.log(deleteCurrent)
          const newToken = new Tokens();
          newToken.user = userToGet._id
          newToken.active = true
          const token = await newToken.save();
          return ({token:token._id})
        }
        return({token:null})
      }catch(err){
        return({token:null})
      }
}

async function getAllEmail(tok){
    try{
        valid = await tokenFunc.determineValid(tok)
        if(valid){
          user = await Users.find({})
          emailList = []
          await user.forEach(users => emailList.push(users.email))

          return ({userList:emailList})
        }
        return ("Token not valid")
      }catch(err){
        return err
      }
}

async function getUserByEmail(email){
  try{
    let users = await Users.findOne({email:email})
    return users
  }catch(err){
    return err
  }
}
async function deleteAll(){
  try{
    let x = await Users.deleteMany({})
    return x
  }catch(err){
    console.log(err)
  }
}

async function getUserHomeDetail(token){
    const exits = await Tokens.findById(token)
    const userToFind = await Users.findById(exits.user)
    const chatList = []
    const chatting = new Set()
    for (let i = 0; i< userToFind.chatRooms.length; i++){
        const chatInstance = await ChatRooms.findOne({_id: userToFind.chatRooms[0]})
        const receiver = chatInstance.PersonOne.id === userToFind._id ? chatInstance.PersonTwo.id : chatInstance.PersonOne.id
        chatList.push(chatInstance);
        chatting.add(receiver)
    }
    //chatList.sort(function(a,b){return b.lastActivity.getTime() - a.lastActivity.getTime()});
    let receiver = {}
    if (chatList.length !== 0){
        const latestMessage = chatList[0];
        const receiverID = latestMessage.PersonOne.id === userToFind._id ? latestMessage.PersonTwo.id : latestMessage.PersonOne.id
        receiver = await Users.findById(receiverID)
    }
    const online = []
    const tokens = await Tokens.find({})
    console.log(tokens)
    for (let i = 0; i< tokens.length; i++){
        const onlineUser = await Users.findOne({_id: tokens[i].user})
        if (!chatting.has(onlineUser) && onlineUser._id !== userToFind._id){
            online.push(onlineUser)
        }
    }
    return {user: userToFind, chat: chatList, onlineUsers: online, receiver: receiver}
}
module.exports = {createUser, getUserById, getAllUsers, login, getAllEmail,getUserByEmail,deleteAll, getUserHomeDetail}
