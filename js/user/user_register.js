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
            if (userId != null) {
                sessionStorage.setItem("userId", userId);
                window.location.href = `list_workspace.html`;
            }
            // mensagem de erro para o usuário
        })
        .catch(error => console.log('error', error));
}

$(function () {
    $('#submit_user_registration').click(() => user_register());
});