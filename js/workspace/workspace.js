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
        workspaceUI();
    });
    console.log(`SUBSCRIBED: ${socketSub}`);

    var requestOptions = {
        method: 'GET', redirect: 'follow'
    };

    fetch(`http://localhost:8082/workspaces/${workspaceId}`, requestOptions)
        .then(response => response.json())
        .then(json => {
            showProjects(json);
            workspaceUI();
        })
        .catch(error => console.log('error', error));
};

function showProjects(workspace) {

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
                $(`#project_${position}`).attr("backendId", project.id);

                showCatalogs(project, position);

            } else { // cria novo projeto no final
                const divProject = `
                            <div class="project_card" id="project_${position}" backendId="${project.id}">
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

                showCatalogs(project, position);
            }
        });

        // remove projetos que sobraram
        var idRemove = $(`#projects`).children().length;
        while (idRemove > projectsCount) {
            console.log("REMOVE: " + $(`#project_${idRemove}`).text());
            $(`#project_${idRemove}`).remove();
            idRemove--;
        }
    }
}

function showCatalogs(project, projectPosition) {

    var catalogsCount = project.catalogs.length;

    project.catalogs.sort(function (a, b) {
        return a.projectPosition - b.projectPosition;
    });

    project.catalogs.forEach(catalog => {

        const position = catalog.projectPosition;

        // reescreve os dados do catálogo para aquela posição
        if ($(`#project_${projectPosition} #list_catalog #catalog_${position}`).length > 0) {
            $(`#project_${projectPosition} #list_catalog #catalog_${position} #catalog_name`).text(catalog.name);
            $(`#project_${projectPosition} #list_catalog #catalog_${position}`).attr("backendId", catalog.id);

            showCards(catalog, projectPosition, position);

        } else { // cria novo catálogo no final

            $(`#project_${projectPosition} #list_catalog #insert_catalog`).remove();
            const divCatalog = `
                    <div class="list" id="catalog_${position}" backendId="${catalog.id}">
                        <div class="title removable editable" id="catalog_name">${catalog.name}</div>
                        <div class="content" id="list_card"></div>
                        <div class="add-card editable" id="insert_card">+ Adicionar novo card</div>
                    </div>
                    <div class="add-list" id="insert_catalog">
                        <div class="title editable">+ Adicionar novo catálogo</div>
                    </div>`;
            $(`#project_${projectPosition} #list_catalog`).append(divCatalog);

            showCards(catalog, projectPosition, position);
        }
    });

    // remove catalogos que sobraram
    var idRemove = $(`#project_${projectPosition} #list_catalog`).children().length - 1;
    while (idRemove > catalogsCount) {
        $(`#project_${projectPosition} #list_catalog catalog_${idRemove}`).remove();
        idRemove--;
    }
}

function showCards(catalog, projectPosition, catalogPosition) {

    var cardsCount = catalog.cards.length;

    catalog.cards.sort(function (a, b) {
        return a.catalogPosition - b.catalogPosition;
    });

    catalog.cards.forEach(card => {

        const position = card.catalogPosition;

        // reescreve os dados do cartão para aquela posição
        if ($(`#project_${projectPosition} #list_catalog #catalog_${catalogPosition} #list_card #card_${position}`).length > 0) {
            $(`#project_${projectPosition} #list_catalog #catalog_${catalogPosition} #list_card #card_${position}`).text(card.name);
            $(`#project_${projectPosition} #list_catalog #catalog_${catalogPosition} #list_card #card_${position}`).attr("backendId", card.id);

            // cria novo cartão no final
        } else {
            const divCard = `<div class="card removable editable" id="card_${position}" backendId="${card.id}">${card.name}</div>`;
            $(`#project_${projectPosition} #list_catalog #catalog_${catalogPosition} #list_card`).append(divCard);

        }
    });

    // remove cartões que sobraram
    var idRemove = $(`#project_${projectPosition} #list_catalog #catalog_${catalogPosition} #list_card`).children().length;
    while (idRemove > cardsCount) {
        $(`#project_${projectPosition} #list_catalog #catalog_${catalogPosition} #list_card #card_${idRemove}`).remove();
        idRemove--;
    }
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
    const socketPub = `/app/workspace/${workspaceId}/project.add`;
    stompClient.publish({
        destination: socketPub, body: JSON.stringify({
            'name': $("#newProjectName").val(),
            'description': $("#newProjectDescription").val(),
            'idWorkspace': workspaceId,
            'workspacePosition': -1
        })
    });
    console.log(`PUB: ${socketPub}`);
    alertCreated('Projeto criado com sucesso!');
}

function insertCatalog(projectId, catalogName) {
    const socketPub = `/app/workspace/${workspaceId}/project/catalog.add`;
        stompClient.publish({
        destination: socketPub, body: JSON.stringify({
            'name': catalogName,
            'idProject': projectId,
            'projectPosition': -1
        })
    });
    console.log(`PUB: ${socketPub}`);
    alertCreated('Catálogo criado com sucesso!');
}

function insertCard(catalogId, cardName, cardDescription) {
    const socketPub = `/app/workspace/${workspaceId}/project/catalog/card.add`;
    stompClient.publish({
        destination: socketPub, body: JSON.stringify({
            'name': cardName,
            'description': cardDescription,
            'idCatalog': catalogId,
            'catalogPosition': -1
        })
    });
    console.log(`PUB: ${socketPub}`);
    alertCreated('Cartão criado com sucesso!');
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

// DRAG AND DROP FEATURES
function initCard() {
    console.log("initCard")
    const dropzones = document.querySelectorAll('.content');
    dropzones.forEach(item => {
        new Sortable(item, {
            group: 'card',
            sort: true,
            draggable: '.card',
            ghostClass: "ghost",
        });
    });
}

// for test only
function initCatalog() {
    console.log("initCatalog")
    const dropzones = document.querySelectorAll('.list-container');
    dropzones.forEach(item => {
        new Sortable(item, {
            group: 'list',
            sort: true,
            draggable: '.list',
            ghostClass: "ghost",
        });
    });
}

function inputBlurHandler() {
    console.log("inputBlurHandler")
    this.classList.add('inactive');
    this.disabled = true;
    this.classList.remove('active');
    list.option('disabled', false);
}

function bodyClickHandler(e) {
    console.log("bodyClickHandler")
    elMouseLeaveHandler(e);
    const el = e.target;
    const isCard = el.classList.contains('card');
    const isTitle = el.classList.contains('title');
    const isInactive = el.classList.contains('inactive');
    const isEditable = el.classList.contains('editable');
    const editing = el.classList.contains('editing');

    if ((isCard || isTitle) && isInactive) {
        list.option('disabled', true);
        el.disabled = false;
        el.classList.remove('inactive');
        el.classList.add('active');
        el.select();
    }

    if (isEditable && !editing) {
        el.contentEditable = true;
        el.focus();
        document.execCommand('selectAll', false, null);
        el.addEventListener('blur', elBlurHandler);
        el.addEventListener('keypress', elKeypressHandler);
        el.classList.add('editing');

        if (el.parentElement.className === 'add-list') {
            el.parentElement.className = 'list initial';
        }
    }
}

function elKeypressHandler(e) {
    console.log("elKeypressHandler")
    if (e.keyCode === 13) { // 13 = Enter key
        e.preventDefault();
        e.target.blur();
    }

    const el = e.target;
    if (el.classList.contains('add-card')) {
        el.classList.add('pending');
    }

    if (el.parentElement.className === 'list initial') {
        el.parentElement.className = 'list pending';
    }
}

function elBlurHandler(e) {
    console.log("elBlurHandler")
    const el = e.target;
    el.contentEditable = false;
    el.classList.remove('editing');

    if (el.classList.contains('pending')) {
        el.className = 'card removable editable';

        // insere id (card_<last_position>)
        el.id = `card_${el.parentNode.querySelector('.content').children.length+1}`;

        // recupera catalogId que o card está inserido
        const catalogId = el.parentNode.parentNode.querySelector('.list').getAttribute('backendId');

        // recupera texto do card
        const cardName = el.innerText;

        // envia informação para o banco de dados
        insertCard(catalogId, cardName, '');

        const newEl = document.createElement('div');
        newEl.className = 'add-card editable';
        newEl.id = 'insert_card';
        newEl.appendChild(document.createTextNode('+ Adicionar novo card'));
        el.parentNode.appendChild(newEl);
        el.parentNode.querySelector('.content').appendChild(el);
    }

    if (el.parentElement.className === 'list initial') {
        el.parentElement.className = 'add-list';
    }

    if (el.parentElement.className === 'list pending') {
        el.parentElement.className = 'list';

        //insere id (catalog_<last_position>)
        el.parentElement.id = `catalog_${el.parentNode.parentNode.children.length}`

        el.className = 'title removable editable';

        // recupera projectId que o card está inserido
        const projectId = el.parentElement.parentNode.parentNode.getAttribute('backendId');

        // recupera texto do card
        const catalogName = el.innerText;

        // envia informação para o banco de dados
        insertCatalog(projectId, catalogName);

        const newContent = document.createElement('div');
        newContent.className = 'content';

        el.parentElement.appendChild(newContent);

        const newEl = document.createElement('div');
        newEl.className = 'add-card editable';
        newEl.id = 'insert_card';
        newEl.appendChild(document.createTextNode('+ Adicionar novo card'));
        el.parentNode.appendChild(newEl);

        initCard();

        const addList = document.createElement('div');
        addList.className = 'add-list';
        addList.id = 'insert_catalog'
        const title = document.createElement('div');
        title.className = 'title editable';
        title.appendChild(document.createTextNode('+ Adicionar novo catálogo'));
        addList.appendChild(title);
        el.parentElement.parentElement.appendChild(addList);
    }

    initDelete();
}

function initDelete() {
    console.log("initDelete")
    const editables = document.querySelectorAll('.editable');
    editables.forEach(item => {
        item.addEventListener('mouseenter', elMouseEnterHandler);
        item.addEventListener('mouseleave', elMouseLeaveHandler);
    });
}

function elMouseEnterHandler(e) {
    console.log("elMouseEnterHandler")
    const el = e.target;
    const isRemovable = el.classList.contains('removable');

    if (isRemovable) {
        const del = document.createElement('span');
        del.className = 'del';
        del.innerHTML = '&times;';
        el.appendChild(del);

        el.addEventListener('click', deleteHandler);
    }
}

function elMouseLeaveHandler(e) {
    console.log("elMouseLeaveHandler")
    const del = e.target.querySelector('span');
    if (del) e.target.removeChild(del);
}

function deleteHandler(e) {
    console.log("deleteHandler")
    const parent = e.target.parentElement;

    if (parent.classList.contains('card')) {
        parent.parentElement.removeChild(parent);
    }

    if (parent.classList.contains('title')) {
        parent.parentElement.parentElement.removeChild(parent.parentElement);
    }
}

function workspaceUI() {
    const main = document.querySelector('#main');

    const list = new Sortable(main, {
        group: 'list',
        sort: true,
        filter: '.add-card',
        draggable: '.list',
        ghostClass: "ghost",
        dragoverBubble: true,
    });

    initCard();

    document.addEventListener('DOMContentLoaded', function () {
        initCatalog();
    });

    const inputs = document.querySelectorAll('textarea');

    inputs.forEach(item => {
        item.addEventListener('blur', inputBlurHandler);
    });

    const body = document.querySelector('body');

    body.addEventListener('click', bodyClickHandler);

    initDelete();
    document.getElementById('navbarToggler').addEventListener('click', function () {
        var navbarNav = document.getElementById('navbarNav');
        navbarNav.style.display = (navbarNav.style.display === 'flex' || navbarNav.style.display === '') ? 'none' : 'flex';
    });
}

$(function () {
    $('#createProject').click(() => insertProject());
});

// Obtem o valor do parâmetro 'id'
const workspaceId = sessionStorage.getItem("workspaceId");
stompClient.activate();

