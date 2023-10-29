
// const userId = params.get('userId');
const userId = 1;
$(function () {
    $("#connect").click(() => connect());
    $("#disconnect").click(() => disconnect());
    $("#workspaceInsert").click(() => insertWorkspace());
    $(".update-btn").click(() => updateWorkspace());
});

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


function criarAreaDeTrabalho() {
    // Mostrar a mensagem de sucesso
    document.getElementById('mensagemSucesso').style.display = 'block';

    // Fechar o modal
    $('#exampleModal').modal('hide');

    // Ocultar a mensagem de sucesso após 3 segundos (3000 milissegundos)
    setTimeout(function () {
        document.getElementById('mensagemSucesso').style.display = 'none';
    }, 3000); // 3 segundos (3000 ms)
}

function insertWorkspace() {
    stompClient.publish({
        destination: `/app/user/${userId}/workspace.add`, body: JSON.stringify({
            'name': $("#workspaceNameNewProject").val(), 'description': $("#workspaceDescriptionNewProject").val()
        })
    });
    criarAreaDeTrabalho();
}

function updateWorkspace(id) {
    var name = document.getElementById(`workspaceName_${id}`).value;
    var description = document.getElementById(`workspaceDescription_${id}`).value;

    stompClient.publish({
        destination: `/app/user/${userId}/workspace.update/${id}`,
        body: JSON.stringify({'name': name, 'description': description})
    });
}

function deleteWorkspace(id) {
    stompClient.publish({
        destination: `/app/user/${userId}/workspace.delete/${id}`
    });
}

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
        if (user.workspaces.length === 0) {
            $(`#workspaces_teste`).remove();
        } else {

            let rowId = workspaces.workspace.id;

            const workspaceHTML = `
              <div id="${`workspace_${rowId}`}" class="workspace_card">
                <div class="workspace_header">
                  <h2 class="workspace_title" contenteditable="false">
                    ${workspaces.workspace.name}
                    <a>
                        <i id="${`pencil_${rowId}`}" class="fa fa-pencil pencil-link" data-row-id="${rowId}"></i>
                        <i id="${`trash_${rowId}`}" class="fa fa-trash trash-link" data-row-id="${rowId}"></i>
                    </a>
                  </h2>
                </div>
                <div class="workspace_card_body" contenteditable="false">
                  <p>${workspaces.workspace.description}</p>
                </div>
                <div class="workspace_card_footer" onclick="goToWorkspacePage(event, ${rowId})">
                    <i class="fa-solid fa-circle-chevron-right fa-2xl"></i>
                </div>
              </div>
            `;
            workspacesContainer.innerHTML += workspaceHTML;


            const editIcons = document.querySelectorAll(`#pencil_${rowId}`);
            editIcons.forEach(icon => {
                icon.addEventListener('click', function () {
                    /*
                    O conteúdo editável pode ser acessado usando
                     icon.parentElement.previousElementSibling.textContent para o título
                     e icon.parentElement.nextElementSibling.textContent para a descrição.
                    */
                    //updateWorkspace(this.getAttribute('data-row-id')); // not working

                });
            });

            const deleteIcons = document.querySelectorAll(`#trash_${rowId}`);
            deleteIcons.forEach(icon => {
                icon.addEventListener('click', function () {
                    console.log("ENTROU")
                    deleteWorkspace(this.getAttribute('data-row-id'));
                });
            });


        }
    });
}

function goToWorkspacePage(event, workspaceId) {
    // event.stopPropagation();
    // if (event.target.id === `workspace_${workspaceId}`) {
    const url = `project.html?id=${workspaceId}`;
    window.location.href = url;
    // }
}