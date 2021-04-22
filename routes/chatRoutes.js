
const chatFunc = require('./chatFunc')
const e = require('express');

module.exports = app =>{
   
      //get all chatrooms
      app.get("/allChatRoom", async(req,res) =>{
       
        let allChat = await chatFunc.getAllChatRoom()
            res.send(allChat)
      })

      app.get("/deleteAllChatroom",async(req,res) =>{
        let deleted = await chatFunc.deleteChat()
        res.send(deleted)
      })

      // create a chat room if one doesnt exist and send message, if exist send message between
      app.post("/getChatRoom", async(req,res)=>{

          try{
            personA = req.body.personA
            personB = req.body.personB

            

            let chatRoom = await chatFunc.findChatRoom(personA, personB)
            res.send(chatRoom)
          }catch(err){
              res.send(err)
          }
      
      })

      app.post("/getMessages", async(req,res)=>{

        try{
          console.log("trigger")
          let chatRoom = await chatFunc.getMessages(req.body.chatroom_id)
          console.log(chatRoom)
          res.send(chatRoom)
        }catch(err){
            res.send(err)
        }
    
    })

      app.post("/findChatroom", async(req,res)=>{
        try{
  
        let x = await chatFunc.findChatRoom(req.body.token, req.body.reciever)
        console.log(x)
        res.send(x)
        }catch(err){
          res.send(err)
        }
      })
}