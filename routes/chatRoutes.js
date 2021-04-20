
const chatFunc = require('./chatFunc')
const e = require('express');

module.exports = app =>{
   
      //get all chatrooms
      app.get("/allChatRoom", async(req,res) =>{
       
        let allChat = await chatFunc.getAllChatRoom()
            res.send(allChat)
      })

      // create a chat room if one doesnt exist and send message, if exist send message between
      app.post("/getChatRoom", async(req,res)=>{
          try{
        personA = req.body.personA
        personB = req.body.personB

        let chatRoom = await chatFunc.createChatRoom(personA, personB)
        res.send(chatRoom)
          }catch(err){
              res.send(err)
          }
      
      })

}