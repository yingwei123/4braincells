const express = require('express');
const app = express();
const bodyparser = require('body-parser')
const path = require('path')
const fetch = require("node-fetch");
const translate = require('@vitalets/google-translate-api');
const { count } = require('console');
const Airtable = require('airtable');
const { json } = require('body-parser');
require('dotenv').config()

app.use(bodyparser.json())
app.use(express.static(path.join(__dirname, 'views')));

app.listen(3000,()=>{
    console.log("Server is listening on port " + 3000)
})

app.get("/signin", (req,res)=>{
    res.send("signin.ejs")
})

app.get("/translate", (req,res)=>{
  res.render("translate.ejs")
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
  const base = new Airtable({ apiKey: keyjLZvySgdKfMZfy }).base(baseId)
 
  var json = { };

  for(var i = 0, l = translated.length; i < l; i++) {
    json[translated[i][0]] = translated[i][1];
  }
  json["language"] = lang
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
  const base = new Airtable({ apiKey: keyjLZvySgdKfMZfy }).base(baseId)
 
 
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