const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:8082/ws'
});

$(function () {
    $('#submit_user_registration').click(() => connect());
});

function connect() {
    stompClient.activate();
}

stompClient.onConnect = (frame) => {
    setConnected(true);
    console.log('Connected: ' + frame);

    var requestOptions = {
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify(obj)
    };

    let obj = {
        name: name.value,
        email: email.value,
        pass: pass.value
    }

    fetch("http://localhost:8082/users", requestOptions)
        .then(response => response.json())
        .catch(error => console.log('error', error));



  //  stompClient.subscribe('/topic/users/user.list', (user) => {
        //showGreeting(JSON.parse(user.body));
  //  });

   // console.log('SUBSCRIBED: /topic/user/' + userId + '/workspace.list');
};