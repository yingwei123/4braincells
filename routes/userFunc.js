const Users = require('../models/Users')
const Tokens = require('../models/Tokens')
const tokenFunc = require("./tokenFunc.js")
const bcrypt = require('bcryptjs');

async function createUser(email,password,fname,lname){
    try{
        let exist = await Users.findOne({ email });
        
        if(exist){
          console.log("User Exist")
          return 400
        }else{
          hashedPassword = await bcrypt.hashSync(password,10)
          const newUser = new Users();
          newUser.email = email
          newUser.password = hashedPassword
          newUser.firstname = fname
          newUser.lastname = lname
          const user = await newUser.save();
          return 201
        }
        
      }catch(err){
        console.log("trigger")
        console.log(err)
        return 400
      }
}

async function getUserById(id){
    try{
        user = await Users.findById(id)
        
        return user
      }catch(err){
        return err
      }

}

async function getAllUsers(){
    try{
        allUser = await Users.find({})
        return allUser
      }catch(err){
        return error
      }

}

async function login(email,password){
    try{
        let userToGet = await Users.find({email:email})
       
        let isUser = await bcrypt.compareSync(password,userToGet[0].password)
      //   console.log("Pog 1")
        if(isUser){
          // console.log("Pog 2")
          let deleteCurrent = await tokenFunc.delteTokenByUserId(userToGet[0]._id.toString())
          // console.log("Pog ?")
          console.log(deleteCurrent)
          const newToken = new Tokens();
          newToken.user = userToGet[0]._id
          newToken.active = true
          const token = await newToken.save();
          // console.log("Pog 3")
          return ({token:token._id})
        }
      //   console.log("Pog 4")
        return({token:null})
      }catch(err){
       return err
      }
}

async function getAllEmail(tok){
    try{
        valid = await tokenFunc.determineValid(tok)
        if(valid){
          user = await Users.find({})
          emailList = []
          await user.forEach(users => emailList.push(users.email))
    
          return ({userList:emailList})
        }
        return ("Token not valid")
      }catch(err){
        return err
      }
}
module.exports = {createUser, getUserById, getAllUsers, login, getAllEmail}