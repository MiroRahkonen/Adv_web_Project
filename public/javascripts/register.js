const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');
const logoutSection = document.getElementById('logout-section');
const logoutButton = document.getElementById('logout-button');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');

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

registerForm.addEventListener('submit',async (event)=>{
    event.preventDefault();

    const formData = new FormData(event.target);
    const response = await fetch('/register',{
        method: 'POST',
        body: formData
    })
    const data = await response.json();
    console.log(data);
    if(response.status != 200){
        errorMessage.innerHTML = data.message;
    }
    if(response.status === 200){
        return window.location.href='/login';
    }
})

initializeHeader();