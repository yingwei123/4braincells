const e = require('express');
const userFunc = require("./userFunc.js")
module.exports = app =>{


    app.get("/login",(req,res)=>{
        res.render('signin.ejs')
    } )

    app.get("/translate", (req,res)=>{
        res.render("translate.ejs")
    })

    app.get("/import",(req,res) =>{
        res.render("import.ejs")
    })

    app.get("/signup",(req,res)=>{
        res.render("signup.ejs")
    })

    app.get("/blank",(req,res)=>{
        res.render('blank.ejs')
    } )

    app.get("/home", async (req,res)=>{
        const token = req.cookies['token'];
        const data =  await userFunc.getUserHomeDetail(token);
        console.log(data)
        res.render('./Home/home.pug', data)
    })

    app.get("/", (req,res)=>{
        res.render('./Login/signin.pug')
    })
}
