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
    postSection.innerHTML = '';
    response = await fetch('/posts',{
        method: 'GET'
    })
    data = await response.json();
    posts = data;
    posts.forEach((post,index)=>{
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
                <a id='title' class='post-link' href="http://localhost:3000/post/${post._id}"> ${post.title} </a>
                <p id='username'> ${post.username}</p>
                <p id='message'> ${post.message}</p>
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
    if(response.status !== 200){
        return errorMessage.innerHTML = 'Error creating the post';
    }
    //Redirecting to the new post's page
    return window.location.replace(`/post/${data._id}`);
}

async function editPost(i){
    let postContainer = document.getElementById(i);
    postContainer.innerHTML = `
        <div>
            <form action='' id='edit-post-form-${i}'>
                <textarea name='title' form='edit-post-form-${i}' class='materialize-textarea' maxlength='50'>${posts[i].title}</textarea>
                <p id='username'>${currentUsername}</p>
                <textarea name='message' form='edit-post-form-${i}' class='materialize-textarea' placeholder='Write your message here...'>${posts[i].message}</textarea>
                <textarea name='code' form='edit-post-form-${i}' class='materialize-textarea' placeholder='Put useful code here...'>${posts[i].code}</textarea>
                <input type='submit' class='btn'>
            </form>
        </div>
    `
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