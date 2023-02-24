const logoutSection = document.getElementById('logout-section');
const logoutButton = document.getElementById('logout-button');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const post = document.getElementById('post');
const createCommentSection = document.getElementById('create-comment');
const commentForm = document.getElementById('comment-form');
commentForm.addEventListener('submit',postComment);
const commentSection = document.getElementById('comment-section');

let currentUsername = '';
const url = window.location.href;
const spliturl = url.split('/');
const postID = spliturl[4];
let comments;


logoutButton.addEventListener('click',()=>{
    localStorage.removeItem('auth_token');
    return document.location.reload();
})

async function initializeHeader(){
    const authToken = localStorage.getItem('auth_token');

    if(!authToken){
        logoutSection.style.display = 'none';
        createCommentSection.style.display = 'none';
    }
    else{
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
        let response = await fetch('/account',{
            headers: {
                'authorization': 'Bearer ' + authToken
            }
        })
        let data = await response.json();
        currentUsername = data.username;
    }
}

async function initializePost(){
    let response = await fetch(`/getpost/${postID}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    data = await response.json();
    post.innerHTML = 
    `<div'>
        <h5 id='title'>${data.title}</h5> 
        <p id='username'>${data.username}</p>
        <p id='message'>${data.message}</p>
        <p id='code' class='code'>${data.code}</p>
    </div>`
}

async function initializeComments(){
    commentSection.innerHTML = '';
    let response = await fetch(`/comments/${postID}`,{
        method: 'GET'
    })
    let data = await response.json();
    comments = data;
    comments.forEach((comment,index)=>{
        let editbuttons = ''
        if(comment.username === currentUsername){
            editbuttons = `
            <div>
                <a class='btn right red' onclick='deleteComment(${index})'>
                    <i class='material-icons'>delete</i>
                </a>
                <a class='btn right' onclick='editComment(${index})'>
                    <i class='material-icons'>edit</i>
                </a>
                <p class='right'>Upvotes: ${comment.upvotes} </p>
            </div>`
        }
        else if(currentUsername !== ''){
            if(comment.upvoters.includes(currentUsername)){
                editbuttons = `
                <div>
                    <a id='remove-upvote-button-${index}' class='btn right orange' onclick='removeUpvote(${index})'>
                        <i class='material-icons'>thumb_up</i>
                    </a>
                    <p class='right'>Upvotes: ${comment.upvotes} </p>
                </div>`
            }
            else{
                editbuttons = `
                <div>
                    <a id='upvote-button-${index}' class='btn right grey' onclick='upvote(${index})'>
                        <i class='material-icons'>thumb_up</i>
                    </a>
                    <p class='right'>Upvotes: ${comment.upvotes} </p>
                </div>`
            }
        }
        

        commentSection.innerHTML += `
        
        <div id='${index}' class='comment'>
            ${editbuttons}
            <p id='username'>Username: ${comment.username}</p>
            <p id='message'>${comment.message}</p>
            <p id='code' class='code'>${comment.code}</p>
        </div>
        `
    })
}


async function postComment(event){
    event.preventDefault();
    const authToken = localStorage.getItem('auth_token');
    const formData = new FormData(event.target);

    const commentDetails = {
        postID: postID,
        username: currentUsername,
        message: formData.get('message'),
        code: formData.get('code')
    }
    response = await fetch('/comment',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify(commentDetails)
    })
    if(response.status !== 200){
        return errorMessage.innerHTML = 'Error creating the post';
    }
    else if(response.status === 200){
        initializeComments();
    }
}

async function editComment(i){
    let commentContainer = document.getElementById(i);
    commentContainer.innerHTML = `
        <div>
            <p id='username'>${currentUsername}</p>
            <form action='' id='edit-comment-form-${i}'>
                <textarea name='message' form='edit-comment-form-${i}' class='materialize-textarea' placeholder='Write your message here...'>${comments[i].message}</textarea>
                <textarea name='code' form='edit-comment-form-${i}' class='materialize-textarea' placeholder='Put useful code here...'>${comments[i].code}</textarea>
                <input type='submit' class='btn'>
            </form>
        </div>
    `
    document.getElementById(`edit-comment-form-${i}`).addEventListener('submit',async (event)=>{
        event.preventDefault();
        const formData = new FormData(event.target);
        const commentDetails = {
            commentID: comments[i]._id,
            message: formData.get('message'),
            code: formData.get('code')
        }

        let response = await fetch('/comment',{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentDetails)
        })
        return initializeComments();
    })
}



async function upvote(i){
    let commentDetails = {
        commentID: comments[i]._id,
        username: currentUsername,
        upvote: 1
    }

    let response = await fetch('/votecomment',{
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentDetails)
    })

    if(response.status === 200){
        initializeComments();
    }
}

async function removeUpvote(i){
    let commentDetails = {
        commentID: comments[i]._id,
        username: currentUsername,
        upvote: -1
    }

    let response = await fetch('/votecomment',{
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentDetails)
    })

    if(response.status === 200){
        initializeComments();
    }
}

async function deleteComment(i){
    let response = await fetch('/comment',{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({commentID: comments[i]._id})
    })

    if(response.status === 200){
        document.getElementById(i).remove();
    }    
}


initializeHeader();
initializePost();
initializeComments();