/* ========================
            API
=========================== */
/* ------ Log in ------ */


export async function login(email, password){
    const res = await fetch("https://miniapp-cc0r.onrender.com/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    const data = await res.json();
    return data
};

/* ------ Sign up ------ */

export async function signUp(first_name, last_name, email, password){
   const res = await fetch("https://miniapp-cc0r.onrender.com/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: password
        })
    })
    const data = await res.json()
    let user = null
    if (data.status === "success"){
        user = {
            first_name: first_name,
            last_name: last_name,
            email: email,
            user_id: data.user_id
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
    const res = await fetch("https://miniapp-cc0r.onrender.com/upload", {
        method: "POST",
        body: formData
    })
    const data = await res.json()
    return data
}

export async function loadForum(){
    const res = await fetch("https://miniapp-cc0r.onrender.com/get-forum", {
        method: "GET"
    })
    const data = await res.json()
    console.log(`loadForum : data = ${data}`)
    return data
}

/* ------ Forum ------ */

export async function post(title, description, user_id){
    const res = await fetch("https://miniapp-cc0r.onrender.com/post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title, 
            description: description,
            user_id: user_id 
        })
    });
    const data = await res.json();
    console.log('post():', data)
    return data;
}








