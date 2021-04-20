const e = require('express');
const userFunc = require("./userFunc.js")



module.exports = app =>{

//user register(currently using for sign up)
app.post("/createUser", async(req,res) =>{
    try{
    email = req.body.email
    password = req.body.password
    fname = req.body.firstname
    lname = req.body.lastname
    let created = await userFunc.createUser(email,password,fname,lname)
    res.sendStatus(created)
    }catch(err){
        res.send(err)
    }

  
  })
  
  //user Login
  app.post("/login", async(req,res) =>{
      try{
    email = req.body.email
    password = req.body.password

    let login = await userFunc.login(email,password)
    res.send(login)
      }catch(err){
          res.send(err)
      }
  
  })

  //return all users for testing purposes
  app.get("/adminTest", async(req,res)=>{

    let allUsers = await userFunc.getAllUsers()
    res.send(allUsers)
  })

  //get the user by id
  app.post("/getUserById",async(req,res) =>{

    let users = await userFunc.getUserById(req.body.id)
    res.send(users)
  })

  //get all email, need valid token
  app.get("/allEmail/:token", async(req,res) =>{
      try{
    let allEmail = await userFunc.getAllEmail(req.params.token)
    res.send(allEmail)
      }catch(err){
          res.send(err)
      }
  })

  //sign up using email, password, and cpass, not currently in use
  app.post("/signup", (req,res)=>{
      try{
    email = req.body.email
    password = req.body.password
    cpass = req.body.cpassword
   
    if(password = cpass){
        res.sendStatus(200)
    }else{
    res.sendStatus(400)
    }
}catch(err){
    res.send(err)
}
    
})
}