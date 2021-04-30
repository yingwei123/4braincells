const socket = io();


socket.on('message',message=>{
    console.log(message)
})

socket.on('connect', function() {
    console.log('Connected to server');
    fetch('/getUserByToken')
    .then(response => response.json())
    .then((data)=>{
        console.log(data)
        socket.emit('init', {user:data})
    });

    
});


function test(msg, reciever, chatroom_id){
    // console.log("Client msg "+ msg)
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