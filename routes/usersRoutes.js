const e = require('express');
const userFunc = require("./userFunc.js")
const tokenFunc = require("./tokenFunc.js")


module.exports = app =>{

//user register(currently using for sign up)
    app.post("/signup", async(req,res) =>{
        try{
            const email = req.body.email
            const password = req.body.password
            const fullName = req.body.name
            const [firstName, lastName] = fullName.split(' ', 2)
            const created = await userFunc.createUser(email, password, firstName, lastName)
            if (created){
                res.cookie('token', created)
                res.redirect(302, '/home');
            }else {
                res.sendStatus(404)
            }
        }catch(err){
            console.log(err)
            res.sendStatus(404)
        }


    })

  //user Login
    app.post("/login", async(req,res) =>{
        try{
            const email = req.body.email;
            const password = req.body.password;

            let login = await userFunc.login(email,password);
            if(login.token){
                res.cookie('token', login.token)
                res.redirect(302, '/home');
            }
            else {
                res.sendStatus(404)
            }
        }catch(err){
            res.sendStatus(404)
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
    app.get("/getUserByToken", async(req,res) =>{
        try{
            let user = await tokenFunc.getUserByToken(req.cookies['token'])
            res.send(user._id)
        }catch(err){
            res.send(err)
        }
    })
    app.get("/deleteAll",async(req,res)=>{
        let deleteAll = await userFunc.deleteAll()
        res.send(200)
    })

    //get all email, need valid token
    app.get("/allEmail", async(req,res) =>{
      try{
         
    let allEmail = await userFunc.getAllEmail(req.cookies['token'])
    res.send(allEmail)
      }catch(err){
          res.send(err)
      }
    })

    //sign up using email, password, and cpass, not currently in use
    /*app.post("/signup", (req,res)=>{
        try{
            const email = req.body.email
            const password = req.body.password
            const cpass = req.body.cpassword

            if(password === cpass){
                res.sendStatus(200)
            }else{
            res.sendStatus(400)
            }
        }catch(err){
            res.send(err)
        }
    })*/
}
