import { loginWrapper, signupWrapper, main, profileSection, profileInfos, navBar, pageWrapper, error_wrongCred,
        error_userExists, profileMenu, signupBtn, loginBtn, signupTxt, loginTxt, authPop } from "./dom.js"
import { show, hide, toggleSections, cleanInputs } from "./UI.js"
import { login, signUp } from "./API.js"
import { loadAndRenderForum } from "./forum.js"
import { STATE } from "./state.js"
import { displayInfos } from "./profile.js"
import { showMenu, hideMenu } from "./navigation.js"

/* ========================
        Authentification
=========================== */

// Login text link to signup
signupTxt.addEventListener('click', () => {
    toggleSections([loginWrapper], [signupWrapper])
})

// Signup text to login
loginTxt.addEventListener('click', () => {
    toggleSections([signupWrapper], [loginWrapper])
})

// Login 
export function setCurrentUser(user){
    STATE.currentUser = user;
    localStorage.setItem("user", JSON.stringify(user))
}

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
            console.log('success')
            setCurrentUser(res.user)
            displayInfos(STATE.currentUser);
            // Load forum messages
            await loadAndRenderForum(STATE.forumPage)
            toggleSections([authPop], [main, profileSection, profileInfos, navBar])
            pageWrapper.style.justifyContent = ''
            showMenu(profileMenu)
        // User not found in DB
        } else {
            console.log('else')
            show(error_wrongCred)
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
        const res = await signUp(firstName, lastName, email, passWord);
        if (res.data.status === "success"){
            setCurrentUser(res.user)
            toggleSections([signupWrapper], [loginWrapper])
            await loadAndRenderForum(STATE.forumPage)
        } else if (res.data.status === "error" && res.data.message === "user exists"){
           show(error_userExists)
        }
    }
}

signupBtn.addEventListener("click", () => {
    signUserUp()
});