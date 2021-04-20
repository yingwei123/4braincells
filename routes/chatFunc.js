
const ChatRooms = require('../models/ChatRooms')
const Users = require('../models/Users')
const chatFunc = require('./chatFunc')
const tokenFunc = require('./tokenFunc')
const e = require('express');

async function getChatroom(personA, personB){
    try{
      exist = await ChatRooms.findOne({PersonOne:personA, PersonTwo:personB})
     
      if(exist != undefined){
       
        return (exist.Messages)
      }
      exist2 = await ChatRooms.findOne({PersonOne:personB, PersonTwo:personA})
      if(exist2){
        return (exist.Messages)
      }
      const newchatRoom = new ChatRooms()
      newchatRoom.PersonOne = personA
      newchatRoom.PersonTwo = personB
      newchatRoom.Messages = ["New Room Created :D"]
      const  createdRoom = await newchatRoom.save()
      let userone = await Users.findOneAndUpdate(personA, {$push:{chatRooms: createdRoom._id}} )
      let usertwo = await Users.findOneAndUpdate(personB, {$push:{chatRooms: createdRoom._id}})
      
      return (createdRoom.Messages)
      
    }catch(err){
      return null
    }
  }

  async function getAllChatRoom(){
    try{
        chats = await ChatRooms.find({})
        return (chats)
      }catch(err){
        return (err)
      }
  }

  async function createChatRoom(personA,personB){
    try{
        if(determineValid(personA)){
          let user = await tokenFunc.getUserByToken(personA);
          currentUser = user.email;
          messages = await chatFunc.getChatroom(currentUser, personB)
          
        return (messages)
    
        }else{
          return 400
        }
        
        
      }catch(err){
        return err
      }

  }

module.exports ={getChatroom, getAllChatRoom, createChatRoom}