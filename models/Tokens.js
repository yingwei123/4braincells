const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');


const TokensSchema = new mongoose.Schema({

    user:{
        type:String,
        default:"",
        required:true
    },
    date: {
        type: Date,
        default: Date.now ,
        required: true
    },
    active :{
        type:Boolean,
        default:false,
        required:true
    }
});

 const Tokens = mongoose.model('Tokens',TokensSchema);
 module.exports = Tokens
