const logoutSegment = document.getElementById('logout-segment');
const logoutButton = document.getElementById('logout-button');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button')
const newpostSegment = document.getElementById('create-post-segment');
const postForm = document.getElementById('post-form');
postForm.addEventListener('submit',createPost);

let currentAccountEmail;



async function checkAuthToken(){
    const authToken = localStorage.getItem('auth_token');
    if(!authToken){
        return;
    }

    //Showing the logout button and section to create a new post
    logoutSegment.removeAttribute('hidden');
    newpostSegment.removeAttribute('hidden');
    //Hiding the register and login buttons
    loginButton.style.visibility = 'hidden';
    registerButton.style.visibility = 'hidden';

    let response = await fetch('/getaccount',{
        method: 'GET',
        headers: {
            'authorization': 'Bearer ' + authToken
        }
    })
    let data = await response.json();
    currentAccountEmail = data.email;
}


logoutButton.addEventListener('click',()=>{
    localStorage.removeItem('auth_token');
    return window.location.href='/';
})

function createPost(event){
    event.preventDefault();
    console.log('AAAAAAAAA');
}

checkAuthToken();