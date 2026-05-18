const hostname = window.location.hostname

const isLocal = 
    hostname === "localhost" ||
    hostname === "127.0.0.1"

const API_URLS = {
    local: "http://localhost:8000",
    prod: "https://miniapp-cc0r.onrender.com"
}

export const API_URL = isLocal ? API_URLS.local : API_URLS.prod;