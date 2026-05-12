import {signupTxt, loginTxt, authPop, loginWrapper, signupWrapper, navBar, forumMenu, 
        searchMenu, profileMenu, main, profileSection, profileInfos, loginBtn, greeting, 
        profileName, profileSurname, profileEmail, profileDescription, profileImage, signupBtn, 
        error_userExists, customUploader, imgUploader, formSubmitBtn, modifyName, modifyDescription, 
        modifyEmail, modifyImage, modifySurname, error_wrongCred, cancelBtn, profileModBtn, profileForm, 
        forumSection, searchSection, forumBody, sendNewPostBtn, cancelNewPostBtn,
        newPostPopup, postStatusMessage, createNewPostBtn, pageWrapper, postNavPages, forumNextBtn, forumPrevBtn, newPostDescription, newPostTitle} from "./dom.js"

import {loadForum, login, signUp, uploadForm, post} from './API.js'

/* ==============
        Main
================= */
// const menuSections = [profileMenu, forumMenu, searchMenu]
// let currentSection = ""

/* ------ General ------- */
const STATE = {
    forumPage: 1,
    maxPage: 1,
    currentUser: null
}


const show = (el) => {
    el.forEach(el => {
        el.style.display = 'flex'
        el.style.opacity = 1
    })
};

const hide = (el) => {
    el.forEach(el => {
        el.style.display = 'none'
        el.style.opacity = 0
    })
};

function displayInfos(userObj){
    // Display user infos in inputs
    greeting.textContent = `Hi ${userObj["firstName"]} !`
    profileName.textContent = userObj["firstName"];
    profileSurname.textContent = userObj["lastName"];
    profileEmail.textContent = userObj["email"];
    profileDescription.textContent = userObj["description"]
    if (userObj["imgUrl"]){
        profileImage.style.backgroundImage = `url(${userObj["imgUrl"]})`
    } else {
        profileImage.style.backgroundImage = 'none'
    }
}


/* ------ Auth popup ------ */

// Login text link to signup
signupTxt.addEventListener('click', () => {
    sectionNavigation([loginWrapper], [signupWrapper])
})

// Signup text to login
loginTxt.addEventListener('click', () => {
    sectionNavigation([signupWrapper], [loginWrapper])
})

// Login 
async function logUserIn(){
    const email = document.getElementById('login-email-ipt').value;
    const passWord = document.getElementById('login-pw-ipt').value;
    // Check infos missing
    if (!email || !passWord){
        alert("Some fields are missing")
    // If all infos
    } else {
        const res = await login(email, passWord);
        // User found in DB
        if (res.data.status === "success"){
            displayInfos(res.currentUser);
            // Load forum messages
            await loadAndRenderForum(STATE.forumPage)
            sectionNavigation([authPop], [main, profileSection, profileInfos, navBar])
            pageWrapper.style.justifyContent = ''
            showMenu(profileMenu)
        // User not found in DB
        } else {
            show([error_wrongCred])
        }
    };
}

loginBtn.addEventListener("click", () => {
    logUserIn()
});

// Signup button
async function signUserUp(){
    // Save input values
    const firstName = document.getElementById('first-name-ipt').value;
    const lastName = document.getElementById('last-name-ipt').value;
    const email = document.getElementById('signup-email-ipt').value;
    const passWord = document.getElementById('signup-pw-ipt').value;
    // Check field values
    if (!firstName || !lastName || !email || !passWord){
        alert("Some fields are missing")
    } else {
        const data = await signUp(firstName, lastName, email, passWord);
        if (data.status === "success"){
            sectionNavigation([signupWrapper], [loginWrapper])
            await loadAndRenderForum(STATE.forumPage)
        } else if (data.status === "error" && data.message === "user exists"){
           show([error_userExists])
        }
    }
}

signupBtn.addEventListener("click", () => {
    signUserUp()
});

/* ------ Profile ------ */

// Image uploader
customUploader.addEventListener("click", () => {
    imgUploader.click();
});

let selectedFile = null

function previewImage(){
    // Preview uploaded image
    const file = imgUploader.files[0]
    selectedFile = file
    if (file){
        const previewSrc = URL.createObjectURL(file)
        modifyImage.style.backgroundImage = `url(${previewSrc})`
        const img = new Image()
        img.src = previewSrc
        img.onload = () => {
            URL.revokeObjectURL(previewSrc);
        };
    }
}

imgUploader.addEventListener("change", () => {
    previewImage()
})

// Submit modifications button
function createFormData(){
    const formData = new FormData()
    const currentUser = JSON.parse(localStorage.getItem("user"))
    formData.append("email", currentUser["email"])
    if (selectedFile){
        formData.append("image", selectedFile)
    }
    if (modifyDescription.value){
        formData.append("new_description", modifyDescription.value)
    }
    if (modifyEmail.value){
        formData.append("new_email", modifyEmail.value)
    }
    if (modifyName.value){
        formData.append("new_name", modifyName.value)
    }
    if (modifySurname.value){
        formData.append("new_surname", modifySurname.value)
    }
    return formData
}

formSubmitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const formData = createFormData()
    const user = await uploadForm(formData);
    sectionNavigation([profileForm], [profileSection, profileInfos])
    displayInfos(user);
})

// Cancel modifications button
cancelBtn.addEventListener("click", () => {
    sectionNavigation([profileForm], [profileInfos])
})

// Modify user infos button
function placeHolderText(input, text){
    input.placeholder = text
}

function profilePlaceholders(user){
    placeHolderText(modifyName, user["firstName"])
    placeHolderText(modifySurname, user["firstName"])
    placeHolderText(modifyEmail, user["firstName"])
    if (user["description"]){
        placeHolderText(modifyDescription, user["description"])
    }
    modifyImage.style.backgroundImage = `url(${user["imgUrl"]})`
}

profileModBtn.addEventListener("click", () => {
    sectionNavigation([profileInfos], [profileForm])
    // Get stored user data 
    const currentUser = JSON.parse(localStorage.getItem("user"))
    // Add values for input placeholders
    profilePlaceholders(currentUser)
})


/* ------ Navbar ------ */
function menuNavigation(){
    const menuIdList = ['nav-profile', 'nav-search', 'nav-forum']
    const sectionIDs = ['profile-section', 'forum-section', 'search-section']
    const clickedElement = event.target.closest("li");
    if (!clickedElement) return;
    const selectedMenu = document.getElementById(clickedElement.id);
    const correspondingSection = document.getElementById(clickedElement.dataset.sectionId)
    // Highlight selected menu
    menuIdList.forEach(id => {
        const el = document.getElementById(id)
        hideMenu(el)
    })
    showMenu(selectedMenu)
    // Show corresponding page section
    sectionIDs.forEach(el => {
        const section = document.getElementById(el)
        hide([section])
    })
    show([correspondingSection])
}

// Menu animation
navBar.addEventListener("click", (event) => {
    menuNavigation()
})

function showMenu(name){
    name.classList.remove("unselected")
    name.classList.add("selected")
}

function hideMenu(name){
    name.classList.remove("selected")
    name.classList.add("unselected")
}

/* ------ Forum ------ */

// Create existing posts HTML
function createForumPostsHtml(element){
    // Card container
    const post = document.createElement("div")
    post.classList.add("large-card")
    post.id = "post"
    forumBody.appendChild(post)
    // Left card side
    const postBodyLeft = document.createElement("div")
    postBodyLeft.classList.add("post-body-left")
    post.appendChild(postBodyLeft)
    // Left card side content
        // User profile image
    const userImgWrapper = document.createElement("div")
    userImgWrapper.classList.add("small-image-wrapper")
    userImgWrapper.id = "post-user-img"
    userImgWrapper.style.backgroundImage = `url('${element.image_url}')`
    postBodyLeft.appendChild(userImgWrapper)
        // User name
    const postName = document.createElement("h5")
    postName.classList.add("title-text-small")
    postName.id = "post-user-name"
    postName.textContent = element.first_name
    postBodyLeft.appendChild(postName)
        // Creation date
    const postDate = document.createElement("p")
    postDate.classList.add("body-text-small")
    postDate.id = "post-date"
    postDate.textContent = element.date.split(" ")[0]
    postBodyLeft.appendChild(postDate)
    // Right card side
    const postBodyRight = document.createElement("div")
    postBodyRight.classList.add("post-body-right")
    post.appendChild(postBodyRight)
        // Post title
    const postTitle = document.createElement("h5")
    postTitle.classList.add("title-text-small")
    postTitle.id = "post-title"
    postTitle.textContent = element.title
    postBodyRight.appendChild(postTitle)
        // Post description
    const postDescription = document.createElement("p")
    postDescription.classList.add("body-text-small")
    postDescription.id = "post-description"
    postDescription.textContent = element.description
    postBodyRight.appendChild(postDescription)
}

// Render forum after data fetch
async function loadAndRenderForum(page=1){
    forumBody.innerHTML = ''
    const data = await loadForum(page)
    STATE.maxPage = Math.ceil(data.total_pages)
    if (data.posts){
        data.posts.forEach(el => {
            createForumPostsHtml(el)
        })
        postNavPages.textContent = `${STATE.forumPage} / ${STATE.maxPage}`
    } else {
        postStatusMessage.textContent = 'No post in this forum yet'
    }
}


// Display existing posts
async function renderPosts(){
    const user = JSON.parse(localStorage.getItem("user"))
    const res = await post(newPostTitle.value, newPostDescription.value, user["userId"])
    return res
}

function sectionNavigation(toHide, toShow){
    hide(toHide)
    show(toShow)
}

function cleanInputs(inputList){
    inputList.forEach(el => {
        el.value = ''
    })
}

// Send a new post button
createNewPostBtn.addEventListener("click", () => {
    show([newPostPopup])
})

sendNewPostBtn.addEventListener("click", async() => {
    const newPost = await renderPosts()
    displayPostStatusMessage(newPost.status)
    sectionNavigation([newPostPopup], [postStatusMessage])
    cleanInputs([newPostDescription, newPostTitle])
})

cancelNewPostBtn.addEventListener("click", async() => {
    sectionNavigation([newPostPopup], [postStatusMessage])
    cleanInputs([newPostDescription, newPostTitle])
})

// Forum pages navigation
forumNextBtn.addEventListener("click", async() => {
    STATE.forumPage++;
    await loadAndRenderForum(STATE.forumPage);
})

forumPrevBtn.addEventListener("click", async() => {
    STATE.forumPage--;
    await loadAndRenderForum(STATE.forumPage);
})

// Display new post validation message
async function displayPostStatusMessage(status){
    if (status === "success"){
        postStatusMessage.style.color = 'green'
        postStatusMessage.textContent = 'Post sent succesfully'
        await loadAndRenderForum(STATE.forumPage)
    } else {
        postStatusMessage.style.color = 'red'
        postStatusMessage.textContent = 'Error : Post not sent'
    }
    setTimeout(() =>{
            postStatusMessage.textContent = ''
        }, 3000)
}


/* ============== 
        Dev
================= */

// Normal access to site

show([authPop])
show([loginWrapper])
pageWrapper.style.justifyContent = 'center'


 /*Current dev access
show([main, navBar, forumSection])
showMenu(forumMenu)
show([newPostPopup])

*/