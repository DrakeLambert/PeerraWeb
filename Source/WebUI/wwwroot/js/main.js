const accessTokenKey = "accessToken";
const refreshTokenKey = "refreshToken";
const apiHost = "https://localhost:5002/api/";
var loggedIn = null;
let username = null;
let email = null;
let bio = null;

isLoggedIn().then(value => {
    let loginContainer = document.getElementById("loginContainer");
    let loggedInContainer = document.getElementById("loggedInContainer");
    loginContainer.hidden = value;
    loggedInContainer.hidden = !value;
    if (value) {
        document.getElementById("usernameDisplay").innerHTML = "Hi, " + username + "!";
    }
});

function logout() {
    setAccessToken("");
    setRefreshToken("");
    location.reload();
}

async function isLoggedIn() {
    if (loggedIn === null) {
        await isLoggedInBase();
    }
    return loggedIn;
}

async function isLoggedInBase() {
    let accessToken = getAccessToken();
    if (!accessToken || accessToken === "") {
        loggedIn = false;
        return false;
    }

    let infoResponse = await fetch(apiHost + "account/info", {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors",
        headers: {
            "Authorization": "Bearer " + accessToken
        }
    });

    if (infoResponse.ok) {
        let body = await infoResponse.json();
        username = body.username;
        email = body.email;
        bio = body.bio;
        loggedIn = true;
        return true;
    }

    let refreshSuccessful = await refreshTokens();

    if (refreshSuccessful) {
        return await isLoggedIn();
    }
    else {
        loggedIn = false;
        return false;
    }
}

async function refreshTokens() {
    let tokenRefreshBody = {
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken()
    };

    let response = await fetch(apiHost + "account/refresh", {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(tokenRefreshBody)
    });

    if (response.ok) {
        let body = await response.json();
        setAccessToken(body.accessToken.token);
        setRefreshToken(body.refreshToken.token);
    }

    return response.ok;
}

function getAccessToken() {
    return localStorage.getItem(accessTokenKey);
}
function getRefreshToken() {
    return localStorage.getItem(refreshTokenKey);
}
function setAccessToken(token) {
    localStorage.setItem(accessTokenKey, token);
}
function setRefreshToken(token) {
    localStorage.setItem(refreshTokenKey, token);
}
