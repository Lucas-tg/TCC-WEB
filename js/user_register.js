function userAlert(message) {
    $(`#userAlert`).text(message);
    // Mostrar a mensagem de sucesso
    document.getElementById('userAlert').style.display = 'block';

    // Ocultar a mensagem de sucesso após 3 segundos (3000 milissegundos)
    setTimeout(function () {
        document.getElementById('userAlert').style.display = 'none';
    }, 3000); // 3 segundos (3000 ms)
}

function user_register() {

    let obj = {
        name: nome_user_registration.value,
        email: email_user_registration.value,
        pass: password_user_registration.value
    }

    var requestOptions = {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    };


    fetch("http://localhost:8082/users/register", requestOptions)
        .then(response => response.json())
        .then(json => {
            const userId = json.id;
            if (userId == null) {
                userAlert('Falha ao realizar o cadastro');
            } else {
                localStorage.setItem("userId", userId);
                window.location.href = `list_workspace.html`;
            }
            // mensagem de erro para o usuário
        })
        .catch(error => console.log('error', error));
}

$(function () {
    $('#submit_user_registration').click(() => user_register());
    $("#returnButton").click(() => window.location.href = 'login.html');
});