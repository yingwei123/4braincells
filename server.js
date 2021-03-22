const express = require('express');
const app = express();
const bodyparser = require('body-parser')
const path = require('path')
const fetch = require("node-fetch");
const translate = require('@vitalets/google-translate-api');
const { count } = require('console');
const Airtable = require('airtable');
const { json } = require('body-parser');
var mongoose = require('mongoose');
const Users = require('./models/Users')
const Tokens = require('./models/Tokens')
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/4braincells',  { useNewUrlParser: true,useUnifiedTopology: true })

require('dotenv').config()

app.use(bodyparser.json())
app.use(express.static(path.join(__dirname, 'views')));

app.listen(process.env.PORT || 3000,()=>{
    console.log("Server is listening on port " + 3000)
})

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

app.post("/graphName", (req,res)=>{
  graph = req.body.name;
  if(graph === 'Survey One'){
    content ={
      x : [10223,10224,10225,10226],
      y :[1,2,3,4]
    } 
    res.send(JSON.stringify(content))
  }
  else if(graph === 'Survey Two'){
    content ={
      x : [11220,14555,14222,12333],
      y :[5,2,3,4]
    } 
    res.send(JSON.stringify(content))
  }
  else if(graph === 'Survey Three'){
    content ={
      x : [11223,10224,10125,15226],
      y :[6,2,3,2]
    } 
    res.send(JSON.stringify(content))
  }
})

app.post("/twit", (req,res) =>{
    fetch('https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=NobodySpecialO&count=2', {
  method: 'GET', 
  headers: {
    'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAAXGMwEAAAAAynZLC2DcmdPgMpCxJ4JjuaiENDk%3DIKgusS5I46HBGjpcIPNnrHLbNycPyFMvWwUCSpve8DJZq7fPGK',
  },
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
  res.send(data)
})
.catch((error) => {
  console.error('Error:', error);
});

    
})

function translateText(text,cb){
 
    if(text != null){
        translate(text, {to: 'en'}).then(translated => {
          
          return cb([translated.text,translated.from.language.iso])
      }).catch(err => {
          console.error(err);
      });
    }
   return null
}

function parseQuestions(body,trigger){
  translatedQuestions = []
  var prom = new Promise((resolve, reject) => {
  let count = 0
  body.forEach(element => translateText(element[1], function(data){
    translatedQuestions.push([element[0],data[0]])
    count+=1
    if(count == body.length){
      translate(trigger, {to: 'en'}).then(translated => {
          
        return translated.from.language.iso
      }).then((data)=>{
        resolve([translatedQuestions,data])
      })
      
    }
  }));  
  

});
return prom;

}

function createEntry(baseId,SurveyName,translated,lang){
  const base = new Airtable({ apiKey: "keyjLZvySgdKfMZfy" }).base(baseId)
 
  var json = { };

  for(var i = 0, l = translated.length; i < l; i++) {
    json[translated[i][0]] = translated[i][1];
  }
  json["language"] = lang
  json["completed"] ="yes"
  base(SurveyName).create([
    {
      "fields": json
    },
    
  ], function(err, records) {
    if (err) {
      console.error(err);
      return;
    }
    records.forEach(function (record) {
      console.log(record);
    });
  });
}

function createDeadentry(baseId,SurveyName){
  const base = new Airtable({ apiKey: "keyjLZvySgdKfMZfy" }).base(baseId)
 
 
  base(SurveyName).create([
    {
      "fields": {
        "completed":"no"
       
      }
    },
    
  ], function(err, records) {
    if (err) {
      console.error(err);
      return;
    }
    records.forEach(function (record) {
      console.log(record);
    });
  });
}

app.post("/translate", (req,res)=>{

  if(req.body.completed== "yes"){
      info = req.body.info
      responses = []
      for(var i in info){
        responses.push([i,info[i]])
      }
      
      let x = parseQuestions(responses, req.body.trigger)
      x.then((data)=>{
        translated = data[0]
        SurveyName = req.body.surveyName
        lang = data[1]
        base = req.body.base
        
        
        createEntry(base,SurveyName,translated,lang)
        
      })


 

  res.sendStatus(200)
  }else{
    base = req.body.base
    SurveyName = req.body.surveyName
    createDeadentry(base,SurveyName)
    res.sendStatus(200)
  }

  

  
})

//user register
app.post("/createUser", async(req,res) =>{
  email = req.body.email
  password = req.body.password
  fname = req.body.firstname
  lname = req.body.lastname
  try{
    let exist = await Users.findOne({ email });
    console.log(exist)
    if(exist){
      res.status(400).send("User Already Exist")
    }else{
      hashedPassword = await bcrypt.hash(password,10)
      const newUser = new Users();
      newUser.email = email
      newUser.password = hashedPassword
      newUser.firstname = fname
      newUser.lastname = lname
      const user = await newUser.save();
      res.status(201).send(user)
    }
    
  }catch(err){
    res.send(err)
  }

})

//user Login
app.post("/login", async(req,res) =>{
  email = req.body.email
  password = req.body.password
  try{
    let userToGet = await Users.find({email:email})
    let isUser = await bcrypt.compare(password,userToGet[0].password)
    
    if(isUser){
      let deleteCurrent = await delteTokenByUserId(userToGet[0]._id.toString())
      console.log(deleteCurrent)
      const newToken = new Tokens();
      newToken.user = userToGet[0]._id
      newToken.active = true
      const token = await newToken.save();

      return res.status(200).send({token:token._id})
    }
    res.send({token:null})
  }catch(err){
    res.send(err)
  }

})

app.get("/adminTest", async(req,res)=>{
  try{
    allUser = await Users.find({})
    res.send(allUser)
  }catch(err){
    res.send(err)
  }
})

app.get("/adminToken", async(req,res)=>{
  try{
    allToken = await Tokens.find({})
    res.send(allToken)
  }catch(err){
    res.send(err)
  }
})

//get user by token_id
async function getUserByToken(token_id){
  try{
    token = await Tokens.findById(token_id)
    if(token.active == false){
      return null
    }
    user_id = token.user
    userToFind = await Users.findById(user_id)

    return userToFind
  }catch(err){
    return null
  }
}

app.post("/getUserById",async(req,res) =>{
  try{
    user = await Users.findById(req.body.id)
    
    res.send(user)
  }catch(err){
    res.send(err)
  }
})

app.post("/TestingFunction",async(req,res) =>{
  try{
    let user = await delteTokenByUserId(req.body.user_id) 
    if(user == null){
      return res.status(400).send("This is a invalid Token")
    }
    return res.send(user)
  }catch(err){
    return res.send(err)
  }
})

async function delteTokenByUserId(user_id){
  try{  
    token = await Tokens.findOneAndDelete(user_id)
   
    return true
  }catch(err){
    return err
  }
}

//token valid for 24hrs
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

app.get("/validate/:token", async(req,res)=>{
  try{
    token = req.params.token
    valid = await determineValid(token)
    return res.send({valid:valid})

  }catch(err){
    res.send(err)
  }
})

app.get("/logout/:token", async(req,res) =>{
  try{
    worked = await logOut(req.params.token)
    return res.send({worked:worked})
  }catch(err){
    res.send(err)
  }
})

async function logOut(token_id){
  try{
    token = await Tokens.findByIdAndDelete(token_id)
    return true
  }catch(err){
    return err
  }
}