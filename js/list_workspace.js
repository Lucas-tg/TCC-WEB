const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:8082/ws'
});

stompClient.onWebSocketError = (error) => {
    console.error('Error with websocket', error);
};

stompClient.onStompError = (frame) => {
    console.error(`Broker reported error: ${frame.headers['message']}`);
    console.error(`Additional details: ${frame.body}`);
};

stompClient.onConnect = (frame) => {
    console.log(`Connected: ${frame}`);

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch(`http://localhost:8082/users/${userId}/workspaces`, requestOptions)
        .then(response => response.json())
        .then(json => {
            showWorkspaces(json);
        })
        .catch(error => console.log('error', error));

    const socketSub = `/topic/user/${userId}/workspace.list`;
    stompClient.subscribe(socketSub, (user) => {
        console.log(`RESPONSE FROM: ${socketSub}`);
        showWorkspaces(JSON.parse(user.body));
    });
    console.log(`SUBSCRIBED: ${socketSub}`);
};

function alertWorkspaceCreated() {
    // Mostrar a mensagem de sucesso
    document.getElementById('mensagemSucesso').style.display = 'block';

    // Fechar o modal
    $('#exampleModal').modal('hide');

    // Ocultar a mensagem de sucesso após 3 segundos (3000 milissegundos)
    setTimeout(function () {
        document.getElementById('mensagemSucesso').style.display = 'none';
    }, 3000); // 3 segundos (3000 ms)
}

function socketPub(dest, body) {
    if (body == null) {
        stompClient.publish({
            destination: dest
        });
        console.log(`PUB: ${dest}`);
    } else {
        stompClient.publish({
            destination: dest, body: JSON.stringify(body)
        });
        console.log(`PUB: ${dest}`);
        console.log(body);
    }
}

function insertWorkspace() {
    const dest = `/app/user/${userId}/workspace.add`;
    const body = {
        'name': $("#workspaceNameNewProject").val(), 'description': $("#workspaceDescriptionNewProject").val()
    };
    socketPub(dest, body);
    alertWorkspaceCreated();
}

function addUserWorkspace(workspaceId, email) {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch(`http://localhost:8082/users/${email}`, requestOptions)
        .then(response => response.json())
        .then(json => {
            console.log("AQUI")
            const dest = `/app/user.add/${json.id}/workspace/${workspaceId}`;
            socketPub(dest, null);
        })
        .catch(error => console.log('error', error));
}

function updateWorkspace(id, name, description) {
    const dest = `/app/user/${userId}/workspace.update/${id}`;
    const body = {'name': name, 'description': description}
    socketPub(dest, body);
}

function deleteWorkspace(id) {
    const dest = `/app/user/${userId}/workspace.delete/${id}`;
    socketPub(dest, null);
}

function showWorkspaces(user) {
    const workspacesContainer = document.getElementById("workspaces");

    // Limpa o conteúdo atual do contêiner
    workspacesContainer.innerHTML = "";

    // Ordena os workspaces por data de atualização
    user.workspaces.sort(function (a, b) {
        return new Date(b.workspace.updateDate) - new Date(a.workspace.updateDate);
    });

    // Itera sobre os workspaces e cria elementos HTML para cada um
    user.workspaces.forEach((workspaces) => {
        if (user.workspaces.length === 0) {
            $(`#workspaces`).remove();
        } else {

            let rowId = workspaces.workspace.id;

            const workspaceHTML = `
              <div id="${`workspace_${rowId}`}" class="workspace_card">
                <div class="workspace_header">
                  <h2 class="workspace_title" contenteditable="false">
                    ${workspaces.workspace.name}
                  </h2>
                    <a>
                        <i id="${`addUser_${rowId}`}" class="addUserIcon fa-solid fa-user-plus" data-row-id="${rowId}"></i>
                        <i id="${`pencil_${rowId}`}" class="pencilIcon fa fa-pencil pencil-link" data-row-id="${rowId}"></i>
                        <i id="${`trash_${rowId}`}" class="trashIcon fa fa-trash trash-link" data-row-id="${rowId}"></i>
                    </a>
                </div>
                <div class="workspace_card_body" contenteditable="false">
                  <p class="workspace_description">${workspaces.workspace.description}</p>
                </div>
                <div class="workspace_card_footer" onclick="goToWorkspacePage(event, ${rowId})">
                    <i class="fa-solid fa-circle-chevron-right fa-2xl"></i>
                </div>
              </div>
            `;
            workspacesContainer.innerHTML += workspaceHTML;

            const addUserIcons = document.querySelectorAll('.addUserIcon');
            addUserIcons.forEach(icon => {
                icon.addEventListener('click', function () {
                    console.log("entrou user");

                    // Obtém o ID do elemento clicado
                    const rowId = this.getAttribute('data-row-id');

                    // Obtém o modal pelo seu ID
                    const modal = document.getElementById('exampleModalUser');

                    if (modal) {
                        // Abre o modal
                        const bootstrapModal = new bootstrap.Modal(modal);
                        bootstrapModal.show();

                        // Adiciona um ouvinte de evento para o botão workspaceInsertUser
                        const addUserButton = document.getElementById('workspaceInsertUser');
                        addUserButton.addEventListener('click', function () {
                            // Obtém o nome de usuário inserido no formulário
                            const userName = document.getElementById('workspaceNameNewUser').value;

                            // Chama a função addUser com o ID do elemento clicado e o nome do usuário
                            addUserWorkspace(rowId, userName);

                            // Fecha o modal
                            bootstrapModal.hide();
                        });
                    }
                });
            });

            const editIcons = document.querySelectorAll('.pencilIcon');
            editIcons.forEach(icon => {
                icon.addEventListener('click', function () {
                    console.log("entrou caneta");

                    // Obtém o ID do elemento clicado
                    const rowId = this.getAttribute('data-row-id');

                    // Seleciona o título e a descrição pelo ID do workspace
                    const titleElement = document.getElementById(`workspace_${rowId}`).querySelector('.workspace_title');
                    const descriptionElement = document.getElementById(`workspace_${rowId}`).querySelector('.workspace_card_body p');

                    // Verifica se o conteúdo é editável
                    const isEditable = titleElement.isContentEditable;

                    // Alterna entre os modos de visualização e edição
                    titleElement.contentEditable = !isEditable;
                    descriptionElement.contentEditable = !isEditable;

                    // Atualiza a classe para refletir o modo de edição
                    titleElement.classList.toggle('editable', !isEditable);

                    // Se estiver no modo de edição, adiciona um ouvinte para salvar as alterações
                    if (!isEditable) {
                        titleElement.addEventListener('blur', function () {
                            // Obtém os novos dados
                            const name = $(".workspace_title").text();
                            const description = '';


                            // Chama a função updateWorkspace com o ID do elemento clicado e os novos dados
                            updateWorkspace(rowId, name, description);
                        });
                    }
                });
            });

            const deleteIcons = document.querySelectorAll('.trashIcon');
            deleteIcons.forEach(icon => {
                icon.addEventListener('click', function () {
                    deleteWorkspace(this.getAttribute('data-row-id'));
                });
            });
        }
    });
}

function goToWorkspacePage(event, workspaceId) {
    localStorage.setItem("workspaceId", workspaceId);
    window.location.href = 'workspace.html';
}

$(function () {returnButton
    $("#workspaceInsert").click(() => insertWorkspace());
    $("#returnButton").click(() => window.location.href = 'login.html');
});

const userId = localStorage.getItem("userId");
stompClient.activate();