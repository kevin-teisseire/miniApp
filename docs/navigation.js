import { show, hide, toggleSections } from "./UI.js"
import { DOM } from "./dom.js"


/* ========================
        Navigation
=========================== */

/* ------ Welcome section ------*/
show(DOM.authPop())
show(DOM.loginWrapper())
DOM.pageWrapper().style.justifyContent = 'center'

/* ------ Navbar ------ */
function menuNavigation(event){
    
    const menuIdList = ['nav-profile', 'nav-search', 'nav-forum']
    const sectionIDs = ['profile-section', 'forum-section', 'search-section']
    const clickedElement = event.target.closest("li");
    console.log(clickedElement)
    if (!clickedElement) return;
    const selectedMenu = document.getElementById(clickedElement.id);
    const correspondingSection = document.getElementById(clickedElement.dataset.sectionId)
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
    // Toggle between forum subsections
    if(correspondingSection.id === "forum-section"){
        toggleSections([DOM.forumMessageSection()], [DOM.forumMainSection()])
    } else if (correspondingSection.id === "search-section"){
        console.log(true)
        DOM.searchBar().focus()
    }
}

/* ------ Menu animation ------ */
DOM.navBar().addEventListener("click", (event) => {
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



