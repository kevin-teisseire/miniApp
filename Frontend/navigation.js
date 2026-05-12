import {signupTxt, loginTxt, authPop, loginWrapper, signupWrapper, navBar, forumMenu, 
        searchMenu, profileMenu, main, profileSection, profileInfos, loginBtn, greeting, 
        profileName, profileSurname, profileEmail, profileDescription, profileImage, signupBtn, 
        error_userExists, customUploader, imgUploader, formSubmitBtn, modifyName, modifyDescription, 
        modifyEmail, modifyImage, modifySurname, error_wrongCred, cancelBtn, profileModBtn, profileForm, 
        forumSection, searchSection, forumBody, sendNewPostBtn, cancelNewPostBtn,
        newPostPopup, postStatusMessage, createNewPostBtn, pageWrapper, postNavPages, forumNextBtn, forumPrevBtn} from "./dom.js"

import {loadForum, login, signUp, uploadForm, post} from './API.js'

/* ==============
        Main
================= */
// const menuSections = [profileMenu, forumMenu, searchMenu]
// let currentSection = ""

/* ------ General ------- */

let forumPage = 1
let maxPage = 1

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
    show([signupWrapper])
    hide([loginWrapper])
})

// Signup text to login
loginTxt.addEventListener('click', () => {
    hide([signupWrapper])
    show([loginWrapper])
})

// Login Button
loginBtn.addEventListener("click", async () => {
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
            await loadAndRenderForum(forumPage)
            hide([authPop]);
            show([main, profileSection, profileInfos, navBar]);
            pageWrapper.style.justifyContent = ''

        // User not found in DB
        } else {
            show([error_wrongCred])
        }
    };
    showMenu(profileMenu)
});

// Signup button
signupBtn.addEventListener("click", async () => {
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
            hide([signupWrapper])
            show([loginWrapper])
            await loadAndRenderForum(forumPage)
        } else if (data.status === "error" && data.message === "user exists"){
           show([error_userExists])
        }
    }
});

/* ------ Profile ------ */

// Image uploader
customUploader.addEventListener("click", () => {
    imgUploader.click();
});

let selectedFile = null

imgUploader.addEventListener("change", () => {
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
})

// Submit modifications button
formSubmitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
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
    const user = await uploadForm(formData);
    hide([profileForm]);
    show([profileSection, profileInfos]);
    displayInfos(user);
})

// Cancel modifications button
cancelBtn.addEventListener("click", () => {
    hide([profileForm]);
    show([profileInfos]);
})

// Modify user infos button
profileModBtn.addEventListener("click", () => {
    hide([profileInfos])
    show([profileForm])
    // Get stored user data 
    const currentUser = JSON.parse(localStorage.getItem("user"))
    
    // Add values for input placeholders
    modifyName.placeholder = currentUser["firstName"]
    modifySurname.placeholder = currentUser["lastName"]
    modifyEmail.placeholder = currentUser["email"]
    if (currentUser["description"]){
        modifyDescription.placeholder = currentUser["description"]
    }
    modifyImage.style.backgroundImage = `url(${currentUser["imgUrl"]})`
})


/* ------ Navbar ------ */

// Menu animation
navBar.addEventListener("click", (event) => {
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
    maxPage = Math.ceil(data.total_pages)
    if (data.posts){
        data.posts.forEach(el => {
            createForumPostsHtml(el)
        })
        postNavPages.textContent = `${forumPage} / ${maxPage}`
    } else {
        postStatusMessage.textContent = 'No post in this forum yet'
    }
}


// Display existing posts
createNewPostBtn.addEventListener("click", () => {
    show([newPostPopup])
})

// Send a new post button
sendNewPostBtn.addEventListener("click", async() => {
    const newPostTitleValue = document.getElementById('new-post-title-input').value
    const newPostDescriptionValue = document.getElementById('new-post-description-input').value
    const user = JSON.parse(localStorage.getItem("user"))
    const newPost = await post(newPostTitleValue, newPostDescriptionValue, user["userId"])
    hide([newPostPopup])
    show([postStatusMessage])
    displayPostStatusMessage(newPost.status)
})

// Forum pages navigation
forumNextBtn.addEventListener("click", async() => {
    console.log(forumPage)
    forumPage++;
    await loadAndRenderForum(forumPage);
})

forumPrevBtn.addEventListener("click", async() => {
    forumPage--;
    await loadAndRenderForum(forumPage);
})

// Display new post validation message
async function displayPostStatusMessage(status){
    if (status === "success"){
        postStatusMessage.style.color = 'green'
        postStatusMessage.textContent = 'Post sent succesfully'
        await loadAndRenderForum(forumPage)
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