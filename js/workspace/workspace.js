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

    const socketSub = `/topic/workspace/${workspaceId}/project.list`;

    stompClient.subscribe(socketSub, (workspace) => {
        console.log(`RESPONSE FROM: ${socketSub}`);
        showProjects(JSON.parse(workspace.body));
    });
    console.log(`SUBSCRIBED: ${socketSub}`);

    var requestOptions = {
        method: 'GET', redirect: 'follow'
    };

    fetch(`http://localhost:8082/workspaces/${workspaceId}/projects`, requestOptions)
        .then(response => response.json())
        .then(json => {
            showProjects(json);
        })
        .catch(error => console.log('error', error));
};

function getCatalogs(projectId, projectPosition){

    const socketSub = `/topic/project/${projectId}/catalog.list`;

    stompClient.subscribe(socketSub, (project) => {
        console.log(`RESPONSE FROM: ${socketSub}`);
        showCatalogs(JSON.parse(project.body), projectPosition);
    });
    console.log(`SUBSCRIBED: ${socketSub}`);

    var requestOptions = {
        method: 'GET', redirect: 'follow'
    };

    fetch(`http://localhost:8082/projects/${projectId}/catalogs`, requestOptions)
        .then(response => response.json())
        .then(json => {
            showCatalogs(json, projectPosition);
        })
        .catch(error => console.log('error', error));
}

function getCards(catalogId, projectPosition, catalogPosition){

    const socketSub = `/topic/catalog/${catalogId}/card.list`;

    stompClient.subscribe(socketSub, (catalog) => {
        console.log(`RESPONSE FROM: ${socketSub}`);
        showCards(JSON.parse(catalog.body), projectPosition, catalogPosition);
    });
    console.log(`SUBSCRIBED: ${socketSub}`);

    var requestOptions = {
        method: 'GET', redirect: 'follow'
    };

    fetch(`http://localhost:8082/catalogs/${catalogId}/cards`, requestOptions)
        .then(response => response.json())
        .then(json => {
            showCards(json, projectPosition, catalogPosition);
        })
        .catch(error => console.log('error', error));
}

function showProjects(workspaces) {
    if (!Array.isArray(workspaces)) {
        // transform to array
        workspaces = [workspaces];
    }

    workspaces.forEach(workspace => {
        const projectsCount = workspace.projects.length;

        // clear projects
        if (projectsCount === 0) {
            $(`#projects`).remove();

        } else {
            workspace.projects.sort(function (a, b) {
                return a.workspacePosition - b.workspacePosition;
            });

            // tela não possui nada
            if ($(`#projects`).length <= 0) {
                $("#main").append(`<div class="container" id="projects"></div>`);
            }
            workspace.projects.forEach(project => {

                const position = project.workspacePosition;

                // reescreve os dados do projeto para aquela posição
                if ($(`#project_${position}`).length > 0) {
                    $(`#project_${position} #header #project_name`).text(project.name);

                    getCatalogs(project.id, position);

                } else { // cria novo projeto no final
                    const divProject = `
                            <div class="project_card" id="project_${position}">
                                <div class="project_card_header" id="header">
                                    <h1 id="project_name">${project.name}</h1>
                                </div>
                                <div class="list-container" id="list_catalog">
                                    <div class="add-list" id="insert_catalog">
                                        <div class="title editable">+ Adicionar novo catálogo</div>
                                    </div>
                                </div>
                            </div>`;
                    $(`#projects`).append(divProject);

                    getCatalogs(project.id, position);
                }
            });

            // remove projetos que sobraram
            while ((idRemove = $(`#projects`).children().length) > projectsCount) {
                $(`#project_${idRemove}`).remove();
                idRemove--;
            }
        }
    });
}

function showCatalogs(projects, projectPosition) {
    if (!Array.isArray(projects)) {
        // transform to array
        projects = [projects];
    }

    projects.forEach(project => {

        var catalogsCount = project.catalogs.length;

        project.catalogs.sort(function (a, b) {
            return a.projectPosition - b.projectPosition;
        });

        project.catalogs.forEach(catalog => {

            const position = catalog.projectPosition;

            // reescreve os dados do catálogo para aquela posição
            if ($(`#project_${projectPosition} #list_catalog`).length > 1) {
                $(`#project_${projectPosition} #list_catalog #catalog_${position} #catalog_name`).text(catalog.name);

                getCards(catalog.id, projectPosition, position);

            } else { // cria novo catálogo no final

                $(`#project_${projectPosition} #list_catalog #insert_catalog`).remove();
                const divCatalog = `
                    <div class="list" id="catalog_${position}">
                        <div class="title removable editable" id="catalog_name">${catalog.name}</div>
                        <div class="content" id="list_card"></div>
                        <div class="add-card editable" id="insert_card">+ Adicionar novo card</div>
                    </div>
                    <div class="add-list" id="insert_catalog">
                        <div class="title editable">+ Adicionar novo catálogo</div>
                    </div>`;
                $(`#project_${projectPosition} #list_catalog`).append(divCatalog);

                getCards(catalog.id, projectPosition, position);
            }
        });

        // remove catalogos que sobraram
        while ((idRemove = $(`#project_${projectPosition} #list_catalog`).children().length - 1) > catalogsCount) {
            $(`#project_${projectPosition} #list_catalog catalog_${idRemove}`).remove();
            idRemove--;
        }
    });
}

function showCards(catalogs, projectPosition, catalogPosition) {
    if (!Array.isArray(catalogs)) {
        // transform to array
        catalogs = [catalogs];
    }

    catalogs.forEach(catalog => {

        var cardsCount = catalog.cards.length;

        catalog.cards.sort(function (a, b) {
            return a.catalogPosition - b.catalogPosition;
        });

        catalog.cards.forEach(card => {

            const position = card.catalogPosition;

            // reescreve os dados do cartão para aquela posição
            if ($(`#project_${projectPosition} #list_catalog #catalog_${catalogPosition} #list_card`).length > 1) {

                $(`#project_${projectPosition} #list_catalog #catalog_${catalogPosition} #list_card card_${position}`).text(card.name);

                // cria novo cartão no final
            } else {
                // $(`#project_${projectPosition} #list_catalog #catalog_${catalogPosition} #insert_card`).remove();
                const divCard = `<div class="card removable editable" id="card_${position}">${card.name}</div>`;
                $(`#project_${projectPosition} #list_catalog #catalog_${catalogPosition} #list_card`).append(divCard);

            }
        });

        // remove cartões que sobraram
        while ((idRemove = $(`#project_${projectPosition} #list_catalog #catalog_${catalogPosition} #list_card`).children().length) > cardsCount) {
            $(`#project_${projectPosition} #list_catalog catalog_${idRemove} #catalog_${catalogPosition} #list_card card_${position}`).remove();
            idRemove--;
        }
    });
}

function alertCreated(message) {
    $(`#sucessAlert`).text(message);
    // Mostrar a mensagem de sucesso
    document.getElementById('sucessAlert').style.display = 'block';

    // Fechar o modal
    $('#createProjectModal').modal('hide');

    // Ocultar a mensagem de sucesso após 3 segundos (3000 milissegundos)
    setTimeout(function () {
        document.getElementById('sucessAlert').style.display = 'none';
    }, 3000); // 3 segundos (3000 ms)
}

function insertProject() {
    stompClient.publish({
        destination: `/app/workspace/${workspaceId}/project.add`, body: JSON.stringify({
            'name': $("#newProjectName").val(),
            'description': $("#newProjectDescription").val(),
            'idWorkspace': workspaceId,
            'workspacePosition': -1
        })
    });
    alertCreated('Projeto criado com sucesso!');
}

function insertCatalog(projectId) {
    stompClient.publish({
        destination: `/app/project/${projectId}/catalog.add`, body: JSON.stringify({
            'name': $("#newCatalogName").val(),
            'idWorkspace': projectId,
            'workspacePosition': -1
        })
    });
    alertCreated('Catálogo criado com sucesso!');
}

// function updateProject(oldWorkspaceId, oldWorkspacePosition) {
//     var id = document.getElementById(`projectId_${oldWorkspaceId}_${oldWorkspacePosition}`).value;
//     var name = document.getElementById(`projectName_${oldWorkspaceId}_${oldWorkspacePosition}`).value;
//     var description = document.getElementById(`projectDescription_${oldWorkspaceId}_${oldWorkspacePosition}`).value;
//     var workspaceId = document.getElementById(`projectWorkspaceId_${oldWorkspaceId}_${oldWorkspacePosition}`).value;
//     var workspacePosition = document.getElementById(`projectWorkspacePosition_${oldWorkspaceId}_${oldWorkspacePosition}`).value;
//
//     console.log(`Updating project ${id}`);
//
//     stompClient.publish({
//         destination: `/app/workspace/${oldWorkspaceId}/${workspaceId}/project.update/${id}`,
//         body: JSON.stringify({
//             'name': name,
//             'description': description,
//             'idWorkspace': workspaceId,
//             'workspacePosition': workspacePosition
//         })
//     });
// }

// function deleteProject(workspaceId, projectWorkspacePosition) {
//     var projectId = $(`#projectId_${workspaceId}_${projectWorkspacePosition}`).val();
//     console.log(`Deleting project ${projectId}`);
//     stompClient.publish({
//         destination: `/app/workspace/${workspaceId}/project.delete/${projectId}`
//     });
// }

$(function () {
    $('#createProject').click(() => insertProject());
    $('#createCatalog').click(() => insertCatalog());
});

// Obtem o valor do parâmetro 'id'
const workspaceId = sessionStorage.getItem("workspaceId");
stompClient.activate();
