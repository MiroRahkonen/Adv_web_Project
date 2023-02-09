const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');

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
