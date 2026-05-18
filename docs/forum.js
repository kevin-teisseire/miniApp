import {
    forumBody, postNavPages, postStatusMessage, newPostTitle, newPostDescription, newPostPopup, createNewPostBtn,
    sendNewPostBtn, cancelNewPostBtn, forumNextBtn, forumPrevBtn, checkProfilePopup, 
    cancelCheckBtn,
    messageSection,
    forumSection} from "./dom.js";
import { show, hide, toggleSections, cleanInputs } from "./UI.js";
import { loadForum, post } from "./API.js";
import { STATE } from "./state.js";


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
    post.appendChild(postBodyRight);
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
});

sendNewPostBtn.addEventListener("click", async () => {
    const newPost = await post(newPostTitle.value, newPostDescription.value, STATE.currentUser["user_id"]);
    const forumRes = await loadForum();
    setForumParam(forumRes);
    renderForum();
    displayPostStatusMessage(newPost.status);
    toggleSections([newPostPopup], [postStatusMessage]);
    cleanInputs([newPostDescription, newPostTitle]);
});

cancelNewPostBtn.addEventListener("click", async () => {
    toggleSections([newPostPopup], [postStatusMessage]);
    cleanInputs([newPostDescription, newPostTitle]);
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
    const profileName = document.getElementById('check-profile_profile-name');
    const profileLastName = document.getElementById('check-profile_last-name');
    const profileEmail = document.getElementById('check-profile_profile-email');
    const profileDescription = document.getElementById('check-profile_profile-description');
    const image = document.getElementById('check-profile-img');
    profileLastName.textContent = user.last_name;
    profileDescription.textContent = user.description;
    profileEmail.textContent = user.email;
    profileName.textContent = user.first_name;
    image.style.background = `url(${user.image_url})`;
    image.style.backgroundSize = 'cover';
    image.style.backgroundPosition = 'center';

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
    }
})

//Check for click on forum-post body
document.body.addEventListener("click", (e) => {
    if (e.target.id === "post-body-right"){
        toggleSections(forumSection, messageSection)
    }
})

cancelCheckBtn.addEventListener("click", () => {
    hide(checkProfilePopup)
})

document.body.addEventListener("click", (e) => {
    const postEl = e.target.closest(".large-card");
    if (!postEl) return;
    const postId = Number(postEl.dataset.postId)
    const postData = STATE.forumPosts.find(p => p.post_details.id === postId);
    displayCheckProfileInfos(postData.user_details)
})

