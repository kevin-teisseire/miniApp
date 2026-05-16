import { forumBody, postNavPages, postStatusMessage, newPostTitle, newPostDescription, newPostPopup, createNewPostBtn,
        sendNewPostBtn, cancelNewPostBtn, forumNextBtn, forumPrevBtn } from "./dom.js"
import { show, hide, toggleSections, cleanInputs } from "./UI.js"
import { loadForum, post } from "./API.js"
import { STATE } from "./state.js"


/* ========================
            Forum
=========================== */

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
    const date = new Date(element.date)
    postDate.textContent = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })
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
export async function loadAndRenderForum(page=1){
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
    const res = await post(newPostTitle.value, newPostDescription.value, STATE.currentUser["user_id"])
    console.log(`renderPosts(): ${res}`)
    return res
}

// Send a new post button
createNewPostBtn.addEventListener("click", () => {
    show(newPostPopup)
})

sendNewPostBtn.addEventListener("click", async() => {
    const newPost = await renderPosts()
    await loadAndRenderForum(STATE.forumPage)
    console.log(newPost.status)
    displayPostStatusMessage(newPost.status)
    toggleSections([newPostPopup], [postStatusMessage])
    cleanInputs([newPostDescription, newPostTitle])
})

cancelNewPostBtn.addEventListener("click", async() => {
    toggleSections([newPostPopup], [postStatusMessage])
    cleanInputs([newPostDescription, newPostTitle])
})

// Forum pages navigation
forumNextBtn.addEventListener("click", async() => {
    if (STATE.forumPage < STATE.maxPage){
            STATE.forumPage++;
    }
    await loadAndRenderForum(STATE.forumPage);
})

forumPrevBtn.addEventListener("click", async() => {
    if (STATE.forumPage > 1){
        STATE.forumPage--;
    }
    await loadAndRenderForum(STATE.forumPage);
    
})

// Display new post validation message
async function displayPostStatusMessage(status){
    if (status === "success"){
        postStatusMessage.style.color = 'green'
        postStatusMessage.textContent = 'Post sent succesfully'   
    } else {
        postStatusMessage.style.color = 'red'
        postStatusMessage.textContent = 'Error : Post not sent'
    }
    setTimeout(() =>{
            postStatusMessage.textContent = ''
        }, 2000)
}
