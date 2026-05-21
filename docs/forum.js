
import { forumBody, postNavPages, postStatusMessage, newPostTitle, newPostDescription, newPostPopup, createNewPostBtn,
        sendNewPostBtn, cancelNewPostBtn, forumNextBtn, forumPrevBtn, checkProfilePopup, cancelCheckBtn,
        messageSection,forumSection,forumMessageSection, forumMainSection, messagesPostTitle, 
        messagesPostDescription, checkProfileLastName, checkProfileDescription, checkProfileEmail, 
        checkProfileName, checkImage,
        ogPostLikeCounter,
        ogPostMessageCounter,
        ogPostLikeBtn} from "./dom.js";
import { show, hide, toggleSections, cleanInputs } from "./UI.js";
import { getAnswers, loadForum, post } from "./API.js";
import { STATE } from "./state.js";
import { renderAnswers, renderLikeIcn, toggleFocusedPostAnswers } from "./answers.js"


/* ========================
            Forum
=========================== */

// Create existing posts HTML
function createForumPostsHtml(element) {
    // Card container
    const post = document.createElement("div");
    post.classList.add("large-card");
    post.id = "post";
    post.dataset.postId = element.post_details.id // Saving post id for later
    forumBody.appendChild(post);

    // Left card side
    const postBodyLeft = document.createElement("div");
    postBodyLeft.classList.add("post-body-left");
    postBodyLeft.id = ("check-profile-btn");
    post.appendChild(postBodyLeft);
    // Left card side content
    // User profile image
    const userImgWrapper = document.createElement("div");
    userImgWrapper.classList.add("small-image-wrapper");
    userImgWrapper.id = "post-user-img";
    userImgWrapper.style.backgroundImage = `url('${element.user_details.image_url}')`;
    postBodyLeft.appendChild(userImgWrapper);
    // User name
    const postName = document.createElement("h5");
    postName.classList.add("title-text-small");
    postName.id = "post-user-name";
    postName.textContent = element.user_details.first_name;
    postBodyLeft.appendChild(postName);
    // Creation date
    const postDate = document.createElement("p");
    postDate.classList.add("body-text-small");
    postDate.id = "post-date";;
    const date = new Date(element.post_details.date);
    postDate.textContent = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
    postBodyLeft.appendChild(postDate);
    // Right card side
    const postBodyRight = document.createElement("div");
    postBodyRight.classList.add("post-body-right");
    postBodyRight.id = "go-messages-btn"
    post.appendChild(postBodyRight);
    // Card cover for click
    const cardCover = document.createElement("div");
    cardCover.classList.add("large-card-cover");
    postBodyRight.appendChild(cardCover);
    // Post title
    const postTitle = document.createElement("h5");
    postTitle.classList.add("title-text-small");
    postTitle.id = "post-title";
    postTitle.textContent = element.post_details.title;
    postBodyRight.appendChild(postTitle);
    // Post description
    const postDescription = document.createElement("p");
    postDescription.classList.add("body-text-small");
    postDescription.id = "post-description";
    postDescription.textContent = element.post_details.description;
    postBodyRight.appendChild(postDescription);

    /* ------ Social icns ------ */
    // Icns section wrapper
    const socialIcnsWrapper = document.createElement("div")
    socialIcnsWrapper.classList.add("social-icns-wrapper")
    socialIcnsWrapper.id = "post-socials"
    postBodyRight.appendChild(socialIcnsWrapper)
    // Count answers wrapper
    const countWrapper = document.createElement("div")
    countWrapper.classList.add("count-icn-wrapper")
    socialIcnsWrapper.appendChild(countWrapper)
    socialIcnsWrapper.id = "post-count-wrapper"
    // answer count
    const answerCount = document.createElement("p")
    answerCount.textContent = element.post_details.answers
    countWrapper.appendChild(answerCount)
    // answer Icn
    const messageIcn = document.createElement("i")
    // Is post answered by user ? 
    if(!element.post_details.answered_by_user){
        messageIcn.classList.add("fa-regular", "fa-message",  "message-btns")
    } else {
        messageIcn.classList.add("fa-solid", "fa-message",  "message-btns")
    }
    countWrapper.appendChild(messageIcn)
    // like count wrapper
    const likeWrapper = document.createElement("div")
    likeWrapper.classList.add("count-icn-wrapper")
    socialIcnsWrapper.appendChild(likeWrapper)
    likeWrapper.id = "post-like-wrapper"
    // like count
    const likeCount = document.createElement("p")
    likeCount.textContent = element.post_details.likes
    likeWrapper.appendChild(likeCount)
    // like Icn
    const likeIcn = document.createElement("i")
    // Is post liked by user ? 
        if(!element.post_details.liked_by_user){
          likeIcn.classList.add("fa-regular", "fa-heart",  "message-btns")
    } else {
          likeIcn.classList.add("fa-solid", "fa-heart",  "message-btns")
    }
    likeWrapper.appendChild(likeIcn)
}

// Render forum 
export function setForumParam(res) {
    Object.assign(STATE, {
        forumTotalPages: res.total_pages,
        forumPosts: res.posts,
        forumPostCount: Math.ceil(res.total_posts)
    });
};

export function renderForum() {
    // Reset html
    forumBody.innerHTML = '';
    // Divide post display 4x4
    const start = (STATE.forumPage - 1) * 4;
    const end = STATE.forumPage * 4;
    // Generate visible posts
    if (STATE.forumPosts) {
        // For each post on current page
        STATE.forumPosts.slice(start, end).forEach(el => {
            // Create posts HTML
            createForumPostsHtml(el);
        });
        // Display current and max page
        postNavPages.textContent = `${STATE.forumPage} / ${Math.ceil(STATE.forumTotalPages)}`;
    } else {
        postStatusMessage.textContent = 'No post in this forum yet';
    };
};


// Send a new post button
createNewPostBtn.addEventListener("click", () => {
    show(newPostPopup);
    const cardCover = document.querySelectorAll('.post-body-right')
    cardCover.forEach(el => hide(el))
});

sendNewPostBtn.addEventListener("click", async () => {
    const newPost = await post(newPostTitle.value, newPostDescription.value, STATE.currentUser["user_id"]);
    const forumRes = await loadForum(STATE.currentUser["user_id"]);
    setForumParam(forumRes);
    renderForum();
    displayPostStatusMessage(newPost.status);
    toggleSections([newPostPopup], [postStatusMessage]);
    cleanInputs([newPostDescription, newPostTitle]);
    const cardCover = document.querySelectorAll('.post-body-right')
    cardCover.forEach(el => show(el))
});

cancelNewPostBtn.addEventListener("click", async () => {
    toggleSections([newPostPopup], [postStatusMessage]);
    cleanInputs([newPostDescription, newPostTitle]);
    const cardCover = document.querySelectorAll('.post-body-right')
    cardCover.forEach(el => show(el))
});

// Forum pages navigation
forumNextBtn.addEventListener("click", async () => {
    if (STATE.forumPage < STATE.forumTotalPages) {
        STATE.forumPage++;
    };
    renderForum();
});

forumPrevBtn.addEventListener("click", async () => {
    if (STATE.forumPage > 1) {
        STATE.forumPage--;
    };
    renderForum();

});

// Display new post validation message
async function displayPostStatusMessage(status) {
    if (status === "success") {
        postStatusMessage.style.color = 'green';
        postStatusMessage.textContent = 'Post sent succesfully';
    } else {
        postStatusMessage.style.color = 'red';
        postStatusMessage.textContent = 'Error : Post not sent';
    };
    setTimeout(() => {
        postStatusMessage.textContent = '';
    }, 2000);
};

// Check profile pop up

function displayCheckProfileInfos(user){
    checkProfileLastName.textContent = user.last_name;
    checkProfileDescription.textContent = user.description;
    checkProfileEmail.textContent = user.email;
    checkProfileName.textContent = user.first_name;
    checkImage.style.background = `url(${user.image_url})`;
    checkImage.style.backgroundSize = 'cover';
    checkImage.style.backgroundPosition = 'center';

}
// Check for click on forum-post profile image
document.body.addEventListener("click", (e) => {
    if (
        e.target.id === "check-profile-btn" ||
        e.target.id === "post-user-img" ||
        e.target.id === "post-user-name" ||
        e.target.id === "post-date"
    ){
        show(checkProfilePopup)
        const cardCover = document.querySelectorAll('.post-body-right')
        cardCover.forEach(el => hide(el))
    }
})

// Check for click on forum-post body
document.body.addEventListener("click", async (e) => {
    // If a post is clicked
    if (e.target.classList.contains("large-card-cover")){
        const postEl = e.target.closest('.large-card')
        if (!postEl) return
        // Save clicked post ID
        const postId = Number(postEl.dataset.postId)
        // Find corresponding post data saved in state
        STATE.clickedPost = STATE.forumPosts.find(p => p.post_details.id === postId)
        // Launch fetch to get all answers to this post
        const messageList = await getAnswers(postId, STATE.currentUser.user_id)
        // Save answer list in STATE
        STATE.messages = messageList
        // Did user like ? 
        if (messageList.liked_by_user === true){
            ogPostLikeBtn.classList.remove("fa-regular")
            ogPostLikeBtn.classList.add("fa-solid")
        }
        // Inject content of focused post in existing HTML
        renderFocusedPost(STATE.clickedPost)
        // Create HTML for each answer
        renderAnswers(messageList)
        // Did user like this post ? 
        renderLikeIcn()
        // Toggle sections
        toggleSections([forumMainSection], [forumMessageSection])
    }
})

cancelCheckBtn.addEventListener("click", () => {
    hide(checkProfilePopup)
    const cardCover = document.querySelectorAll('.post-body-right')
    cardCover.forEach(el => show(el))
})

document.body.addEventListener("click", (e) => {
    const postEl = e.target.closest(".large-card");
    if (!postEl) return;
    const postId = Number(postEl.dataset.postId)
    const postData = STATE.forumPosts.find(p => p.post_details.id === postId);
    displayCheckProfileInfos(postData.user_details)
})

function renderFocusedPost(post){
    // Display post title
    messagesPostTitle.textContent = post.post_details.title
    // Display post description
    messagesPostDescription.textContent = post.post_details.description
    // Display answer count
    ogPostMessageCounter.textContent = post.post_details.answers
    // Display like count on post
    ogPostLikeCounter.textContent = post.post_details.likes
    // Did user answer ?
    toggleFocusedPostAnswers("load")
 
}
