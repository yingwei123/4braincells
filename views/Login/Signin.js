let login = true;
let showPass = false;
async function sendRequest(){
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const name = document.getElementById("name").value.trim();
    if(checkEmail(email) && checkPass(password)){
        if (name) {
            const request = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email:email, password:password, name:name}),
            });

        }else {
            const request = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email:email, password:password})
            });
            if (!request.ok){
                document.getElementById("InvalidLogin").style.display = "block";
            }
            else if (request.redirected) {
                window.location.href = request.url;
            }
        }
    }
}
function passwordVisibility(){
    if (showPass){
        document.getElementById("hide").style.display = "block";
        document.getElementById("show").style.display = "none";
        document.getElementById("password").type = "password";
    }
    else {
        document.getElementById("show").style.display = "block";
        document.getElementById("hide").style.display = "none";
        document.getElementById("password").type = "text";
        document.getElementById("showPass").style.marginLeft = "23px";
    }
    showPass = !showPass;
}
function checkEmail(input){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const valid = re.test(String(input).toLowerCase());
    if(!valid){
        document.getElementById("email").style.borderColor = "red";
        document.getElementById("invalidEmail").style.display = "block";
    }else {
        document.getElementById("email").style.borderColor = "gray";
        document.getElementById("invalidEmail").style.display = "none";
    }
    return valid;
}

function checkPass(input){
    const invalid = input.length < 8;
    if (invalid){
        document.getElementById("invalidPass").textContent = "Password less than 8 characters"
        document.getElementById("invalidPass").style.display = "block";
        document.getElementById("password").style.borderColor = "red";
    }else {
        document.getElementById("invalidPass").style.display = "none";
        document.getElementById("password").style.borderColor = "gray";
    }
    return !invalid;
}
function switchLogins(){
    if(!login){
        document.getElementById("name").style.display = "none";
        document.getElementById("login").textContent= "Login";
        document.getElementById("loginButton").textContent= "Login";
        document.getElementById("line").style.width = "80px";
        document.getElementById("switchText").textContent = "Don't have an account?";
        document.getElementById("switch").textContent = "Create One";
        document.getElementById("name").value = ""
    }else {
        document.getElementById("name").style.display = "block";
        document.getElementById("login").textContent= "Create Account";
        document.getElementById("loginButton").textContent= "Create";
        document.getElementById("line").style.width = "215px";
        document.getElementById("switchText").textContent = "Have an account?";
        document.getElementById("switch").textContent = "Login";
    }
    login = !login;
}
