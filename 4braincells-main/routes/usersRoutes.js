const e = require('express');
const userFunc = require("./userFunc.js")
const tokenFunc = require("./tokenFunc")
const multer = require('multer');
const path = require('path');
const Users = require('../models/Users')

const storage = multer.diskStorage({
    destination: './views/uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
}).single('ProPic');

module.exports = app =>{
    //when the user changes their profile picture
    app.post('/upload', async(req, res) =>{
        upload(req, res, (err) => {
            if(err){
                res.render('picturechange.ejs', {
                    msg: err
                });
            }
            else{
                if(req.file == undefined){
                    res.render('picturechange.ejs', {
                        msg: 'Error: No File Selected'
                    });
                }
                else{
                    var tJSON = JSON.stringify(req.cookies)
                    var token = tJSON.split(':')[1].split('"')[1]


                    tokenFunc.getUserByToken(token).then(function (res) {
                        id = res._id
                        Users.findOneAndUpdate({_id:id}, {profilePic:`/uploads/${req.file.filename}`})
                    })
                    res.render('picturechange.ejs', {
                        msg: 'File Uploaded!',
                        file: `./uploads/${req.file.filename}`
                    });
                }
            }
        })
    });

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

    app.get("/deleteAll",async(req,res)=>{
        let deleteAll = await userFunc.deleteAll()
        res.send(200)
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
