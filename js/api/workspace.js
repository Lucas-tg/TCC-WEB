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
    $("#insert").click(() => insertWorkspace());
    $("#insertProject").click(() => insertProject());
    $(".update-btn").click(() => updateWorkspace());
});




function showWorkspaces(user) {
    const workspacesContainer = document.getElementById("workspaces_teste");
  
    // Limpa o conteúdo atual do contêiner
    workspacesContainer.innerHTML = "";
  
    // Ordena os workspaces por data de atualização
    user.workspaces.sort(function (a, b) {
      return new Date(b.workspace.updateDate) - new Date(a.workspace.updateDate);
    });
  
    // Itera sobre os workspaces e cria elementos HTML para cada um
    user.workspaces.forEach((workspaces) => {
      var rowId = workspaces.workspace.id;
  
      const workspaceCard = document.createElement("div");
      workspaceCard.id = "clicavel";
      workspaceCard.className = "card";
  
      const cardHeader = document.createElement("div");
      cardHeader.id = `${rowId}`;
      cardHeader.className = "card-header";
      cardHeader.innerHTML = `
      <h2>${workspaces.workspace.name}</h2>
      
      `;
  
      const cardBody = document.createElement("div");
      cardBody.className = "card-body";
      //cardBody.setAttribute("ondrop", "drop(event)");
      //cardBody.setAttribute("ondragover", "allowDrop(event)");
  
      const item = document.createElement("div");
      item.className = "item";
  
      const description = document.createElement("div");
      description.className = "col-12";
      description.innerHTML = `<h8>${workspaces.workspace.description}</h8>`;
  
      item.appendChild(description);
      cardBody.appendChild(item);
  
      const cardFooter = document.createElement("div");
      cardFooter.className = "card-footer d-none";
      cardFooter.innerHTML = `<p>Data criação: ${workspaces.workspace.creationDate}</p><p>Data ultima atualização: ${workspaces.workspace.updateDate}</p>`;
  
      workspaceCard.appendChild(cardHeader);
      workspaceCard.appendChild(cardBody);
      workspaceCard.appendChild(cardFooter);
  
      workspacesContainer.appendChild(workspaceCard);
    });
  }