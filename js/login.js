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
            if (userId != null) {
                localStorage.setItem("userId", userId);
                window.location.href = 'list_workspace.html';
            }
        })
        .catch(error => console.log('error', error));
}

function register() {
    window.location.href = 'user_register.html';
}

$(function () {
    $('#submit_login').click(() => login());
    $('#go_to_user_registration').click(() => register());
});