const Users = require('../models/Users')
const ChatRooms = require('../models/ChatRooms')
const tokFunc = require('./tokenFunc')
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
    //     app.post("/getChatRoom", async(req,res)=>{

    //       try{
    //         personA = req.body.personA
    //         personB = req.body.personB



    //         let chatRoom = await chatFunc.findChatRoom(personA, personB)
    //         res.send(chatRoom)
    //       }catch(err){
    //           res.send(err)
    //       }

    // })
    // app.post("/newChat", async(req,res)=>{
    //     try{
    //         console.log(req.body)
    //         const sender = await Users.findOne({_id: req.body.sender});
    //         const receiver = await Users.findOne({_id: req.body.receiver});
    //         const room = await chatFunc.createChatRoom(sender, receiver)
    //         console.log({receiver: receiver, chatRoom: room})
    //         res.send({receiver: receiver, chatRoom: room});
    //     }catch(err){
    //         console.log(err)
    //         res.send(err)
    //     }
    // })

    app.post("/getMessages", async(req,res)=>{
        try{
            // console.log(req.body.chatroom_id)
            let chatRoom = await chatFunc.getMessages(req.body.chatroom_id)
            console.log(chatRoom)
            res.send(chatRoom)
        }catch(err){
            res.send(err)
        }
    })
    app.post("/getChatRecords", async(req,res)=>{

        try{
            const user = await tokFunc.getUserByToken(req.cookies['token'])
            if (user){
                const response = await chatFunc.getChatRecord(req.body.id, user)
                console.log(response)
                res.send(response);
            }else {
                res.sendStatus(404);
            }
        }catch(err){
            console.log(err)
            res.sendStatus(404);
        }
    })

    app.post("/newChat", async(req,res)=>{
        try{
            let response = await chatFunc.createChatRoom(req.body.sender, req.body.receiver)
            console.log(response)
            res.send(response)
        }catch(err){
            console.log(err)
            res.sendStatus(404)
        }
    })

    app.post("/findChatroom", async(req,res)=>{
        try{
            let x = await chatFunc.findChatRoom(req.cookies['token'], req.body.reciever)
            console.log(x)
            res.send(x)
        }catch(err){
            console.log(err)
            res.send(err)
        }
    })
}
