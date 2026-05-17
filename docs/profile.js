import { greeting, profileName, profileSurname, profileEmail, profileDescription, profileImage, imgUploader, 
        modifyImage, modifyDescription, modifyEmail, modifyName, modifySurname, formSubmitBtn, customUploader,
        cancelBtn, profileModBtn, profileForm, profileInfos, profileSection } from "./dom.js"
import { show, hide, toggleSections, cleanInputs } from "./UI.js"
import { setCurrentUser } from "./auth.js"
import { STATE } from "./state.js"
import { uploadForm } from "./API.js"

/* ========================
        Profile
=========================== */

export function displayInfos(userObj){
    // Display user infos in inputs
    greeting.textContent = `Hi ${userObj["first_name"]} !`
    profileName.textContent = userObj["first_name"];
    profileSurname.textContent = userObj["last_name"];
    profileEmail.textContent = userObj["email"];
    profileDescription.textContent = userObj["description"]
    if (userObj["image_url"]){
        console.log(`url : ${userObj["image_url"]}`)
        profileImage.style.backgroundImage = `url(${userObj["image_url"]})`
    } else {
        profileImage.style.backgroundImage = `url(https://res.cloudinary.com/dndeflndh/image/upload/v1779044690/Capture_d_e%CC%81cran_2026-05-17_a%CC%80_21.04.43_rmc8mm.png)`
        
    }
}

// Image uploader
customUploader.addEventListener("click", () => {
    imgUploader.click();
});

let selectedFile = null

function previewImage(){
    // Preview uploaded image
    const file = imgUploader.files[0]
    selectedFile = file
    if (file){
        const previewSrc = URL.createObjectURL(file)
        modifyImage.style.backgroundImage = `url(${previewSrc})`
        const img = new Image()
        img.src = previewSrc
        img.onload = () => {
            URL.revokeObjectURL(previewSrc);
        };
    }
}

imgUploader.addEventListener("change", () => {
    previewImage()
})

// Submit modifications button
function createFormData(){
    const formData = new FormData()
    formData.append("user_id", STATE.currentUser["user_id"])
    if (selectedFile){
        formData.append("image", selectedFile)
    }
    if (modifyDescription.value){
        formData.append("new_description", modifyDescription.value)
    }
    if (modifyEmail.value){
        formData.append("new_email", modifyEmail.value)
    }
    if (modifyName.value){
        formData.append("new_name", modifyName.value)
    }
    if (modifySurname.value){
        formData.append("new_surname", modifySurname.value)
    }
    return formData
}

formSubmitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const formData = createFormData()
    const data = await uploadForm(formData);
    setCurrentUser(data)
    console.log('state user : ', STATE.currentUser)
    toggleSections([profileForm], [profileSection, profileInfos])
    displayInfos(STATE.currentUser);
    cleanInputs([modifyDescription, modifyEmail, modifyName, modifySurname])
})

// Cancel modifications button
cancelBtn.addEventListener("click", () => {
    toggleSections([profileForm], [profileInfos])
})

// Modify user infos button
function placeHolderText(input, text){
    input.placeholder = text
}

function profilePlaceholders(user){
    placeHolderText(modifyName, user["first_name"])
    placeHolderText(modifySurname, user["last_name"])
    placeHolderText(modifyEmail, user["email"])
    if (user["description"]){
        placeHolderText(modifyDescription, user["description"])
    }
    modifyImage.style.backgroundImage = `url(${user["image_url"]})`
}

profileModBtn.addEventListener("click", () => {
    toggleSections([profileInfos], [profileForm])
    // Get stored user data 
    // Add values for input placeholders
    profilePlaceholders(STATE.currentUser)
})
