
import { show, hide, toggleSections, cleanInputs } from "./UI.js";
import { getAnswers, loadForum, post } from "./API.js";
import { STATE } from "./state.js";
import { renderAnswers, renderLikeIcn, toggleFocusedPostAnswers } from "./answers.js";
import { DOM } from "./dom.js";


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
    DOM.forumBody().appendChild(post);

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
    DOM.forumBody().innerHTML = '';
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
        DOM.postNavPages().textContent = `${STATE.forumPage} / ${Math.ceil(STATE.forumTotalPages)}`;
    } else {
        DOM.postStatusMessage().textContent = 'No post in this forum yet';
    };
};


// Send a new post button
DOM.createNewPostBtn().addEventListener("click", () => {
    show(DOM.newPostPopup());
    const cardCover = document.querySelectorAll('.post-body-right')
    cardCover.forEach(el => hide(el))
    DOM.newPostTitle().focus()
});

DOM.sendNewPostBtn().addEventListener("click", async () => {
    const newPost = await post(DOM.newPostTitle().value, DOM.newPostDescription().value, STATE.currentUser["user_id"]);
    const forumRes = await loadForum(STATE.currentUser["user_id"]);
    setForumParam(forumRes);
    renderForum();
    displayPostStatusMessage(newPost.status);
    toggleSections([DOM.newPostPopup()], [DOM.postStatusMessage()]);
    cleanInputs([DOM.newPostDescription(), DOM.newPostTitle()]);
    const cardCover = document.querySelectorAll('.post-body-right')
    cardCover.forEach(el => show(el))
});

DOM.cancelNewPostBtn().addEventListener("click", async () => {
    toggleSections([DOM.newPostPopup()], [DOM.postStatusMessage()]);
    cleanInputs([newPostDescription, DOM.newPostTitle()]);
    const cardCover = document.querySelectorAll('.post-body-right')
    cardCover.forEach(el => show(el))
});

// Forum pages navigation
DOM.forumNextBtn().addEventListener("click", async () => {
    if (STATE.forumPage < STATE.forumTotalPages) {
        STATE.forumPage++;
    };
    renderForum();
});

DOM.forumPrevBtn().addEventListener("click", async () => {
    if (STATE.forumPage > 1) {
        STATE.forumPage--;
    };
    renderForum();

});

// Display new post validation message
async function displayPostStatusMessage(status) {
    if (status === "success") {
        DOM.postStatusMessage().style.color = 'green';
        DOM.postStatusMessage.textContent = 'Post sent succesfully';
    } else {
        DOM.postStatusMessage().style.color = 'red';
        DOM.postStatusMessage().textContent = 'Error : Post not sent';
    };
    setTimeout(() => {
        DOM.postStatusMessage().textContent = '';
    }, 2000);
};

// Check profile pop up

function displayCheckProfileInfos(user){
    DOM.checkProfileLastName().textContent = user.last_name;
    DOM.checkProfileDescription().textContent = user.description;
    DOM.checkProfileEmail().textContent = user.email;
    DOM.checkProfileName().textContent = user.first_name;
    DOM.checkImage().style.background = `url(${user.image_url})`;
    DOM.checkImage().style.backgroundSize = 'cover';
    DOM.checkImage().style.backgroundPosition = 'center';

}
// Check for click on forum-post profile image
document.body.addEventListener("click", (e) => {
    if (
        e.target.id === "check-profile-btn" ||
        e.target.id === "post-user-img" ||
        e.target.id === "post-user-name" ||
        e.target.id === "post-date"
    ){
        show(DOM.checkProfilePopup())
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
            DOM.ogPostLikeBtn().classList.remove("fa-regular")
            DOM.ogPostLikeBtn().classList.add("fa-solid")
        }
        // Inject content of focused post in existing HTML
        renderFocusedPost(STATE.clickedPost)
        // Create HTML for each answer
        renderAnswers(messageList)
        // Did user like this post ? 
        renderLikeIcn()
        // Toggle sections
        toggleSections([DOM.forumMainSection()], [DOM.forumMessageSection()])
    }
})

DOM.cancelCheckBtn().addEventListener("click", () => {
    hide(DOM.checkProfilePopup())
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
    DOM.messagesPostTitle().textContent = post.post_details.title
    // Display post description
    DOM.messagesPostDescription().textContent = post.post_details.description
    // Display answer count
    DOM.ogPostMessageCounter().textContent = post.post_details.answers
    // Display like count on post
    DOM.ogPostLikeCounter().textContent = post.post_details.likes
    // Did user answer ?
    toggleFocusedPostAnswers("load")
 
}
