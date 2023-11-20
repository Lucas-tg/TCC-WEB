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
            showProjects(json);
        })
        .catch(error => console.log('error', error));
};

function showProjects(workspaces) {
    if (!Array.isArray(workspaces)) {
        // transform to array
        workspaces = [workspaces];
    }

    workspaces.forEach(workspace => {
        if (parseInt(workspaceId) === workspace.id) {
            projectsCount = workspace.projects.length;
            // clear projects
            if (projectsCount === 0) {
                $(`#projects`).remove();
            } else {
                workspace.projects.sort(function (a, b) {
                    return a.workspacePosition - b.workspacePosition;
                });
                // tela não possui nada
                if ($(`#projects`).length <= 0) {
                    console.log("TELA LIMPA")
                    $("#main").append(`<div class="container" id="projects"></div>`);

                    workspace.projects.forEach(project => {
                        console.log("NOVO")
                        const position = project.workspacePosition;
                        const divProject = `
                        <div class="project_card" id="project_${position}">
                            <div class="project_card_header" id="header">
                                <h1 id="name">${project.name}</h1>
                            </div>
                            <div class="list-container">
                                <div class="add-list">
                                    <div class="title editable">+ Adicionar novo catálogo</div>
                                </div>
                        </div>`;
                        // ${project.id}
                        $(`#projects`).append(divProject);
                    });


                    // tela possui projetos sendo exibidos
                } else {
                    console.log("TELA NÃO LIMPA")
                    workspace.projects.forEach(project => {
                        const position = project.workspacePosition;

                        // reescreve os dados do projeto para aquela posição
                        if ($(`#project_${position}`).length > 0) {
                            console.log("REESCREVE")
                            $(`#project_${position} #header #name`).text(project.name);

                            // cria novo projeto no final
                        } else {
                            console.log("NOVO")
                            const position = project.workspacePosition;
                            const divProject = `
                            <div class="project_card" id="project_${position}">
                                <div class="project_card_header">
                                    <h1 id="name">${project.name}</h1>
                                </div>
                                <div class="list-container">
                                    <div class="add-list">
                                        <div class="title editable">+ Adicionar novo catálogo</div>
                                    </div>
                            </div>`;
                            // ${project.id}
                            $(`#projects`).append(divProject);

                        }
                    });

                    // remove projetos que sobraram
                    console.log($(`#projects`).children().length);
                    while ((idRemove = $(`#projects`).children().length) > projectsCount) {
                        console.log("REMOVE " + idRemove)
                        $(`#project_${idRemove}`).remove();
                        idRemove--;
                    }
                }
            }
        }
    });
}

function alertProjectCreated() {
    // Mostrar a mensagem de sucesso
    document.getElementById('mensagemSucesso').style.display = 'block';

    // Fechar o modal
    $('#createProjectModal').modal('hide');

    // Ocultar a mensagem de sucesso após 3 segundos (3000 milissegundos)
    setTimeout(function () {
        document.getElementById('mensagemSucesso').style.display = 'none';
    }, 3000); // 3 segundos (3000 ms)
}

function insertProject() {
    console.log(workspaceId);
    stompClient.publish({
        destination: `/app/workspace/${workspaceId}/project.add`,
        body: JSON.stringify({
            'name': $("#newProjectName").val(),
            'description': $("#newProjectDescription").val(),
            'idWorkspace': workspaceId,
            'workspacePosition': projectsCount + 1
        })
    });
    alertProjectCreated();
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
});

// Obtem o valor do parâmetro 'id'
const workspaceId = sessionStorage.getItem("workspaceId");
var projectsCount = 1;
stompClient.activate();
