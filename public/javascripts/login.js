const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

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
        error_message.innerHTML = data.message;
    }
    if(data.token){
        storeAuthToken(data.token);
        return window.location.href='/';
    }
})

function storeAuthToken(token){
    localStorage.setItem('auth_token',token);
}