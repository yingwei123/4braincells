let chatRoom = null;
const socket = io();
const notificationIcon = document.createElement('i');
notificationIcon.classList.add("fas")
notificationIcon.classList.add("fa-bell")

socket.on('connect', function() {
    socket.emit('init', userDetail.id)
});
socket.on('newChatRoom', function(message) {
    console.log(message)
    userDetail.chatRooms.push({id: message.room, receiver: message.receiver});
    const person = document.getElementById(message.user);
    person.id = message.room;
    person.setAttribute("data-chat", message.room);
});
socket.on('status', function(message) {
    console.log(message)
    const chatList = userDetail.chatRooms;
    const find = chatList.find(room => room.receiver === message.user.id);
    const onlineUser = document.getElementById(message.user.id);
    if (message.online){
        if (!find && !onlineUser){
            console.log("no chat room")
            const messageBlock = document.createElement('div');
            messageBlock.classList.add('recentMessageBlock');
            messageBlock.classList.add('clickable');
            messageBlock.id = message.user.id;
            messageBlock.onclick = function () {
                chatClick(messageBlock);
            };
            const messageSplit = document.createElement("div");
            messageSplit.classList.add("recentMessageSplit");
            const image = document.createElement('img');
            image.classList.add('rounded');
            image.classList.add('recentProfile');
            image.src = message.user.profilePic;
            const nameMessage = document.createElement('div');
            nameMessage.classList.add("nameMessage");
            const name = document.createElement('p');
            name.classList.add('recentName');
            name.innerHTML = message.user.firstname + " " + message.user.lastname;
            const msg = document.createElement('p');
            msg.classList.add('recentMessage');
            msg.innerHTML = "Start a Conversation";
            const notification = document.createElement('div');
            notification.classList.add("timeNotification")
            nameMessage.appendChild(name);
            nameMessage.appendChild(msg);
            messageSplit.appendChild(image);
            messageSplit.appendChild(nameMessage);
            messageSplit.appendChild(notification)
            messageBlock.appendChild(messageSplit);
            document.getElementById("recentMessageContainer").appendChild(messageBlock);
        }
    }else {
        if (find){
            const id = find.id;
            console.log(id)
            const elem = document.getElementById(id);
            elem.remove();
        }else {
            console.log(onlineUser);
            onlineUser.remove();
        }
    }
});

socket.on('message', function(message) {
    console.log(message)
    if (chatRoom !== null && message.chatroom_id === chatRoom.id){
        const container = document.getElementById("socketContainer");
        const messagesHtml = createMessageHTML(message.chatroom_id, message.msg, message.receiver);
        container.appendChild(messagesHtml);
        const doc = document.getElementById(message.chatroom_id);
        doc.getElementsByClassName("recentMessage")[0].innerHTML = message.msg;
    }else {
        const chat = document.getElementById(message.chatroom_id);
        console.log(chat)
        const notificationElem = chat.getElementsByClassName("timeNotification")[0];
        const textElem = chat.getElementsByClassName("recentMessage")[0];
        notificationElem.appendChild(notificationIcon);
        textElem.innerHTML = message.msg;
        chat.remove()
        document.getElementById("recentMessageContainer").prepend(chat)
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

function createMessageHTML (id, message, receiver) {
    const MessageContainer = document.createElement('div');
    const image = document.createElement("img");
    image.classList.add("messageSenderImage");
    image.classList.add("rounded");
    const messageContentContainer = document.createElement("div");
    const senderName = document.createElement('p');
    senderName.classList.add("senderName")
    const messageContent = document.createElement('p');
    messageContent.classList.add("messageContent");
    messageContent.innerHTML = message;
    if (receiver === userDetail.id){
        MessageContainer.classList.add("singleMessageContainerLeft");
        messageContentContainer.classList.add("messageContentContainerLeft");
        image.src = chatRoom.receiver.profilePic;
        senderName.innerHTML = chatRoom.receiver.firstname+ " "+ chatRoom.receiver.lastname;
        messageContentContainer.appendChild(senderName);
        messageContentContainer.appendChild(messageContent);
        MessageContainer.appendChild(image);
        MessageContainer.appendChild(messageContentContainer);
    }else {
        MessageContainer.classList.add("singleMessageContainerRight");
        messageContentContainer.classList.add("messageContentContainerRight");
        image.src = userDetail.profilePic;
        senderName.innerHTML = userDetail.firstname + " "+ userDetail.lastname;
        messageContentContainer.appendChild(senderName);
        messageContentContainer.appendChild(messageContent);
        MessageContainer.appendChild(messageContentContainer);
        MessageContainer.appendChild(image);
    }
    return MessageContainer;
}

function addEnterListener(){
    const sendInput = document.getElementById('sendMessageInput');
    sendInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            socket.emit('message', {user: userDetail.id, receiver: chatRoom.receiver.id, msg: sendInput.value, chatroom_id: chatRoom.id});
            sendInput.value = "";
        }
    });
}

function sendMessage() {
    const sendInput = document.getElementById('sendMessageInput');
    socket.emit('message', {user: userDetail.id, receiver: chatRoom.receiver.id, msg: sendInput.value, chatroom_id: chatRoom.id});
    sendInput.value = "";
}
function createChatRoom(receiverID){
    const request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if (this.readyState	===	4	&&	this.status	===	200){
            chatRoom = JSON.parse(this.response)
            const element = document.getElementById(receiverID);
            element.setAttribute("data-chat", chatRoom.id);
            element.id = chatRoom.id;
            userDetail.chatRooms.push({id: chatRoom.id, receiver: chatRoom.receiver.id});
            document.getElementById('rightContainer').innerHTML = "<div class=\"chatProfile\"> <div class=\"chatProfileInfo\"><img class=\"receiverPicture rounded\" src=\"" + chatRoom.receiver.profilePic + "\"> <p class=\"receiverName\">" + chatRoom.receiver.firstname + " " + chatRoom.receiver.lastname + "</p></div> <span class=\"block\"><i class=\"fas fa-ban fa-lg blockIcon\"></i></span></div> <div id=\"socketContainer\" class=\"socketContainer\"></div> <div class=\"inputContainer\"> <div class=\"imageIconInput\"><i class=\"far fa-image fa-2x imageIcon\"></i><input id=\"sendMessageInput\" class=\"inputMessage\" placeholder=\"Type here to send a message\"><i class=\"fas fa-paper-plane fa-2x sendIcon\" onclick=\"sendMessage()\"></i></div></div>";
            addEnterListener();
            socket.emit('newChatRoom', {user: userDetail.id, receiver: receiverID, room: chatRoom.id});
        }
    }
    request.open("POST", "/newChat");
    const messageObject = {"receiver": receiverID, "sender": userDetail.id};
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify(messageObject));
}
async function logout() {
    const request = await fetch('/logout', {method: 'POST'});
    if (request.ok) {
        window.location.href = request.url;
    }
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
                if (userDetail.id === message.sender){
                    messages += "<div class=\"singleMessageContainerRight\"><div class=\"messageContentContainerRight\"><p class=\"senderName\">" + userDetail.firstname + " " + userDetail.lastname + "</p> <p class=\"messageContent\">" + message.content + "</p></div><img class=\"messageSenderImage rounded\" src=\""+ userDetail.profilePic +"\"></div>";
                }else {
                    messages += "<div class=\"singleMessageContainerLeft\"><img class=\"messageSenderImage rounded\" src=\"" + chatRoom.receiver.profilePic + "\"><div class=\"messageContentContainerLeft\"><p class=\"senderName\">" + chatRoom.receiver.firstname + " " + chatRoom.receiver.lastname + "</p> <p class=\"messageContent\">" + message.content + "</p></div></div>";
                }
            }
            document.getElementById('rightContainer').innerHTML = "<div class=\"chatProfile\"> <div class=\"chatProfileInfo\"><img class=\"receiverPicture rounded\" src=\"" + chatRoom.receiver.profilePic + "\"> <p class=\"receiverName\">" + chatRoom.receiver.firstname + " " + chatRoom.receiver.lastname + "</p></div> <span class=\"block\"><i class=\"fas fa-ban fa-lg blockIcon\"></i></span></div> <div id=\"socketContainer\" class=\"socketContainer\">" + messages + "</div> <div class=\"inputContainer\"> <div class=\"imageIconInput\"><i class=\"far fa-image fa-2x imageIcon\"></i><input id=\"sendMessageInput\" class=\"inputMessage\" placeholder=\"Type here to send a message\"><i class=\"fas fa-paper-plane fa-2x sendIcon\" onclick=\"sendMessage()\"></i></div></div>";
            const notification = document.getElementById(chatId).getElementsByClassName("fa-bell")[0];
            if (notification) notification.remove()

            addEnterListener();
        }
    };
    request.open("POST", "/getChatRecords");
    request.setRequestHeader("Content-Type", "application/json");
    const messageObject = {'id': chatId};
    request.send(JSON.stringify(messageObject));
}
