const socket = io();


socket.on('message',message=>{
    console.log(message)
})

socket.on('connect', function() {
    console.log('Connected to server');
    socket.emit('init', {user:localStorage.getItem("token")})
});


function test(msg, reciever, chatroom_id){
    // console.log("Client msg "+ msg)
    date = new Date()
    socket.emit('msg', {user:localStorage.getItem("token"), msg:msg, reciever:reciever, chatroom_id:chatroom_id,date: date.toTimeString()})
}

async function getChatRoomId(token, reciever){
    let chatId = await fetch('/findChatroom', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({token : token,reciever:reciever}),
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