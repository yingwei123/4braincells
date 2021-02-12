const express = require('express');
const app = express();
const bodyparser = require('body-parser')
const path = require('path')



app.use(bodyparser.json())
app.use(express.static(path.join(__dirname, 'views')));

app.listen(3000,()=>{
    console.log("Server is listening on port " + 3000)
})

app.get("/signin", (req,res)=>{
    res.send("signin.ejs")
})

app.get("/signup",(req,res)=>{
    res.render("signup.ejs")
})

app.get("/blank",(req,res)=>{
  
    res.render('blank.ejs')

} )

app.get("/", (req,res)=>{
    res.render("signup.ejs")
})

app.post("/signup", (req,res)=>{
    email = req.body.email
    password = req.body.password
    cpass = req.body.cpassword
   
    if(password = cpass){
        res.sendStatus(200)
    }else{
    res.sendStatus(400)
    }
    
})