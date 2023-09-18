const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:8082/ws'
});

$(function () {
    $('#submit_login').click(() => connect());
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
        email: email.value,
        pass: pass.value
    }

    fetch("", requestOptions) // Ainda não temos o endPoint
        .then(response => response.json())
        .catch(error => console.log('error', error));
};