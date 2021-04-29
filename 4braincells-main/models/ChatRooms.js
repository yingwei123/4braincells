const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');


 const ChatRoomsSchema = new mongoose.Schema({
   //add requirements


   PersonOne: {
       id: {
           type: String,
           required: true
       },
       firstName: {
           type: String,
       },
       lastName: {
           type: String,
       },
   },

   PersonTwo:{
       id: {
           type: String,
           required: true,
       },
       firstName: {
           type: String,
       },
       lastName: {
           type: String,
       },
   },

   Messages:[{
       content:{
           type: String,
           required: true,
           default :"",
       },
       sender:{

               type: String,
               required: true

       },
       receiver: {

               type: String,
               required: true

       },
       timestamp: {
           type: Date,
           required: true
       }
   }],
    //  lastActivity: {
    //      type: [String],
    //      required: true
    //  }


 });

 const ChatRooms = mongoose.model('ChatRooms',ChatRoomsSchema);
 module.exports = ChatRooms
