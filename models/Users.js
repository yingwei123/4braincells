const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');


const UsersSchema = new mongoose.Schema({
    firstname: {
        type:String,
        default :"",
        trim:true
    },

    lastname:{
        type:String,
        default :"",
        trim:true
    },
    email:{
        type :String,
        required: true,
        default :"",
        trim:true
    },
    password:{
        type : String,
        required: true,
        default :"",

    },
    profilePic :{
        type : String,
        default : "https://i.imgur.com/bX2AcOK.png"
    },

    chatRooms :{
        type : [String],
        default : []
    },
    online :{
        type : Boolean,
        default:false
    }
});

const Users = mongoose.model('Users',UsersSchema);
module.exports = Users
