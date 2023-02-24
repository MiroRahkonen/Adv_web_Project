const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const logoutSection = document.getElementById('logout-section');
const logoutButton = document.getElementById('logout-button');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');

function storeAuthToken(token){
    localStorage.setItem('auth_token',token);
}

async function initializeHeader(){
    const authToken = localStorage.getItem('auth_token');

    if(!authToken){
        logoutSection.style.display = 'none';
    }
    else{
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
    }
}

logoutButton.addEventListener('click',()=>{
    localStorage.removeItem('auth_token');
    return document.location.reload();
})

loginForm.addEventListener('submit',async (event)=>{
    event.preventDefault();

    const formData = new FormData(event.target);
    const response = await fetch('/login',{
        method: 'POST',
        body: formData
    })
    const data = await response.json();
    console.log(data);
    if(response.status != 200){
        console.log('Invalid credentials');
        errorMessage.innerHTML = data.message;
    }
    if(data.token){
        console.log(data.token);
        storeAuthToken(data.token);
        return window.location.href='/';
    }
})

initializeHeader();