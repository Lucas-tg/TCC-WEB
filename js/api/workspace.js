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
        destination: `/app/user/${userId}/workspace.add`,
        body: JSON.stringify({ 'name': $("#workspaceNameNewProject").val(), 'description': $("#workspaceDescriptionNewProject").val() })
    });
    criarAreaDeTrabalho();
}

function updateWorkspace(id) {
    var name = document.getElementById(`workspaceName_${id}`).value;
    var description = document.getElementById(`workspaceDescription_${id}`).value;

    stompClient.publish({
        destination: `/app/user/${userId}/workspace.update/${id}`,
        body: JSON.stringify({ 'name': name, 'description': description })
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
            var rowId = workspaces.workspace.id;

            const workspaceCard = document.createElement("div");
            workspaceCard.id = "clicavel";
            workspaceCard.className = "card";

            const cardHeader = document.createElement("div");
            cardHeader.id = `${rowId}`;
            cardHeader.className = "card-header d-flex align-items-center";

            // Coloque o nome do workspace à esquerda
            const workspaceName = document.createElement("h2");
            workspaceName.innerHTML = workspaces.workspace.name;

            // Adicione os botões "Editar" e "Deletar" à direita
            const buttonsContainer = document.createElement("div");

            const editButton = document.createElement("button");
            editButton.className = "btn btn-success";
            editButton.innerHTML = '<i class="bi bi-pencil-square"></i>';
            editButton.addEventListener("click", () => {
                
                updateWorkspace(workspaces.workspace.id);
                console.log("Editar workspace: " + workspaces.workspace.id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-danger";
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
            deleteButton.addEventListener("click", () => {
                deleteWorkspace(workspaces.workspace.id)
                console.log("Deletar workspace: " + workspaces.workspace.id);
            });

            buttonsContainer.appendChild(editButton);
            buttonsContainer.appendChild(deleteButton);

            cardHeader.appendChild(workspaceName);
            cardHeader.appendChild(buttonsContainer);

            const cardBody = document.createElement("div");
            cardBody.className = "card-body";

            const item = document.createElement("div");
            item.className = "item";

            const description = document.createElement("div");
            description.className = "col-12";
            description.innerHTML = `<h8>${workspaces.workspace.description}</h8>`;

            item.appendChild(description);
            cardBody.appendChild(item);

            const cardFooter = document.createElement("div");
            cardFooter.className = "card-footer d-none";
            cardFooter.innerHTML = `<p>Data criação: ${workspaces.workspace.creationDate}</p><p>Data última atualização: ${workspaces.workspace.updateDate}</p>`;

            workspaceCard.appendChild(cardHeader);
            workspaceCard.appendChild(cardBody);
            workspaceCard.appendChild(cardFooter);

            workspacesContainer.appendChild(workspaceCard);
        }
    });
}



function showWorkspaces_old(user) {
    if (user.workspaces.length === 0) {
        $(`#tables`).remove();
    } else {
        //  $("#tables").html(`<table id="workspaceTable" class="table table-striped"><thead><caption>Workspaces</caption><tr><th>Id</th><th>Name</th><th>Description</th><th>Creation Date</th><th>Update Date</th><th>Owner</th><th>Action</th></tr></thead><tbody id='workspaceBody'></tbody></table>`);
        $("#tables").html(`<table id="workspaceTable" class="table table-striped"><</thead><tbody id='workspaceBody'></tbody></table>`);

        user.workspaces.sort(function (a, b) {
            return new Date(b.workspace.updateDate) - new Date(a.workspace.updateDate);
        });
        user.workspaces.forEach(workspaces => {

            var workspaceId = workspaces.workspace.id;

            var tableLine = `
            
            <td><input id='workspaceId_${workspaceId}' value='${workspaces.workspace.id}' readonly></td>`;
            tableLine += `<td><input id='workspaceName_${workspaceId}' value='${workspaces.workspace.name}'></td>`;
            tableLine += `<td><input id='workspaceDescription_${workspaceId}' value='${workspaces.workspace.description}'></td>`;
            tableLine += `<td><input id='workspaceCreationDate_${workspaceId}' value='${workspaces.workspace.creationDate}' readonly></td>`;
            tableLine += `<td><input id='workspaceUpdateDate_${workspaceId}' value='${workspaces.workspace.updateDate}' readonly></td>`;
            tableLine += `<td><input id='workspaceOwner_${workspaceId}' value='${workspaces.owner}' readonly></td>`;
            tableLine += `<td><button onclick='updateWorkspace(${workspaceId})'>Update</button>`;
            tableLine += `<button onclick='deleteWorkspace(${workspaceId})'>Delete</button></td>`;
            $("#workspaceBody").append(`<tr>${tableLine}</tr>`

            );

            $("#workspaceBody").append(`${tableLine}`

            );

            stompClient.subscribe(`/topic/workspace/${workspaceId}/project.list`, (workspace) => {
                showProjects(JSON.parse(workspace.body));

            });
            console.log(`SUBSCRIBED: /topic/workspace/${workspaceId}/project.list`);

            var requestOptions = {
                method: 'GET',
                redirect: 'follow'
            };

            fetch(`http://localhost:8082/workspaces/${workspaceId}/projects`, requestOptions)
                .then(response => response.json())
                .then(json => {
                    showProjects(json)
                });
        });
    }
}