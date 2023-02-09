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

async function postToDatabase(event){
    event.preventDefault();
    const formData = new FormData(event.target);
    const authToken = localStorage.getItem('auth_token');

    const postDetails = {
        email: currentAccount,
        title: formData.get('title'),
        message: formData.get('message')
    }
    let response = await fetch('/makepost',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + authToken
        },

        body: JSON.stringify(postDetails)
    })
    let data = await response.json();
    console.log(data);
    console.log(postDetails);

    let postSegment = document.getElementById('post-segment');
    postSegment.innerHTML += `
    <div id='post'>
        <h5 id='title'> ${data.title} </h5>
        <p id='poster'> ${data.email}</p>
        <p id='message'> ${data.message}</p>
    </div>
    `

    /*
    div(id='post')
      h5(id='title') Example post 
      p(id='poster') #[strong random@account.com]
      p(id='message') I'm having problems with this code
      p(id='code'
    */

}
//InnerHTML:llä + appendiä

//Lisää code modeliin ja sivulle


checkAuthToken();