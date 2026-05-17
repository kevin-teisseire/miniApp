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
})

// Signup text to login
loginTxt.addEventListener('click', () => {
    toggleSections([signupWrapper], [loginWrapper]);
})

// Login 
export function setCurrentUser(data){
    STATE.currentUser = {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        description: data.description,
        imgUrl: data.img_url,
        userId: data.user_id
    };
    localStorage.setItem("user", JSON.stringify(user));
}



let isLoading = false;

async function logUserIn(){
    if (isLoading) return;
    isLoading = true;
    try{
        const email = document.getElementById('login-email-ipt').value;
        const passWord = document.getElementById('login-pw-ipt').value;
        // Check infos missing
        if (!email || !passWord){
            alert("Some fields are missing");
            return;
        }
        const loginRes = await login(email, passWord);
        // User found in DB
        console.log('loginRes: ',loginRes)
        if (loginRes.status === "success"){ 
            console.log('success')
            setCurrentUser(loginRes);
            displayInfos(STATE.currentUser);
            // Load forum messages
            const forumRes = await loadForum();
            console.log(`forumRes: ${forumRes}`)
            setForumParam(forumRes)
            renderForum()
            toggleSections([authPop], [main, profileSection, profileInfos, navBar]);
            pageWrapper.style.justifyContent = '';
            showMenu(profileMenu);
            console.log(`auth-logUserIn: state = ${STATE.currentUser}`);
        // User not found in DB
        } else {
            show(error_wrongCred);
        }
    } finally {
        isLoading = false;
    }
}

loginBtn.addEventListener("click", () => {
    logUserIn();
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
            setCurrentUser(res.user);
            toggleSections([signupWrapper], [loginWrapper]);
        } else if (res.data.status === "error" && res.data.message === "user exists"){
           show(error_userExists);
        }
    }
}

signupBtn.addEventListener("click", () => {
    signUserUp();
});