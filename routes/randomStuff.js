// const express = require('express');

// const translate = require('@vitalets/google-translate-api');
// const Airtable = require('airtable');
// require('dotenv').config()
// module.exports = app =>{

// app.post("/graphName", (req,res)=>{
//     graph = req.body.name;
//     if(graph === 'Survey One'){
//       content ={
//         x : [10223,10224,10225,10226],
//         y :[1,2,3,4]
//       } 
//       res.send(JSON.stringify(content))
//     }
//     else if(graph === 'Survey Two'){
//       content ={
//         x : [11220,14555,14222,12333],
//         y :[5,2,3,4]
//       } 
//       res.send(JSON.stringify(content))
//     }
//     else if(graph === 'Survey Three'){
//       content ={
//         x : [11223,10224,10125,15226],
//         y :[6,2,3,2]
//       } 
//       res.send(JSON.stringify(content))
//     }
//   })
  
  
//   function translateText(text,cb){
   
//       if(text != null){
//           translate(text, {to: 'en'}).then(translated => {
            
//             return cb([translated.text,translated.from.language.iso])
//         }).catch(err => {
//             console.error(err);
//         });
//       }
//      return null
//   }
  
//   function parseQuestions(body,trigger){
//     translatedQuestions = []
//     var prom = new Promise((resolve, reject) => {
//     let count = 0
//     body.forEach(element => translateText(element[1], function(data){
//       translatedQuestions.push([element[0],data[0]])
//       count+=1
//       if(count == body.length){
//         translate(trigger, {to: 'en'}).then(translated => {
            
//           return translated.from.language.iso
//         }).then((data)=>{
//           resolve([translatedQuestions,data])
//         })
        
//       }
//     }));  
    
  
//   });
//   return prom;
  
//   }
  
//   function createEntry(baseId,SurveyName,translated,lang){
//     const base = new Airtable({ apiKey: "keyjLZvySgdKfMZfy" }).base(baseId)
   
//     var json = { };
  
//     for(var i = 0, l = translated.length; i < l; i++) {
//       json[translated[i][0]] = translated[i][1];
//     }
//     json["language"] = lang
//     json["completed"] ="yes"
//     base(SurveyName).create([
//       {
//         "fields": json
//       },
      
//     ], function(err, records) {
//       if (err) {
//         console.error(err);
//         return;
//       }
//       records.forEach(function (record) {
//         console.log(record);
//       });
//     });
//   }
  
//   function createDeadentry(baseId,SurveyName){
//     const base = new Airtable({ apiKey: "keyjLZvySgdKfMZfy" }).base(baseId)
   
   
//     base(SurveyName).create([
//       {
//         "fields": {
//           "completed":"no"
         
//         }
//       },
      
//     ], function(err, records) {
//       if (err) {
//         console.error(err);
//         return;
//       }
//       records.forEach(function (record) {
//         console.log(record);
//       });
//     });
//   }
  
//   app.post("/translate", (req,res)=>{
  
//     if(req.body.completed== "yes"){
//         info = req.body.info
//         responses = []
//         for(var i in info){
//           responses.push([i,info[i]])
//         }
        
//         let x = parseQuestions(responses, req.body.trigger)
//         x.then((data)=>{
//           translated = data[0]
//           SurveyName = req.body.surveyName
//           lang = data[1]
//           base = req.body.base
          
          
//           createEntry(base,SurveyName,translated,lang)
          
//         })
  
  
   
  
//     res.sendStatus(200)
//     }else{
//       base = req.body.base
//       SurveyName = req.body.surveyName
//       createDeadentry(base,SurveyName)
//       res.sendStatus(200)
//     }
  
    
  
    
//   })

// }