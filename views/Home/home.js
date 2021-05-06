let chatRoom = null;
const socket = io();
const notificationIcon = document.createElement('i');
notificationIcon.classList.add("fas fa-bell")

socket.on('connect', function() {
    socket.emit('init', userDetail._id)
});
socket.on('newChatRoom', function(message) {
    const person = document.getElementById(message.receiver);
    person.id = message.room;
    person.setAttribute("data-chat", message.room);
});

socket.on('message', function(message) {
    console.log(message)
    console.log(message.chatroom_id === chatRoom.id)
    if (message.chatroom_id === chatRoom.id){
        const container = document.getElementById("socketContainer");
        const leftMessageContainer = document.createElement('div');
        const image = document.createElement("img");
        image.classList.add("messageSenderImage");
        image.classList.add("rounded");
        const messageContentContainer = document.createElement("div");
        const senderName = document.createElement('p');
        senderName.classList.add("senderName")
        const messageContent = document.createElement('p');
        messageContent.classList.add("messageContent");
        messageContent.innerHTML = message.msg;
        if (message.sender === userDetail._id){
            leftMessageContainer.classList.add("singleMessageContainerLeft");
            messageContentContainer.classList.add("messageContentContainerLeft");
            image.src = chatRoom.receiver.profilePic;
            senderName.innerHTML = chatRoom.receiver.firstname+ " "+ chatRoom.receiver.lastname;
            messageContentContainer.appendChild(senderName);
            messageContentContainer.appendChild(messageContent);
            leftMessageContainer.appendChild(image);
            leftMessageContainer.appendChild(messageContentContainer);
        }else {
            leftMessageContainer.classList.add("singleMessageContainerRight");
            messageContentContainer.classList.add("messageContentContainerRight");
            image.src = userDetail.profilePic;
            senderName.innerHTML = userDetail.firstname + " "+ userDetail.lastname;
            messageContentContainer.appendChild(senderName);
            messageContentContainer.appendChild(messageContent);
            leftMessageContainer.appendChild(messageContentContainer);
            leftMessageContainer.appendChild(image);
        }
        container.appendChild(leftMessageContainer);
    }

});

function getMessages(id) {
    console.log(id)
}
function changePeople(){
    document.getElementById('People').style.color = '#000000';
    document.getElementById('Message').style.color = '#bababa';

}
function changeMessage(){
    document.getElementById('People').style.color = '#bababa';
    document.getElementById('Message').style.color = '#000000';
}
function chatClick(element){
    if (element.hasAttribute("data-chat")){
        getChatRecords(element.getAttribute("data-chat"));
    }else {
        createChatRoom(element.id);
    }
}

function addEnterListener(){
    const sendInput = document.getElementById('sendMessageInput');
    sendInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            socket.emit('message', {user: userDetail._id, receiver: chatRoom.receiver.id, msg: sendInput.value, chatroom_id: chatRoom.id});
            sendInput.value = "";
        }
    });
}
function createChatRoom(receiverID){
    const request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if (this.readyState	===	4	&&	this.status	===	200){
            chatRoom = JSON.parse(this.response)
            const element = document.getElementById(receiverID)
            element.setAttribute("data-chat", chatRoom.id)
            element.id = chatRoom.id
            const html = "<div class=\"chatProfile\"> <div class=\"chatProfileInfo\"><img class=\"receiverPicture rounded\" src=\"" +chatRoom.receiver.profilePic + "\"> <p class=\"receiverName\">" + chatRoom.receiver.firstname + " " + chatRoom.receiver.lastname+ "</p></div> <span class=\"block\"><i class=\"fas fa-ban fa-lg blockIcon\"></i></span></div> <div class=\"socketContainer\"></div> <div class=\"inputContainer\"> <div class=\"imageIconInput\"><i class=\"far fa-image fa-2x imageIcon\"></i><input id=\"sendMessageInput\" class=\"inputMessage\" placeholder=\"Type here to send a message\"><i class=\"fas fa-paper-plane fa-2x sendIcon\"></i></div></div>"
            document.getElementById('rightContainer').innerHTML = html;
            addEnterListener();
            socket.emit('newChatRoom', {user: userDetail_id, receiver: receiverID, room: chatRoom.id})
        }
    }
    request.open("POST", "/newChat");
    const messageObject = {"receiver": receiverID, "sender": userDetail._id};
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify(messageObject));
}

function getChatRecords(chatId){
    const request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            chatRoom = JSON.parse(this.response);
            console.log(chatRoom)
            let messages = ""
            for (let i = 0; i < chatRoom.messages.length; i++){
                const message = chatRoom.messages[i];
                if (userDetail._id === message.sender){
                    messages += "<div class=\"singleMessageContainerRight\"><div class=\"messageContentContainerRight\"><p class=\"senderName\">" + userDetail.firstname + " " + userDetail.lastname + "</p> <p class=\"messageContent\">" + message.content + "</p></div><img class=\"messageSenderImage rounded\" src=\""+ userDetail.profilePic +"\"></div>";
                }else {
                    messages += "<div class=\"singleMessageContainerLeft\"><img class=\"messageSenderImage rounded\" src=\"" + chatRoom.receiver.profilePic + "\"><div class=\"messageContentContainerLeft\"><p class=\"senderName\">" + chatRoom.receiver.firstname + " " + chatRoom.receiver.lastname + "</p> <p class=\"messageContent\">" + message.content + "</p></div></div>";
                }
            }
            const html = "<div class=\"chatProfile\"> <div class=\"chatProfileInfo\"><img class=\"receiverPicture rounded\" src=\"" +chatRoom.receiver.profilePic + "\"> <p class=\"receiverName\">" + chatRoom.receiver.firstname + " " + chatRoom.receiver.lastname+ "</p></div> <span class=\"block\"><i class=\"fas fa-ban fa-lg blockIcon\"></i></span></div> <div id=\"socketContainer\" class=\"socketContainer\">" + messages +"</div> <div class=\"inputContainer\"> <div class=\"imageIconInput\"><i class=\"far fa-image fa-2x imageIcon\"></i><input id=\"sendMessageInput\" class=\"inputMessage\" placeholder=\"Type here to send a message\"><i class=\"fas fa-paper-plane fa-2x sendIcon\"></i></div></div>"
            document.getElementById('rightContainer').innerHTML = html;
            addEnterListener();
        }
    };
    request.open("POST", "/getChatRecords");
    request.setRequestHeader("Content-Type", "application/json");
    const messageObject = {'id': chatId};
    request.send(JSON.stringify(messageObject));
}
