const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:8082/ws'
});

stompClient.onConnect = (frame) => {
    setConnected(true);
    console.log(`Connected: ${frame}`);

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    stompClient.subscribe(`/topic/user/${userId}/workspace.list`, (user) => {
        showWorkspaces(JSON.parse(user.body));
    });
    console.log(`SUBSCRIBED: /topic/user/${userId}/workspace.list`);

    fetch(`http://localhost:8082/users/${userId}/workspaces`, requestOptions)
        .then(response => response.json())
        .then(json => {
            showWorkspaces(json);
        })
        .catch(error => console.log('error', error));
};

stompClient.onWebSocketError = (error) => {
    console.error('Error with websocket', error);
};

stompClient.onStompError = (frame) => {
    console.error(`Broker reported error: ${frame.headers['message']}`);
    console.error(`Additional details: ${frame.body}`);
};

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#tables").show();
    } else {
        $("#tables").hide();
    }
}

function connect() {
    stompClient.activate();
}

function disconnect() {
    stompClient.deactivate();
    setConnected(false);
    console.log("Disconnected");
}


const userId = 1;
$(function () {
    $("form").on('submit', (e) => e.preventDefault());
    $("#connect").click(() => connect());
    $("#disconnect").click(() => disconnect());
    $("#workspaceInsert").click(() => insertWorkspace());
    $("#insertProject").click(() => insertProject());
    $(".update-btn").click(() => updateWorkspace());
});