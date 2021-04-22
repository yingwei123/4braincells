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

function createChatRoom(receiverID){
    //const request = new XMLHttpRequest();
    //request.onreadystatechange	=	function(){
        //if	(this.readyState	===	4	&&	this.status	===	200){
            const responseData = {messages: [{content:"hello", sender: "608099eaebddd0639887b778", receiver:"60580b85a9c98baeca2cf10e"}, {content:"hello", sender: "60580b85a9c98baeca2cf10e", receiver:"60638aa825d9c75cdcb451ff"}], receiver: {firstname: 'Ying',
                    lastname: 'Li',
                    email: 'ying@gmail.com',
                    password: '$2a$10$ujyw6GceclIBCZzqr5v62OxFdlmdEjv0dX2NF0qRuc/onfOLURG9y',
                    profilePic: 'https://i.imgur.com/bX2AcOK.png',
                    _id: "60580b85a9c98baeca2cf10e"}}
            receiver = responseData.receiver;
            let messages = ""
            for (let i = 0; i < responseData.messages.length; i++){
                const message = responseData.messages[i];
                if (userDetail._id === message.sender){
                    messages += "<div class=\"singleMessageContainerRight\"><div class=\"messageContentContainerRight\"><p class=\"senderName\">" + userDetail.firstname + " " + userDetail.lastname + "</p> <p class=\"messageContent\">" + message.content + "</p></div><img class=\"messageSenderImage rounded\" src=\""+ userDetail.profilePic +"\"></div>";
                }else {
                    messages += "<div class=\"singleMessageContainerLeft\"><img class=\"messageSenderImage rounded\" src=\"" + responseData.receiver.profilePic + "\"><div class=\"messageContentContainerLeft\"><p class=\"senderName\">" + responseData.receiver.firstname + " " + responseData.receiver.lastname + "</p> <p class=\"messageContent\">" + message.content + "</p></div></div>";
                }
            }
            const html = "<div class=\"chatProfile\"> <div class=\"chatProfileInfo\"><img class=\"receiverPicture rounded\" src=\"" +responseData.receiver.profilePic + "\"> <p class=\"receiverName\">" + responseData.receiver.firstname + " " + responseData.receiver.lastname+ "</p></div> <span class=\"block\"><i class=\"fas fa-ban fa-lg blockIcon\"></i></span></div> <div class=\"socketContainer\">" + messages +"</div> <div class=\"inputContainer\"> <div class=\"imageIconInput\"><i class=\"far fa-image fa-2x imageIcon\"></i><input class=\"inputMessage\" placeholder=\"Type here to send a message\"><i class=\"fas fa-paper-plane fa-2x sendIcon\"></i></div></div>"
            document.getElementById('rightContainer').innerHTML = html;
        //}
    //};
    //request.open("POST", "createChatRoom");
    //const messageObject = {"receiver": receiverID};
    //request.send(JSON.stringify(messageObject));
}
