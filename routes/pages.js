const e = require('express');
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
    
    app.get("/", (req,res)=>{
        res.render("signup.ejs")
    })
}