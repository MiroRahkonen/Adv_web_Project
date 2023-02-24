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
let postData;
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

/*Used to create the post dynamically by fetching the data from the database*/
async function initializePost(){
    let response = await fetch(`/getpost/${postID}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    data = await response.json();
    postData = data;
    editbuttons = '';
    if(postData.username === currentUsername){
        editbuttons = `
        <div>
            <a class='btn right red' onclick='deletePost()'>
                <i class='material-icons'>delete</i>
            </a>
            <a class='btn right' onclick='editPost()'>
                <i class='material-icons'>edit</i>
            </a>
        </div>`
    }
    post.innerHTML = 
    `<div'>
        ${editbuttons}
        <h5 id='title'>${postData.title}</h5> 
        <p id='username'>${postData.username}</p>
        <p id='message'>${postData.message}</p>
        <pre id='code' class='code'>${postData.code}</pre>
    </div>`
}

async function deletePost(i){
    let response = await fetch('/post',{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({postID: postData._id})
    })

    if(response.status === 200){
        window.location.replace('/');
    }
}

async function editPost(){
    post.innerHTML = `
    <div>
        <form action='' id='edit-post-form'>
            <textarea name='title' form='edit-post-form' class='materialize-textarea' maxlength='50' oninput='this.style.height = this.scrollHeight + "px"'>${postData.title}</textarea>
            <label for='title'>Title</label>
            <p id='username'>${currentUsername}</p>
            <textarea name='message' form='edit-post-form' class='materialize-textarea' oninput='this.style.height = this.scrollHeight + "px"'>${postData.message}</textarea>
            <label for='message'>Message</label>
            <textarea name='code' form='edit-post-form' class='materialize-textarea' oninput='this.style.height = this.scrollHeight + "px"'>${postData.code}</textarea>
            <label for='code'>Code</label>
            <br><br>
            <input type='submit' class='btn'>
        </form>
    </div>
    `
    /*Adding an eventlistener to the editing form and the edited data
    is sent to the server when it is submitted*/
    document.getElementById(`edit-post-form`).addEventListener('submit',async (event)=>{
        event.preventDefault();
        const formData = new FormData(event.target);
        const postDetails = {
            postID: postData._id,
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
        return location.reload();
    })
}
/*This creates elements for each of the comments in the database, and 
creates all the buttons and eventlisteners for the buttons*/
async function initializeComments(){
    commentSection.innerHTML = '';
    let response = await fetch(`/comments/${postID}`,{
        method: 'GET'
    })
    let data = await response.json();
    comments = data;
    comments.forEach((comment,index)=>{
        let editbuttons = ''
        /*Editbuttons includes all the functionality that the current user
        should have in interacting with the comment. The poster can edit and delete it
        and another logged in user can upvote it. Unlogged in users can't interact with it*/
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
            <p id='message'>Message: ${comment.message}</p>
            <pre id='code' class='code'>${comment.code}</pre>
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
        location.reload();
    }
}

async function editComment(i){
    let commentContainer = document.getElementById(i);
    commentContainer.innerHTML = `
        <div>
            <p id='username'>Username: ${currentUsername}</p>
            <form action='' id='edit-comment-form-${i}'>
                <textarea name='message' form='edit-comment-form-${i}' class='materialize-textarea' oninput='this.style.height = this.scrollHeight + "px"'>${comments[i].message}</textarea>
                <label for='Message'>Message</label>
                <textarea name='code' form='edit-comment-form-${i}' class='materialize-textarea' oninput='this.style.height = this.scrollHeight + "px"'>${comments[i].code}</textarea>
                <label for='code'>Code</label>
                <br><br>
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
        return location.reload();
    })
}

/*Called when the upvote button hasn't been previously pressed, and
upvote is added to the comment's counter*/
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

/*Called when the upvote button has been previously pressed and the upvote is
removed from the current user, reducing the upvote count by 1*/
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