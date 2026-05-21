import { decreaseLikes, getAnswers, increaseLikes, postAnswer, loadForum } from "./API.js";
import { answerPopup, closeAnswerBtn, forumMainSection, forumMessageSection, messageBackBtn, messageBody, answerContainer, sendAnswerBtn, ogPostMessageCounter, ogPostLikeCounter, ogPostAnswerBtn, ogPostLikeBtn } from "./dom.js";
import { cleanInputs, show, hide, toggleSections } from "./UI.js";
import { STATE } from "./state.js";
import { renderForum, setForumParam } from "./forum.js";

messageBackBtn.addEventListener("click", async () => {
    const forumRes = await loadForum(STATE.currentUser["user_id"]);
    setForumParam(forumRes);
    renderForum()
    toggleSections([forumMessageSection], [forumMainSection])
})

ogPostAnswerBtn.addEventListener("click", (e) => {
    show(answerPopup)
})

closeAnswerBtn.addEventListener("click", () => {
    hide(answerPopup)
    cleanInputs([messageBody])
})

sendAnswerBtn.addEventListener("click", async () => {
    // Save message sent in DB
    await postAnswer(
        messageBody.value,
        STATE.clickedPost.post_details.id, 
        STATE.currentUser.user_id
    )
    // Update answer list
    const res = await getAnswers(STATE.clickedPost.post_details.id, STATE.currentUser.user_id)
    renderAnswers(res) 
    hide(answerPopup)
    cleanInputs([messageBody])
    toggleFocusedPostAnswers("add")
})

export function renderAnswers(data){
     // Reset HTML
    answerContainer.innerHTML = ``;
    // If no answer sent abord the forEach
    if (data.status === "error") return
    // Create answers in html
    data.answers.forEach(element => {
        // Card
        const answerCard = document.createElement('div')
        answerCard.classList.add("answer-card")
        answerContainer.appendChild(answerCard)
        // Lef side
        const answerBodyLeft = document.createElement('div')
        answerBodyLeft.classList.add("answer-body-left")
        answerCard.appendChild(answerBodyLeft)
        // Profile image
        const profileImage = document.createElement("div")
        profileImage.id = "answer-profile-image"
        profileImage.classList.add("small-image-container")
        answerBodyLeft.appendChild(profileImage)
        profileImage.style.backgroundImage = `url(${element.image_url})`
        // Right side
        const answerBodyRight = document.createElement("div")
        answerBodyRight.classList.add("answer-body-right")
        answerCard.appendChild(answerBodyRight)
        // Right side header
        const answerRightHeader = document.createElement("div")
        answerRightHeader.classList.add("answer-right-header")
        answerBodyRight.appendChild(answerRightHeader)
        // Right side content
            // User name
        const userName = document.createElement("h4")
        userName.id = "answer-user-name"
        answerRightHeader.appendChild(userName)
        userName.textContent = element.creator
            // Answer date
        const answerDate = document.createElement("p")
        answerDate.id = "answer-date"
        answerRightHeader.appendChild(answerDate)
        const date = new Date(element.created_at)
        answerDate.textContent = date.toLocaleDateString("fr-Fr", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        })
        // Answer message
        const answer = document.createElement("p")
        answer.id = "answer-user-answer"
        answerBodyRight.appendChild(answer)
        answer.textContent = element.message
    });
}

// Increase likes 
ogPostLikeBtn.addEventListener("click", async () => {
    clickLikeBtn()
    
})


async function clickLikeBtn(){
      if (!STATE.messages.liked_by_user){
        ogPostLikeCounter.textContent++
        await increaseLikes(STATE.clickedPost.post_details.id, STATE.currentUser.user_id)
        ogPostLikeBtn.classList.remove("fa-regular")
        ogPostLikeBtn.classList.add("fa-solid")
        STATE.messages.liked_by_user = true
    } else {
        await decreaseLikes(STATE.clickedPost.post_details.id, STATE.currentUser.user_id)
        ogPostLikeBtn.classList.remove("fa-solid")
        ogPostLikeBtn.classList.add("fa-regular")
        STATE.messages.liked_by_user = false
        ogPostLikeCounter.textContent--
    }
}

export function renderLikeIcn(){
    if (!STATE.clickedPost.post_details.liked_by_user){
        ogPostLikeBtn.classList.remove("fa-solid")
        ogPostLikeBtn.classList.add("fa-regular")
    } else {
        ogPostLikeBtn.classList.remove("fa-regular")
        ogPostLikeBtn.classList.add("fa-solid")
    }
}


export function toggleFocusedPostAnswers(path){
    if (path === "add"){
        ogPostMessageCounter.textContent++
        STATE.clickedPost.post_details.answered_by_user = true
    }
    if (!STATE.clickedPost.post_details.answered_by_user){
        ogPostAnswerBtn.classList.remove("fa-solid")
        ogPostAnswerBtn.classList.add("fa-regular")
    } else {
        ogPostAnswerBtn.classList.remove("fa-regular")
        ogPostAnswerBtn.classList.add("fa-solid")
    }
};