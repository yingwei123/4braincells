const Tokens = require('../models/Tokens')
const Users = require('../models/Users')
 
 async function delteTokenByUserId(user_id){
    try{  
      token = await Tokens.findOneAndDelete(user_id)
     
      return true
    }catch(err){
      return err
    }
  }

  async function determineValid(token_id){
    try{
      token = await Tokens.findById(token_id)
      if(token.active == true){
        date = Date.now()
        let timeDiff = date - token.date
        if(timeDiff > 60 * 60 * 1000*24){
          updatedToken = await Tokens.findByIdAndUpdate(token_id,{active:false})
          return false
        }else{
          return true
        }
      }
      return false
    }catch(err){
      return false
    }
  }

  async function logOut(token_id){
    try{
      token = await Tokens.findByIdAndDelete(token_id)
      return true
    }catch(err){
      return err
    }
  }

  async function getUserByToken(token_id){
    try{
      token = await Tokens.findById(token_id)
      if(token.active == false){
        console.log("Token not active")
        return null
      }
      user_id = token.user
      
      userToFind = await Users.findById(user_id)
      
  
      return userToFind
    }catch(err){
      return null
    }
  }

  async function getAllToken(){
    allToken = await Tokens.find({})
    return allToken
  }

  module.exports = { delteTokenByUserId,determineValid,getUserByToken,logOut ,getAllToken};