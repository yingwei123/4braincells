const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');


 const ChatRoomsSchema = new mongoose.Schema({
   //add requirements


   PersonOne: {
     type:String,
     default :"",

   },

   PersonTwo:{
     type:String,
     default :"",

   },

   Messages:{
     type :[String],
     required: true,
     default :"",
   },
   



 });

 const ChatRooms = mongoose.model('ChatRooms',ChatRoomsSchema);
 module.exports = ChatRooms