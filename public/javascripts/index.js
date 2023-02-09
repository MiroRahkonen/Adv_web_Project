const logoutSegment = document.getElementById('logout-segment');
const logoutButton = document.getElementById('logout-button');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button')
const newpostSegment = document.getElementById('create-post-segment');
const postForm = document.getElementById('post-form');
postForm.addEventListener('submit',postToDatabase);

let currentAccount;



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
    currentAccount = data.email;
}


logoutButton.addEventListener('click',()=>{
    localStorage.removeItem('auth_token');
    return window.location.href='/';
})

function postToDatabase(event){
    event.preventDefault();
    const formData = new FormData(event.target);

    console.log(currentAccount);
    console.log(formData.get('title'));
    console.log(formData.get('message'));
    const postDetails = {
        email: currentAccount,
        title: formData.get('title'),
        message: formData.get('message')
    }
    console.log(postDetails);
}

checkAuthToken();