
const ChatRooms = require('../models/ChatRooms')
const Users = require('../models/Users')
const chatFunc = require('./chatFunc')
const userFunc = require('./userFunc')
const tokenFunc = require('./tokenFunc')
const e = require('express');
const {determineValid} = require("./tokenFunc");
const { compare } = require('bcryptjs')
const { findByIdAndUpdate } = require('../models/ChatRooms')


async function incommingMessage(token, personB, message, date,chatroom_id){
  let currentUser = await tokenFunc.getUserByToken(token)
  let personB_user = await userFunc.getUserByEmail(personB)
  // const personB_id = personB_user._id
  // const personA_id = currentUser._id

  console.log(currentUser._id + " send "+ message + " to "+ personB_user._id +" data = "+ date+ " room = "+ chatroom_id)
  let addedMessage = await addMessage(chatroom_id,message,currentUser,personB_user)
  console.log(addedMessage)
  return addedMessage
  // let messages = await getChatroom(currentUser, personB_user, message,date)

  // console.log(messages)

  // console.log(personA_id + " send "+ message + " to "+ personB_id)
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
        sender:sender._id,
        receiver: receiver._id,
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


      for(var i =0; i<userListofRooms.length; i++){
        let chatRoomToCheck = await ChatRooms.findById(userListofRooms[i])
        const idToCheck = personB_user._id
        if(chatRoomToCheck.PersonOne.id === userFromToken._id
            && chatRoomToCheck.PersonTwo.id === idToCheck
            || chatRoomToCheck.PersonOne.id === idToCheck
            && chatRoomToCheck.PersonTwo.id === userFromToken._id){
          console.log("exist return")

          return chatRoomToCheck._id
        }
        console.log("compare "+ chatRoomToCheck.PersonOne.id + " to "+ idToCheck)
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

      await Users.findByIdAndUpdate(personAToStore.id,{chatRooms:savedNewChatRoom._id})
      await Users.findByIdAndUpdate(personBToStore.id,{chatRooms:savedNewChatRoom._id})

      console.log("doesnt exist create new")
      return(savedNewChatRoom._id)
    }
  }catch(err){
    console.log(err)
  }
}

// async function getChatroom(personA, personB,message,date){
//     // console.log(personA + " " + personB)
//     try{
//       exist = await ChatRooms.findOne({id:personA._id, idTwo:personB._id})
//       exist2 = await ChatRooms.findOne({id:personB._id, idTwo:personA._id})
//       console.log(exist)
//       if(exist2 == undefined && exist == undefined){
//         const newchatRoom = new ChatRooms()

//         personAToStore = {
//           id: personA._id,
//           firstName: personA.firstname,
//           lastName: personA.lastname
//         }
//         personBToStore = {
//           id: personB._id,
//           firstName: personB.firstname,
//           lastName: personB.lastname
//         }
//         msgItem = {
//           content: message,
//           sender: personA._id,
//           receiver : personB._id,
//           timestamp :new Date()

//         }
//         // console.log(personAToStore)
//         newchatRoom.PersonOne = personAToStore
//         newchatRoom.PersonTwo = personBToStore
//         // newchatRoom.PersonOne.id = personA._id
//         // newchatRoom.PersonOne.firstName = personA.firstName
//         // newchatRoom.PersonOne.lastname = personA.lastname
//         // newchatRoom.PersonTwo.id = personB._id
//         // newchatRoom.PersonTwo.firstName = personB.firstName
//         // newchatRoom.PersonTwo.lastname = personB.lastname



//         // newchatRoom.PersonOne= {
//         //   id: personA._id,
//         //   firstName: personA.firstname,
//         //   lastName: personA.lastname
//         // }

//         // newchatRoom.PersonTwo = {
//         //   id: personB._id,
//         //   firstName: personB.firstname,
//         //   lastName: personB.lastname
//         // }

//         newchatRoom.Messages = [msgItem]
//         let savedNewChatRoom =await newchatRoom.save()
//         userOne = await Users.findByIdAndUpdate(personAToStore.id,{chatRooms:savedNewChatRoom._id})
//         userTwo = await Users.findByIdAndUpdate(personBToStore.id,{chatRooms:savedNewChatRoom._id})
//         console.log(newchatRoom)

//       }else{
//         if(exist != undefined){
//           console.log(exist)
//         }else{
//           console.log(exist2)
//         }
//       }


//       // if(exist != undefined){

//       //   return (exist.Messages)
//       // }
//       // exist2 = await ChatRooms.findOne({PersonOne:personB, PersonTwo:personA})
//       // if(exist2){
//       //   return (exist.Messages)
//       // }
//       // const newchatRoom = new ChatRooms()
//       // newchatRoom.PersonOne = personA
//       // newchatRoom.PersonTwo = personB
//       // newchatRoom.Messages = ["New Room Created :D"]
//       // const  createdRoom = await newchatRoom.save()
//       // let userone = await Users.findOneAndUpdate(personA, {$push:{chatRooms: createdRoom._id}} )
//       // let usertwo = await Users.findOneAndUpdate(personB, {$push:{chatRooms: createdRoom._id}})

//       // return (createdRoom.Messages)

//     }catch(err){
//       console.log(err)
//       return null
//     }
//   }

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
