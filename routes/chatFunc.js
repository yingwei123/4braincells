
const ChatRooms = require('../models/ChatRooms')
const Users = require('../models/Users')
const chatFunc = require('./chatFunc')
const userFunc = require('./userFunc')
const tokenFunc = require('./tokenFunc')
const e = require('express');
const {determineValid} = require("./tokenFunc");
const { compare } = require('bcryptjs')
const { findByIdAndUpdate } = require('../models/ChatRooms')


async function incommingMessage(id, personB, message, date,chatroom_id){
  
  let personB_user = await userFunc.getUserByEmail(personB)


  console.log(id + " send "+ message + " to "+ personB_user._id +" data = "+ date+ " room = "+ chatroom_id)
  let addedMessage = await addMessage(chatroom_id,message,id,personB_user)
  console.log(addedMessage)
  return addedMessage

}

async function getMessages(chatroom_id){
  try{
    console.log("getMessage= "+chatroom_id)
    let chatRoom_message = await ChatRooms.findById(chatroom_id)

     return chatRoom_message.Messages
  }catch(err){
    return err
  }
}

async function addMessage(chatroom_id, content,sender, receiver){
    try{
      const msg ={
        content:content,
        sender:sender,
        receiver: receiver._id.toString(),
        timestamp: new Date()

      }
      let updated = await ChatRooms.findByIdAndUpdate(chatroom_id,{$push:{Messages: msg}})
      return msg
    }catch(err){
      console.log(err)
    }
}

async function deleteChat(){
  try{
    return await ChatRooms.deleteMany({})
  }catch(err){
    return err
  }
}

async function findChatRoom(token, receiver){
  try{
    const valid = await tokenFunc.determineValid(token)
    if(valid){
      let userFromToken = await tokenFunc.getUserByToken(token);
      let personB_user = await userFunc.getUserByEmail(receiver)
      const userListofRooms = userFromToken.chatRooms

      console.log(userListofRooms.length)

      for(var i =0; i<userListofRooms.length; i++){
        let chatRoomToCheck = await ChatRooms.findById(userListofRooms[i])
        console.log("ChatId equal "+ chatRoomToCheck.PersonOne.id + " " + userFromToken._id)
        console.log("ChatId2 equal "+ chatRoomToCheck.PersonTwo.id + " " + personB_user._id)
        if(chatRoomToCheck.PersonOne.id == userFromToken._id
            && chatRoomToCheck.PersonTwo.id == personB_user._id
            || chatRoomToCheck.PersonOne.id == personB_user._id
            && chatRoomToCheck.PersonTwo.id == userFromToken._id){
          console.log("exist return")

          return chatRoomToCheck._id
        }
    
      }

      const newchatRoom = new ChatRooms()
      const personAToStore = {
        id: userFromToken._id,
        firstName: userFromToken.firstname,
        lastName: userFromToken.lastname
      }
      const personBToStore = {
        id: personB_user._id,
        firstName: personB_user.firstname,
        lastName: personB_user.lastname
      }
      newchatRoom.PersonOne = personAToStore
      newchatRoom.PersonTwo = personBToStore
      newchatRoom.Messages = []
      let savedNewChatRoom = await newchatRoom.save()

      await Users.findByIdAndUpdate(personAToStore.id,{$push:{chatRooms:savedNewChatRoom._id}})
      await Users.findByIdAndUpdate(personBToStore.id,{$push:{chatRooms:savedNewChatRoom._id}})

      console.log("doesnt exist create new")
      return(savedNewChatRoom._id)
    }
  }catch(err){
    console.log(err)
  }
}


async function getAllChatRoom(){
  try{
      const chats = await ChatRooms.find({})
      return (chats)
    }catch(err){
      return (err)
    }
}

async function createChatRoom(sender, receiver){
  const senderModel = {id: sender._id, firstName: sender.firstname, lastName: sender.lastname};
  const receiverModel = {id: receiver._id, firstName: receiver.firstname, lastName: receiver.lastname};
  const room = await new ChatRooms({PersonOne: senderModel, PersonTwo: receiverModel, Messages: []}).save()
  await Users.findByIdAndUpdate(sender._id,{$push:{chatRooms: room._id}})
  return room;
}

module.exports ={ addMessage,getAllChatRoom,incommingMessage,deleteChat,findChatRoom,getMessages, createChatRoom}
