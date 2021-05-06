const Users = require('../models/Users')
const Tokens = require('../models/Tokens')
const tokenFunc = require("./tokenFunc.js")
const bcrypt = require('bcryptjs');
const ChatRooms = require("../models/ChatRooms");

//Create a user 
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

//get user by id
async function getUserById(id){
    try{
        user = await Users.findById(id)

        return user
      }catch(err){
        return err
      }

}

//get all users for testing purposes
// async function getAllUsers(){
//     try{
//         allUser = await Users.find({})
//         return allUser
//       }catch(err){
//         return error
//       }

// }

//login using email and password
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

//get all emails
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

//get all users by email
async function getUserByEmail(email){
  try{
    let users = await Users.findOne({email:email})
    return users
  }catch(err){
    return err
  }
}

//delete all user func
// async function deleteAll(){
//   try{
//     let x = await Users.deleteMany({})
//     return x
//   }catch(err){
//     console.log(err)
//   }
// }

//gets the users home details
async function getUserHomeDetail(token){
    const exits = await Tokens.findById(token)
    const userToFind = await Users.findById(exits.user)
    const chatList = []
    const chatting = new Set()
    for (let i = 0; i< userToFind.chatRooms.length; i++){
        const chatInstance = await ChatRooms.findById(userToFind.chatRooms[i])
        const receiverP = chatInstance.PersonOne.id === userToFind._id.toString() ? chatInstance.PersonTwo.id : chatInstance.PersonOne.id;
        const receiver = await Users.findById(receiverP);
        const chatRes = {
            id: chatInstance._id,
            messages: chatInstance.Messages,
            receiver: {
                id: receiver._id,
                firstname: receiver.firstname,
                lastname: receiver.lastname,
                profilePic: receiver.profilePic,
                online: receiver.online
            }
        }
        chatList.push(chatRes);
        chatting.add(receiverP)
    }
    //chatList.sort(function(a,b){return b.lastActivity.getTime() - a.lastActivity.getTime()});
    const online = []
    const onlineUsers = await Users.find({online: true})
    for (let i = 0; i< onlineUsers.length; i++){
        const onlineUser = onlineUsers[i]
        if (!chatting.has(onlineUser._id.toString()) && onlineUser._id !== userToFind._id){
            online.push({
                id: onlineUser._id,
                firstname: onlineUser.firstname,
                lastname: onlineUser.lastname,
                profilePic: onlineUser.profilePic,
                online: onlineUser.online
            })
        }
    }
    return {user: userToFind, chat: chatList, onlineUsers: online}
}
// module.exports = {createUser, getUserById, getAllUsers, login, getAllEmail,getUserByEmail,deleteAll, getUserHomeDetail}
module.exports = {createUser, getUserById, login, getAllEmail,getUserByEmail, getUserHomeDetail}
