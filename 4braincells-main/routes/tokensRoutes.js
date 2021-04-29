const e = require('express');
const tokenFunc = require('./tokenFunc')

module.exports = app =>{

    //not currently in use
    app.post("/TestingFunction",async(req,res) =>{
        try{
          let user = await tokenFunc.delteTokenByUserId(req.body.user_id) 
          if(user == null){
            return res.status(400).send("This is a invalid Token")
          }
          return res.send(user)
        }catch(err){
          return res.send(err)
        }
      })
      
      //checks to see if the token is still valid
      app.get("/validate/:token", async(req,res)=>{
        try{
          token = req.params.token
          valid = await tokenFunc.determineValid(token)
          return res.send({valid:valid})
      
        }catch(err){
          res.send(err)
        }
      })
      
      //deletes the token and logs out the user
      app.get("/logout/:token", async(req,res) =>{
        try{
          worked = await tokenFunc.logOut(req.params.token)
          return res.send({worked:worked})
        }catch(err){
          res.send(err)
        }
      })

      //gets all the tokens for testing purposes
      app.get("/adminToken", async(req,res)=>{
        try{
          allToken = await tokenFunc.getAllToken()
          res.send(allToken)
        }catch(err){
          res.send(err)
        }
      })
      
}