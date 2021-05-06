
const ChatRooms = require('../models/ChatRooms')
const Users = require('../models/Users')
const chatFunc = require('./chatFunc')
const userFunc = require('./userFunc')
const tokenFunc = require('./tokenFunc')
const e = require('express');
const {determineValid} = require("./tokenFunc");
const { compare } = require('bcryptjs')
const { findByIdAndUpdate } = require('../models/ChatRooms')


async function incommingMessage(id, personB, message,chatroom_id){
  let personB_user = await Users.findById(personB)
  console.log(id + " send "+ message + " to "+ personB_user._id + " room = "+ chatroom_id)
  let addedMessage = await addMessage(chatroom_id,message,id)
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

async function addMessage(chatroom_id, content,sender){
    try{
      const msg ={
        content:content,
        sender:sender,
        timestamp: new Date()
      }
      await ChatRooms.findOneAndUpdate({_id: chatroom_id},{$push:{Messages: msg}})
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

async function getChatRecord(id, user) {
  const room = await ChatRooms.findById(id);
  const receiver = user._id.toString() === room.PersonOne.id ? room.PersonTwo.id : room.PersonOne.id;
  const receiverBackend = await Users.findById(receiver);
  console.log(room)
  return {
    id: room._id,
    messages: room.Messages,
    receiver: {
      id: receiverBackend._id,
      firstname: receiverBackend.firstname,
      lastname: receiverBackend.lastname,
      profilePic: receiverBackend.profilePic,
      online: receiverBackend.online
    }

  }
}

async function createChatRoom(sender, receiver){
  const getSender = await Users.findById(sender)
  const getReceiver = await Users.findById(receiver)
  const senderModel = {id: sender, firstName: getSender.firstname, lastName: getSender.lastname};
  const receiverModel = {id: receiver, firstName: getReceiver.firstname, lastName: getReceiver.lastname};
  const newRoom = await new ChatRooms({PersonOne: senderModel, PersonTwo: receiverModel, Messages: []}).save()
  await Users.findByIdAndUpdate(sender,{$push:{chatRooms: newRoom._id}})
  await Users.findByIdAndUpdate(receiver,{$push:{chatRooms: newRoom._id}})
  return {
    id: newRoom._id,
    messages: [],
    receiver: {
      id: getReceiver._id,
      firstname: getReceiver.firstname,
      lastname: getReceiver.lastname,
      profilePic: getReceiver.profilePic,
      online: getReceiver.online
    }
  };
}

module.exports ={ addMessage,getAllChatRoom,incommingMessage,deleteChat,findChatRoom,getMessages, createChatRoom, getChatRecord}
