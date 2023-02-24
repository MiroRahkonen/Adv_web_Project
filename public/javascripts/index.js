const logoutSection = document.getElementById('logout-section');
const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click',logout);
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const newpostSection = document.getElementById('create-post-section');
const postForm = document.getElementById('post-form');
const errorMessage = document.getElementById('error-message');
const postSection = document.getElementById('post-section');
postForm.addEventListener('submit',createPost);

let currentUsername = '';
let posts;


async function initializeHeader(){
    const authToken = localStorage.getItem('auth_token');
    let response, data;

    /*Checking if user is logged in, and hiding or showing certain
    parts of the website that the user should have access to*/
    if(!authToken){
        logoutSection.style.display = 'none';
        newpostSection.style.display = 'none';
        
        loginButton.style.display = 'inline';
        registerButton.style.display = 'inline';
    }
    else{
        logoutSection.style.display = 'inline';
        newpostSection.style.display = 'inline';
        
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
        response = await fetch('/account',{
            headers: {
                'authorization': 'Bearer ' + authToken
            }
        })
        data = await response.json();
        currentUsername = data.username;
    }
}

async function initializePosts(){
    /*postSection is used to store the HTML of all posts
    and it is edited by adding to it with innerHTML += command*/
    postSection.innerHTML = '';
    response = await fetch('/posts',{
        method: 'GET'
    })
    data = await response.json();
    posts = data;
    posts.forEach((post,index)=>{
        /*editbuttons includes the editing and deleting buttons, and they
        are shown only if the current user is the one that posted them originally*/
        let editbuttons = '';
        if(post.username === currentUsername){
            editbuttons = `
            <div class='center-align'>
                <a class="btn right red" onclick='deletePost(${index})'>
                    <i class="material-icons">delete</i>
                </a>
                <a class="btn right" onclick='editPost(${index})'>
                    <i class="material-icons">edit</i>
                </a>
            </div>`
        }
        postSection.innerHTML += `
            <div id='${index}' class='post'>
                ${editbuttons}
                <a id='title' class='post-link' href="http://localhost:3000/post/${post._id}">${post.title} </a>
                <p id='username'>Posted by: ${post.username}</p>
                <p id='message'>Message: ${post.message}</p>
            </div>
        `
    })
}


function logout(){
    localStorage.removeItem('auth_token');
    return location.reload();
}

async function createPost(event){
    event.preventDefault();
    const formData = new FormData(event.target);
    const authToken = localStorage.getItem('auth_token');
    if(!authToken){
        /* If the user isn't logged in but can still see the interface for creating a post,
        The posting is denied and the webpage is reloaded*/
        errorMessage.innerHTML = 'Unauthorized';
        location.reload();
        return;
    }

    const postDetails = {
        title: formData.get('title'),
        message: formData.get('message'),
        code: formData.get('code')
    }
    let response = await fetch('/post',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify(postDetails)
    })
    let data = await response.json();
    //If the response wasn't successful, an error message is shown
    if(response.status !== 200){
        return errorMessage.innerHTML = 'Error creating the post';
    }
    //Redirecting to the new post's page if it was successful
    return window.location.replace(`/post/${data._id}`);
}

async function editPost(i){
    /*Here we edit the existing post's container and a new form is created inside 
    where the data can be changed*/
    let postContainer = document.getElementById(i);
    postContainer.innerHTML = `
        <div>
            <form action='' id='edit-post-form-${i}'>
                <textarea name='title' form='edit-post-form-${i}' class='materialize-textarea' maxlength='50' oninput='this.style.height = this.scrollHeight + "px"'>${posts[i].title}</textarea>
                <label for='title'>Title</label>
                <p id='username'>${currentUsername}</p>
                <textarea name='message' form='edit-post-form-${i}' class='materialize-textarea' oninput='this.style.height = this.scrollHeight + "px"'>${posts[i].message}</textarea>
                <label for='message'>Message</label>
                <textarea name='code' form='edit-post-form-${i}' class='materialize-textarea' oninput='this.style.height = this.scrollHeight + "px"'>${posts[i].code}</textarea>
                <label for='code'>Code</label>
                <br><br>
                <input type='submit' class='btn' value='Save'>
            </form>
        </div>
    `
    /*Adding an eventlistener to the editing form and the edited data
    is sent to the server when it is submitted*/
    document.getElementById(`edit-post-form-${i}`).addEventListener('submit',async (event)=>{
        event.preventDefault();
        const formData = new FormData(event.target);
        const postDetails = {
            postID: posts[i]._id,
            title: formData.get('title'),
            message: formData.get('message'),
            code: formData.get('code')
        }

        let response = await fetch('/post',{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postDetails)
        })
        return initializePosts();
    })
}

async function deletePost(i){
    let response = await fetch('/post',{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({postID: posts[i]._id})
    })

    if(response.status === 200){
        document.getElementById(i).remove();
    }
}

initializeHeader();
initializePosts();