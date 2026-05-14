/* ========================
            API
=========================== */

/* ------ Log in ------ */

export async function login(email, passWord){
    const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: passWord
        })
    })
    const data = await res.json();
    console.log(data)
    let user = null
    if (data.status === "success"){
        // save data 
        user = {
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            description: data.description,
            imgUrl: data.img_url,
            userId: data.user_id
        } 
    }
    return {
            data, 
            user
    }
};

/* ------ Sign up ------ */

export async function signUp(firstName, lastName, email, passWord){
   const res = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            firstname: firstName,
            lastname: lastName,
            email: email,
            password: passWord
        })
    })
    const data = await res.json()
    let user = null
    if (data.status === "success"){
        user = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            userId: data.user_id
        }
        return {
            data,
            user
        }
    }
};


/* ------ Upload profile Form ------ */

export async function uploadForm(formData){
    // Promise
    const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData
    })
    const data = await res.json()
    const user = {
        firstName: data.first_name,
        lastName: data.last_name,
        description: data.description,
        email: data.email, 
        imgUrl: data.image_url
    }
    return user
}

export async function loadForum(page){
    const res = await fetch(`http://localhost:8000/get-forum?page=${page}`, {
        method: "GET"
    })
    const data = await res.json()
    console.log("API.JS :", data)
    return data
}

/* ------ Forum ------ */

export async function post(title, description, userId){
    const res = await fetch("http://localhost:8000/post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title, 
            description: description,
            userId: userId 
        })
    })
    const data = await res.json()
    return data
}








