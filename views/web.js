const socket = io();


socket.on('message',message=>{
    console.log(message)
})

socket.on('connect', async function() {
    await fetch('/getUserByToken')
    .then(response => response.json())
    .then((data)=>{
        socket.emit('init', {user:data})
    });

    
});
socket.on('leftGame', async message =>{
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(message.x, message.y, 20, 20);
    ctx.beginPath();
    delete players[message.user]

})
socket.on('newConnect',async message => {
    for(var i = 0; i<message.length;i++){
     let user = message[i]
     await addPlayer(user.x,user.y,"red",20,20, user.user)
    }
})

// socket.on('update', message =>{
//     console.log(message)
// })

socket.on('status',message=>{
    console.log(message)
})

 async function start(){
    x = Math.floor(Math.random() * 500) + 1
    y = Math.floor(Math.random() * 500) + 1
     let start = await initialStart(x,y).then(response =>JSON.stringify(response)).then((data) =>{
         return data
     })
     console.log(start)
   return start
   
}

async function initialStart(x,y){
    let userId = await fetch('/getUserByToken')
    .then(response => response.json())
    .then((data)=>{
        globalUserID = data
        socket.emit('gameStart', {user:data,x:x,y:y})
        return {user:data,x:x,y:y}
    });
    return userId
}


function test(msg, reciever, chatroom_id){
    date = new Date()
    fetch('/getUserByToken')
    .then(response => response.json())
    .then((data)=>{
        socket.emit('msg', {user:data, msg:msg, reciever:reciever, chatroom_id:chatroom_id,date: date.toTimeString()})
    });
    
}

async function getChatRoomId(reciever){
    console.log("First")
    let chatId = await fetch('/findChatroom', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({reciever:reciever}),
        })
        .then(response => response.json())
        .then(data => {
            console.log("chatroom "  +data)
            return data
        }).catch(err=>{
            console.log(err)
        })
    return chatId
}

async function getUserId(email){
    let userID = await fetch('/getUserByEmail', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email:email}),
        })
        .then(response => response.json())
        .then(data => {
            // console.log("User "  +data)
            return data
        }).catch(err=>{
            console.log(err)
        })
    return userID
}




//game stuff
function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;    
    this.color = color

}   
   
   async function getKeyAndMove(e){			
   
    var key_code=e.which||e.keyCode;
    switch(key_code){
        case 37: //left arrow key
            await moveLeft(globalUserID);
            break;
        case 38: //Up arrow key
            await moveUp(globalUserID);
            break;
        case 39: //right arrow key
            await moveRight(globalUserID);
            break;
        case 40: //down arrow key
            await moveDown(globalUserID);
            break;						
    }
}
async function moveLeft(userID){
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");

            if(players[userID].x-3 > 0 && players[userID].x-3<597){
                await  socket.emit('movement', {user:userID,x:players[userID].x-3,y:players[userID].y})
            }
   
}
async function moveRight(userID){
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");


        if(players[userID].x+3 > 0 && players[userID].x+3<597){
            await  socket.emit('movement', {user:userID,x:players[userID].x+3,y:players[userID].y})
        }
   
}
async function moveUp(userID){
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");


            if(players[userID].y-3 > 0 && players[userID].y-3<597){
                await  socket.emit('movement', {user:userID,x:players[userID].x,y:players[userID].y-3})
            }
    

}
async function moveDown(userID){
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");

 
        if(players[userID].y+3 > 0 && players[userID].y+3<597){
           await  socket.emit('movement', {user:userID,x:players[userID].x,y:players[userID].y+3})
        }
  
}

async function addPlayer(x,y,color,width,height, id){
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");

    exist = players[id]
    if(exist != undefined){
        ctx.clearRect(exist.x, exist.y, exist.width, exist.height);
        ctx.beginPath();
    }
    myGamePiece = new component(width,height, color, x, y);
    players[id] = myGamePiece

    
    ctx.beginPath();
    ctx.rect(myGamePiece.x, myGamePiece.y, myGamePiece.width, myGamePiece.height);
    ctx.fillStyle = myGamePiece.color;
    ctx.fill();
}