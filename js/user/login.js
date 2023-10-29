$(function () {
    $('#submit_login').click(() => login());
    $('#go_to_user_registration').click(() => register());
});

function login() {

    let obj = {
        email: email.value,
        pass: pass.value
    }

    var requestOptions = {
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify(obj)
    };


    fetch("", requestOptions) // Ainda não temos o endPoint
        .then(response => response.json())
        .then(userId = xxxx)
        .catch(error => console.log('error', error));

    const url = `workspace.html?userId=${userId}`;
    window.location.href = url;
}

function register() {
    const url = `user_registration.html`;
    window.location.href = url;
}