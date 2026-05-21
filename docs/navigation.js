import { navBar, authPop, loginWrapper, pageWrapper, forumMessageSection, forumMainSection } from "./dom.js"
import { show, hide, toggleSections } from "./UI.js"


/* ========================
        Navigation
=========================== */

/* ------ Welcome section ------*/
show(authPop)
show(loginWrapper)
pageWrapper.style.justifyContent = 'center'

/* ------ Navbar ------ */
function menuNavigation(event){
    
    const menuIdList = ['nav-profile', 'nav-search', 'nav-forum']
    const sectionIDs = ['profile-section', 'forum-section', 'search-section']
    const clickedElement = event.target.closest("li");
    if (!clickedElement) return;
    const selectedMenu = document.getElementById(clickedElement.id);
    const correspondingSection = document.getElementById(clickedElement.dataset.sectionId)
    //const subSection = document.getElementById(subSections[correspondingSection.id])
    // Highlight selected menu
    menuIdList.forEach(id => {
        const el = document.getElementById(id)
        hideMenu(el)
    })
    showMenu(selectedMenu)
    // Show corresponding page section
    sectionIDs.forEach(el => {
        const section = document.getElementById(el)
        hide(section)
    })
    show(correspondingSection)
    if(correspondingSection.id === "forum-section"){
        toggleSections([forumMessageSection], [forumMainSection])
    }
}

/* ------ Menu animation ------ */
navBar.addEventListener("click", (event) => {
    menuNavigation(event)
})

export function showMenu(name){
    name.classList.remove("unselected")
    name.classList.add("selected")
}

export function hideMenu(name){
    name.classList.remove("selected")
    name.classList.add("unselected")
}


