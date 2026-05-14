/* ========================
            UI
=========================== */

export const show = (...el) => {
    el.forEach(el => {
        el.style.display = 'flex'
        el.style.opacity = 1
    })
};

export const hide = (...el) => {
    el.forEach(el => {
        el.style.display = 'none'
        el.style.opacity = 0
    })
};

export function toggleSections(toHide, toShow){
    hide(...toHide)
    show(...toShow)
}

export function cleanInputs(inputList){
    inputList.forEach(el => {
        el.value = ''
    })
}
