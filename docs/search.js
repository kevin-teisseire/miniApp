import { DOM } from "./dom.js";
import { fetchPosts } from "./API.js"
import { gotoAnswers } from "./forum.js";
import { show, hide, toggleSections } from "./UI.js";
import { hideMenu, showMenu } from "./navigation.js";

let timeout;

DOM.searchBar().addEventListener("input", () => {
    clearTimeout(timeout)
    DOM.searchResults().innerHTML = ``
    timeout = setTimeout(async () => {
        const query = DOM.searchBar().value.trim()
        if (query){
           searchPosts(query)
        }
    }, 300);
});

async function searchPosts(query){
    
    const res = await fetchPosts(query)
    console.log(res)
    if (res){
        res.results.forEach((el) => {
            renderFoundPosts(el)
        })
    };       
};

function renderFoundPosts(element) {
    // Card container
    const post = document.createElement("div");
    post.classList.add("search-card");
    post.id = "post";
    post.dataset.postId = element.id // Saving post id for later
    DOM.searchResults().appendChild(post);

    // Get user data
    const postId = Number(post.dataset.postId)
    const postData = STATE.forumPosts.find(p => p.post_details.id === postId);
    const userDetails = postData.user_details

    // Creation date
    const searchLeft = document.createElement("div");
    searchLeft.classList.add("search-wrapper", "cell", "standard")
    post.appendChild(searchLeft)

    const postDatetitle = document.createElement("p")
    postDatetitle.textContent = "Date"
    postDatetitle.style.fontWeight = 'bold'
    searchLeft.appendChild(postDatetitle)

    const postDate = document.createElement("p");
    postDate.classList.add("body-text-small");
    const date = new Date(element.created_at);
    postDate.textContent = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })
    searchLeft.appendChild(postDate);

    // User name
    const searchMiddle = document.createElement("div");
    searchMiddle.classList.add("search-wrapper", "cell", "standard")
    post.appendChild(searchMiddle)

    const postNameTitle = document.createElement("p");
    postNameTitle.classList.add("body-text-small");
    postNameTitle.textContent = 'User'
    postNameTitle.style.fontWeight = 'bold'
    searchMiddle.appendChild(postNameTitle);

    const userName = document.createElement("p");
    userName.classList.add("body-text-small");
    userName.textContent = userDetails.first_name
    searchMiddle.appendChild(userName);

    // Post title
    const searchRight = document.createElement("div");
    searchRight.classList.add("search-wrapper", "cell", "title")
    post.appendChild(searchRight)

    const postTitleTitle = document.createElement("p");
    postTitleTitle.classList.add("body-text-small");
    postTitleTitle.textContent = 'Title'
    postTitleTitle.style.fontWeight = 'bold'
    searchRight.appendChild(postTitleTitle);

    const postTitle = document.createElement("p");
    postTitle.classList.add("body-text-small");
    postTitle.id = "post-title";
    postTitle.textContent = element.title;
    searchRight.appendChild(postTitle);

    // View BTN
    const searchLast = document.createElement("div");
    searchLast.classList.add("search-wrapper", "icn");
    post.appendChild(searchLast)

    const viewBtn = document.createElement("i");
    viewBtn.classList.add("fa-solid", "fa-eye");
    viewBtn.id = 'search-view-btn'
    searchLast.appendChild(viewBtn);
}

window.addEventListener("click", (e) => {
    if (e.target.id === "search-view-btn"){
        const postEl = e.target.closest('.search-card')
        console.log(postEl)
        const postId = Number(postEl.dataset.postId)
        console.log(postId)
        hide(DOM.searchSection())
        toggleSections([DOM.forumMainSection()], [DOM.forumSection()])
        gotoAnswers(postId)
        showMenu(DOM.forumMenu())
        hideMenu(DOM.searchMenu())
    }
})



/*function renderFoundPosts(element) {
    // Card container
    const post = document.createElement("div");
    post.classList.add("large-card");
    post.id = "post";
    post.dataset.postId = element.id // Saving post id for later
    DOM.searchResults().appendChild(post);

    // Get user infos 
    const postId = Number(post.dataset.postId)
    const postData = STATE.forumPosts.find(p => p.post_details.id === postId);
    const userDetails = postData.user_details
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
    userImgWrapper.style.backgroundImage = `url('${userDetails.image_url}')`;
    postBodyLeft.appendChild(userImgWrapper);
    // User name
    const postName = document.createElement("h5");
    postName.classList.add("title-text-small");
    postName.id = "post-user-name";
    postName.textContent = userDetails.first_name;
    postBodyLeft.appendChild(postName);
    // Creation date
    const postDate = document.createElement("p");
    postDate.classList.add("body-text-small");
    postDate.id = "post-date";
    const date = new Date(element.created_at);
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
    postTitle.textContent = element.title;
    postBodyRight.appendChild(postTitle);
    // Post description
    const postDescription = document.createElement("p");
    postDescription.classList.add("body-text-small");
    postDescription.id = "post-description";
    postDescription.textContent = element.content;
    postBodyRight.appendChild(postDescription);
}
*/