/* ========================
        Profile
=========================== */

import { show, hide, toggleSections, cleanInputs } from "./UI.js";
import { setCurrentUser } from "./auth.js";
import { STATE } from "./state.js";
import { uploadForm } from "./API.js";
import { DOM } from "./dom.js";

export function displayInfos(userObj){
    // Display user infos in inputs
    DOM.greeting().textContent = `Hi ${userObj["first_name"]} !`;
    DOM.profileName().textContent = userObj["first_name"];
    DOM.profileSurname().textContent = userObj["last_name"];
    DOM.profileEmail().textContent = userObj["email"];
    DOM.profileDescription().textContent = userObj["description"];
    if (userObj["image_url"]){
        DOM.profileImage().style.backgroundImage = `url(${userObj["image_url"]})`;
    } else {
        DOM.profileImage().style.backgroundImage = `url(https://res.cloudinary.com/dndeflndh/image/upload/v1779044690/Capture_d_e%CC%81cran_2026-05-17_a%CC%80_21.04.43_rmc8mm.png)`;
    };
};

// Image uploader
DOM.customUploader().addEventListener("click", () => {
    DOM.imgUploader().click();
});

let selectedFile = null;

function previewImage(){
    // Preview uploaded image
    const file = DOM.imgUploader().files[0];
    selectedFile = file;
    if (file){
        const previewSrc = URL.createObjectURL(file);
        DOM.modifyImage().style.backgroundImage = `url(${previewSrc})`;
        const img = new Image();
        img.src = previewSrc;
        img.onload = () => {
            URL.revokeObjectURL(previewSrc);
        };
    };
};

// Preview when image is uploaded
DOM.imgUploader().addEventListener("change", () => {
    previewImage();
});

// Submit modifications button
function createFormData(){
    const formData = new FormData();
    formData.append("user_id", STATE.currentUser["user_id"])
    if (selectedFile){
        formData.append("image", selectedFile);
    };
    if (DOM.modifyDescription().value){
        formData.append("new_description", DOM.modifyDescription().value);
    };
    if (DOM.modifyEmail().value){
        formData.append("new_email", DOM.modifyEmail().value);;
    };
    if (DOM.modifyName().value){
        formData.append("new_name", DOM.modifyName().value);
    };
    if (DOM.modifySurname().value){
        formData.append("new_surname", DOM.modifySurname().value);
    };
    return formData;
};

// Submit user profile modification on submit button click
DOM.formSubmitBtn().addEventListener("click", async (e) => {
    e.preventDefault();
    const formData = createFormData();
    const data = await uploadForm(formData);
    setCurrentUser(data);
    toggleSections([DOM.profileForm()], [DOM.profileSection(), DOM.profileInfos()]);
    displayInfos(STATE.currentUser);
    cleanInputs([DOM.modifyDescription(), DOM.modifyEmail(), DOM.modifyName(), DOM.modifySurname()]);
});

// Cancel modifications button
DOM.cancelBtn().addEventListener("click", () => {
    toggleSections([DOM.profileForm()], [DOM.profileInfos()]);
    cleanInputs([DOM.modifyName(), DOM.modifySurname(), DOM.modifyEmail(), DOM.modifyDescription()])
});

// Modify user infos button
function placeHolderText(input, text){
    input.placeholder = text;
};

// Display current user details in modify input's placeholders
function profilePlaceholders(user){
    placeHolderText(DOM.modifyName(), user["first_name"]);
    placeHolderText(DOM.modifySurname(), user["last_name"]);
    placeHolderText(DOM.modifyEmail(), user["email"]);
    if (user["description"]){
        placeHolderText(DOM.modifyDescription(), user["description"]);
    };
    DOM.modifyImage().style.backgroundImage = `url(${user["image_url"]})`;
};

// Switch sections to modify infos form
DOM.profileModBtn().addEventListener("click", () => {
    toggleSections([DOM.profileInfos()], [DOM.profileForm()]);
    // Add values for input placeholders
    profilePlaceholders(STATE.currentUser);
});
