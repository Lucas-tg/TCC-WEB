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

    stompClient.subscribe(`/topic/user/${userId}/workspace.list`, (user) => {
        showWorkspaces(JSON.parse(user.body));
    });
    console.log(`SUBSCRIBED: /topic/user/${userId}/workspace.list`);


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

function insertWorkspace() {
    stompClient.publish({
        destination: `/app/user/${userId}/workspace.add`, body: JSON.stringify({
            'name': $("#workspaceNameNewProject").val(), 'description': $("#workspaceDescriptionNewProject").val()
        })
    });
    alertWorkspaceCreated();
}

// rowId = id do workspace;
// userName = input do usuario no modal (email do usuario)
function addUserWorkspace(rowId, userName) {
    console.log(`${rowId} ${userName}`);
    /*
    stompClient.publish({
       // destination: ...
    });
    */
}

function updateWorkspace(id, name, description) {
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
                    <a>
                        <i id="${`addUser_${rowId}`}" class="addUserIcon fa-solid fa-user-plus" data-row-id="${rowId}"></i>
                        <i id="${`pencil_${rowId}`}" class="pencilIcon fa fa-pencil pencil-link" data-row-id="${rowId}"></i>
                        <i id="${`trash_${rowId}`}" class="trashIcon fa fa-trash trash-link" data-row-id="${rowId}"></i>
                    </a>
                  </h2>
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
                            const name = this.textContent;
                            const description = descriptionElement.textContent;

                            // Chama a função updateWorkspace com o ID do elemento clicado e os novos dados
                            updateWorkspace(rowId, name, description);
                        });
                    }
                });
            });

            const deleteIcons = document.querySelectorAll('.trashIcon');
            deleteIcons.forEach(icon => {
                icon.addEventListener('click', function () {
                    console.log("ENTROU");
                    deleteWorkspace(this.getAttribute('data-row-id'));
                });
            });
        }
    });
}

function goToWorkspacePage(event, workspaceId) {
    sessionStorage.setItem("workspaceId", workspaceId);
    window.location.href = 'workspace.html';
}

$(function () {
    $("#workspaceInsert").click(() => insertWorkspace());
    $(".update-btn").click(() => updateWorkspace());
});

const userId = sessionStorage.getItem("userId");
stompClient.activate();