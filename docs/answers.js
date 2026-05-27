/* ========================
            Answers
=========================== */

import { decreaseLikes, getAnswers, increaseLikes, postAnswer, loadForum } from "./API.js";
import { cleanInputs, show, hide, toggleSections } from "./UI.js";
import { STATE } from "./state.js";
import { renderForum, setForumParam } from "./forum.js"; 
import { DOM } from "./dom.js";

// Cancel send new message button
DOM.messageBackBtn().addEventListener("click", async () => {
    // Reload forum
    const forumRes = await loadForum(STATE.currentUser["user_id"]);
    setForumParam(forumRes);
    renderForum();
    toggleSections([DOM.forumMessageSection()], [DOM.forumMainSection()]);
});

// Show popup to answer a post
DOM.ogPostAnswerBtn().addEventListener("click", (e) => {
    show(DOM.answerPopup());
    DOM.messageBody().focus();
});

// Close answer popup
DOM.closeAnswerBtn().addEventListener("click", () => {
    hide(DOM.answerPopup());
    cleanInputs([DOM.messageBody()]);
});

// Send an answer to a post
DOM.sendAnswerBtn().addEventListener("click", async () => {
    // Handle no message error
    if (!DOM.messageBody().value){
        alert("Please enter a message");
        return;
    };
    // Save message sent in DB
    await postAnswer(
        DOM.messageBody().value,
        STATE.clickedPost.post_details.id, 
        STATE.currentUser.user_id
    );
    // Update answer list
    const res = await getAnswers(STATE.clickedPost.post_details.id, STATE.currentUser.user_id);
    renderAnswers(res);;
    hide(DOM.answerPopup());
    cleanInputs([DOM.messageBody()]);
    toggleFocusedPostAnswers("add");
});

// Render and display answers to a post in HTML
export function renderAnswers(data){
     // Reset HTML
    DOM.answerContainer().innerHTML = ``;
    // If no answer sent abord the forEach
    if (data.status === "error") return
    // Create answers in html
    data.answers.forEach(element => {
        // Card
        const answerCard = document.createElement('div');
        answerCard.classList.add("answer-card");
        DOM.answerContainer().appendChild(answerCard);
        // Lef side
        const answerBodyLeft = document.createElement('div');
        answerBodyLeft.classList.add("answer-body-left");
        answerCard.appendChild(answerBodyLeft);
        // Profile image
        const profileImage = document.createElement("div");
        profileImage.id = "answer-profile-image";
        profileImage.classList.add("small-image-container");
        answerBodyLeft.appendChild(profileImage);
        profileImage.style.backgroundImage = `url(${element.image_url})`;
        // Right side
        const answerBodyRight = document.createElement("div");
        answerBodyRight.classList.add("answer-body-right");
        answerCard.appendChild(answerBodyRight);
        // Right side header
        const answerRightHeader = document.createElement("div");
        answerRightHeader.classList.add("answer-right-header");
        answerBodyRight.appendChild(answerRightHeader);
        // Right side content
            // User name
        const userName = document.createElement("h4");
        userName.id = "answer-user-name";
        answerRightHeader.appendChild(userName);
        userName.textContent = element.creator;
            // Answer date
        const answerDate = document.createElement("p");
        answerDate.id = "answer-date";
        answerRightHeader.appendChild(answerDate);
        const date = new Date(element.created_at);
        answerDate.textContent = date.toLocaleDateString("fr-Fr", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
        // Answer message
        const answer = document.createElement("p");
        answer.id = "answer-user-answer";
        answerBodyRight.appendChild(answer);
        answer.textContent = element.message;
    });
};

// Increase likes 
DOM.ogPostLikeBtn().addEventListener("click", async () => {
    clickLikeBtn();
});

async function clickLikeBtn(){
      if (!STATE.messages.liked_by_user){
        DOM.ogPostLikeCounter().textContent++;
        await increaseLikes(STATE.clickedPost.post_details.id, STATE.currentUser.user_id);
        DOM.ogPostLikeBtn().classList.remove("fa-regular");
        DOM.ogPostLikeBtn().classList.add("fa-solid");
        STATE.messages.liked_by_user = true;
    } else {
        await decreaseLikes(STATE.clickedPost.post_details.id, STATE.currentUser.user_id);
        DOM.ogPostLikeBtn().classList.remove("fa-solid");
        DOM.ogPostLikeBtn().classList.add("fa-regular");
        STATE.messages.liked_by_user = false;
        DOM.ogPostLikeCounter().textContent--;
    };
};

// Switch back and forth to solid icon when user liked a post
export function renderLikeIcn(){
    if (!STATE.clickedPost.post_details.liked_by_user){
        DOM.ogPostLikeBtn().classList.remove("fa-solid");
        DOM.ogPostLikeBtn().classList.add("fa-regular");
    } else {
        DOM.ogPostLikeBtn().classList.remove("fa-regular");
        DOM.ogPostLikeBtn().classList.add("fa-solid");
    };
};

// Switch back and forth to solid icon when user answered a post
export function toggleFocusedPostAnswers(path){
    if (path === "add"){
        DOM.ogPostMessageCounter().textContent++;
        STATE.clickedPost.post_details.answered_by_user = true;
    };
    if (!STATE.clickedPost.post_details.answered_by_user){
        DOM.ogPostAnswerBtn().classList.remove("fa-solid");;
        DOM.ogPostAnswerBtn().classList.add("fa-regular");
    } else {
        DOM.ogPostAnswerBtn().classList.remove("fa-regular");
        DOM.ogPostAnswerBtn().classList.add("fa-solid");
    };
};