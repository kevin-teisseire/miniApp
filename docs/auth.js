import { loginWrapper, signupWrapper, main, profileSection, profileInfos, navBar, pageWrapper, error_wrongCred,
        error_userExists, profileMenu, signupBtn, loginBtn, signupTxt, loginTxt, authPop } from "./dom.js";
import { show, hide, toggleSections, cleanInputs } from "./UI.js";
import { loadForum, login, signUp } from "./API.js";
import { renderForum, setForumParam } from "./forum.js";
import { STATE } from "./state.js";
import { displayInfos } from "./profile.js";
import { showMenu, hideMenu } from "./navigation.js";

/* ========================
        Authentification
=========================== */

// Login text link to signup
signupTxt.addEventListener('click', () => {
    toggleSections([loginWrapper], [signupWrapper]);
});

// Signup text to login
loginTxt.addEventListener('click', () => {
    toggleSections([signupWrapper], [loginWrapper]);
});

// Login 
export function setCurrentUser(data){
    const user = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        description: data.description,
        image_url: data.image_url,
        user_id: data.user_id
    };
    STATE.currentUser = user;
    localStorage.setItem("user", JSON.stringify(user));
};


let isLoading = false;

async function logUserIn(){
    if (isLoading) return;
    isLoading = true;
    try{
        const email = document.getElementById('login-email-ipt').value;
        const password = document.getElementById('login-pw-ipt').value;
        // Check infos missing
        if (!email || !password){
            alert("Some fields are missing");
            return;
        };
        const loginRes = await login(email, password);
        // User found in DB
        if (loginRes.status === "success"){ 
            setCurrentUser(loginRes);
            displayInfos(STATE.currentUser);
            // Load forum messages
            const forumRes = await loadForum();
            setForumParam(forumRes);
            renderForum();
            toggleSections([authPop], [main, profileSection, profileInfos, navBar]);
            pageWrapper.style.justifyContent = '';
            showMenu(profileMenu);
        // User not found in DB
        } else {
            show(error_wrongCred);
        };
    } finally {
        isLoading = false;
    };
};

loginBtn.addEventListener("click", () => {
    logUserIn();
});

// Signup button
async function signUserUp(){
    // Save input values
    const first_name = document.getElementById('first-name-ipt').value;
    const last_name = document.getElementById('last-name-ipt').value;
    const email = document.getElementById('signup-email-ipt').value;
    const password = document.getElementById('signup-pw-ipt').value;
    // Check field values
    if (!first_name || !last_name || !email || !password){
        alert("Some fields are missing");
    } else {
        const res = await signUp(first_name, last_name, email, password);
        if (res.data.status === "success"){
            setCurrentUser(res.user);
            toggleSections([signupWrapper], [loginWrapper]);
        } else if (res.data.status === "error" && res.data.message === "user exists"){
           show(error_userExists);
        };
    };
};

signupBtn.addEventListener("click", () => {
    signUserUp();
});