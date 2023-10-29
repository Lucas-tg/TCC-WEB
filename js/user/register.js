$(function () {
    $('#submit_user_registration').click(() => register());
});

function register() {

    let obj = {
        name: name.value,
        email: email.value,
        pass: pass.value
    }

    var requestOptions = {
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify(obj)
    };


    fetch("http://localhost:8082/users", requestOptions)
        .then(response => response.json())
        .catch(error => console.log('error', error));



    //  stompClient.subscribe('/topic/users/user.list', (user) => {
    //showGreeting(JSON.parse(user.body));
    //  });

    // console.log('SUBSCRIBED: /topic/user/' + userId + '/workspace.list');
}