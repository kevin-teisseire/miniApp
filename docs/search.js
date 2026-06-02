/* ========================
            Search
=========================== */

import { DOM } from "./dom.js";
import { fetchPosts } from "./API.js"
import { gotoAnswers } from "./forum.js";
import { show, hide, toggleSections } from "./UI.js";
import { hideMenu, showMenu } from "./navigation.js";
import { STATE } from "./state.js";

let timeout;
// When user types in the search bar
DOM.searchBar().addEventListener("input", () => {
    clearTimeout(timeout);
    DOM.searchResults().innerHTML = ``;
    timeout = setTimeout(async () => {
        const query = DOM.searchBar().value.trim()
        if (query){
           searchPosts(query);
        };
    }, 300);
});

// Search for posts matching user input
async function searchPosts(query){
    const res = await fetchPosts(query);
    if (res){
        res.results.forEach((el) => {
            renderFoundPosts(el);
        });
    };       
};

// Render matching posts to user query in html
function renderFoundPosts(element) {
    // Card container
    const post = document.createElement("div");
    post.classList.add("search-card");
    post.id = "post";
    post.dataset.postId = element.id // Saving post id for later
    DOM.searchResults().appendChild(post);

    // Get user data
    const postId = Number(post.dataset.postId);
    const postData = STATE.forumPosts.find(p => p.post_details.id === postId);
    const userDetails = postData.user_details;

    // Creation date
    const searchLeft = document.createElement("div");
    searchLeft.classList.add("search-wrapper", "cell", "standard");
    post.appendChild(searchLeft);

    const postDatetitle = document.createElement("p");
    postDatetitle.textContent = "Date";
    postDatetitle.style.fontWeight = 'bold';
    searchLeft.appendChild(postDatetitle);

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
    searchMiddle.classList.add("search-wrapper", "cell", "standard");
    post.appendChild(searchMiddle);

    const postNameTitle = document.createElement("p");
    postNameTitle.classList.add("body-text-small");
    postNameTitle.textContent = 'User';
    postNameTitle.style.fontWeight = 'bold';
    searchMiddle.appendChild(postNameTitle);

    const userName = document.createElement("p");
    userName.classList.add("body-text-small");
    userName.textContent = userDetails.first_name;
    searchMiddle.appendChild(userName);

    // Post title
    const searchRight = document.createElement("div");
    searchRight.classList.add("search-wrapper", "cell", "title");
    post.appendChild(searchRight);

    const postTitleTitle = document.createElement("p");
    postTitleTitle.classList.add("body-text-small");
    postTitleTitle.textContent = 'Title';
    postTitleTitle.style.fontWeight = 'bold';
    searchRight.appendChild(postTitleTitle);

    const postTitle = document.createElement("p");
    postTitle.classList.add("body-text-small");
    postTitle.id = "post-title";
    postTitle.textContent = element.title;
    searchRight.appendChild(postTitle);

    // View BTN
    const searchLast = document.createElement("div");
    searchLast.classList.add("search-wrapper", "icn");
    post.appendChild(searchLast);

    const viewBtn = document.createElement("i");
    viewBtn.classList.add("fa-solid", "fa-eye");
    viewBtn.id = 'search-view-btn';
    searchLast.appendChild(viewBtn);
};

// Go to clicked post from result list
window.addEventListener("click", (e) => {
    if (e.target.id === "search-view-btn"){
        const postEl = e.target.closest('.search-card')
        const postId = Number(postEl.dataset.postId);
        hide(DOM.searchSection());
        toggleSections([DOM.forumMainSection()], [DOM.forumSection()]);
        gotoAnswers(postId);
        showMenu(DOM.forumMenu());
        hideMenu(DOM.searchMenu());
    };
});