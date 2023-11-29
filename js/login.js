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
        .catch(error => {
            console.log('error', error);
            userAlert('Falha ao realizar o login');
        });
}

function userAlert(message) {
    $(`#userAlert`).text(message);
    // Mostrar a mensagem de sucesso
    document.getElementById('userAlert').style.display = 'block';

    // Ocultar a mensagem de sucesso após 3 segundos (3000 milissegundos)
    setTimeout(function () {
        document.getElementById('userAlert').style.display = 'none';
    }, 3000); // 3 segundos (3000 ms)
}

function register() {
    window.location.href = 'user_register.html';
}

$(function () {
    $('#submit_login').click(() => login());
    $('#go_to_user_registration').click(() => register());
});