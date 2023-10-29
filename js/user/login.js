$(function () {
    $('#submit_login').click(() => login());
    $('#go_to_user_registration').click(() => register());
});

function login() {

    let obj = {
        email: inputEmail.value,
        pass: inputPassword.value
    }

    var requestOptions = {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    };


    fetch("http://localhost:8082/users/login", requestOptions)
        .then(response => response.json())
        .then(json => {
            const userId = json.id;
            window.location.href = `workspace.html?userId=${userId}`;
        })
        .catch(error => console.log('error', error));
}

function register() {
    const url = `user_registration.html`;
    window.location.href = url;
}