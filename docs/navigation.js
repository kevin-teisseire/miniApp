/* ========================
        Navigation
=========================== */

import { show, hide, toggleSections } from "./UI.js"
import { DOM } from "./dom.js"

/* ------ Welcome section ------*/
show(DOM.authPop());
show(DOM.loginWrapper());
DOM.pageWrapper().style.justifyContent = 'center';

/* ------ Navbar ------ */

const sections = {
    "profile-section": {
        "id": "profile-section",
        "menu": "nav-profile",
        "main": "profile-infos",
        "secondary": "profile-modify-form",
        "focus-input": null
    },
    "forum-section": {
        "id": "forum-section",
        "menu": "nav-forum",
        "main": "forum-main-section",
        "secondary": "forum-message-section",
        "focus-input": null
    }, 
    "search-section": {
        "id": "search-section",
        "menu": "nav-search",
        "main": null,
        "secondary": null,
        "focus-input": "search-bar"
    }, 
}

/* ------ Navbar ------ */
function menuNavigation(event){
    // Save clicked element
    const clickedElement = event.target.closest("li");
    // Prevent blank click
    if (!clickedElement) return;
    // Save corresponding menu id
    const selectedMenu = document.getElementById(clickedElement.id);
    // Find corresponding section in sections object
    const sectionMatch = Object.values(sections).find(el => el.menu === selectedMenu.id)
    const correspondingSection = document.getElementById(sectionMatch.id)
    // Highlight selected menu
    Object.values(sections).forEach(el => {
        const menu = document.getElementById(el.menu);
        hideMenu(menu);
    });
    showMenu(selectedMenu)
    // Show corresponding page section
    Object.values(sections).forEach(el => {
        const section = document.getElementById(el.id);
        hide(section);
    });
    show(correspondingSection)
    // Toggle between subsections if needed
    if(sectionMatch["secondary"]){
        const subSecMain = document.getElementById(sections[correspondingSection.id].main)
        const subSecSecond = document.getElementById(sections[correspondingSection.id].secondary)
        toggleSections([subSecSecond], [subSecMain])
    }
    // Focus main input of the section if needed
    if(sectionMatch["focus-input"]){
        const input = document.getElementById(sectionMatch["focus-input"])
        input.focus()
    }
};


/* ------ Menu animation ------ */
DOM.navBar().addEventListener("click", (event) => {
    menuNavigation(event);
});

export function showMenu(name){
    name.classList.remove("unselected");
    name.classList.add("selected");
};

export function hideMenu(name){
    name.classList.remove("selected");
    name.classList.add("unselected");
};



