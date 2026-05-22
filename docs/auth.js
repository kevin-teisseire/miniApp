import { show, hide, toggleSections, cleanInputs } from "./UI.js";
import { loadForum, login, signUp } from "./API.js";
import { renderForum, setForumParam } from "./forum.js";
import { STATE } from "./state.js";
import { displayInfos } from "./profile.js";
import { showMenu, hideMenu } from "./navigation.js";
import { DOM } from "./dom.js";

/* ========================
        Authentification
=========================== */

// Login text link to signup
DOM.signupTxt().addEventListener('click', () => {
    toggleSections([DOM.loginWrapper()], [DOM.signupWrapper()]);
});

// Signup text to login
DOM.loginTxt().addEventListener('click', () => {
    toggleSections([DOM.signupWrapper()], [DOM.loginWrapper()]);
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
        const email = DOM.loginEmail().value;
        const password = DOM.loginPassword().value
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
            const forumRes = await loadForum(STATE.currentUser["user_id"]);
            setForumParam(forumRes);
            renderForum();
            toggleSections([DOM.authPop()], [DOM.main(), DOM.profileSection(), DOM.profileInfos(), DOM.navBar()]);
            DOM.pageWrapper().style.justifyContent = '';
            showMenu(DOM.profileMenu());
        // User not found in DB
        } else {
            show(DOM.error_wrongCred);
        };
    } finally {
        isLoading = false;
    };
};

DOM.loginBtn().addEventListener("click", () => {
    logUserIn();
});

// Signup button
async function signUserUp(){
    // Save input values
    const first_name = DOM.firstName().value;
    const last_name = DOM.lastName().value;
    const email = DOM.email().value;
    const password = DOM.signupPassword().value;
    // Check field values
    if (!first_name || !last_name || !email || !password){
        alert("Some fields are missing");
    } else {
        const res = await signUp(first_name, last_name, email, password);
        if (res.data.status === "success"){
            setCurrentUser(res.user);
            toggleSections([DOM.signupWrapper()], [DOM.loginWrapper()]);
        } else if (res.data.status === "error" && res.data.message === "user exists"){
           show(DOM.error_userExists());
        };
    };
};

DOM.signupBtn().addEventListener("click", () => {
    signUserUp();
});