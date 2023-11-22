const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:8082/ws'
});

stompClient.onWebSocketError = (error) => {
    console.error('Error with websocket', error);
    alert("Problema de conexão");
};

stompClient.onStompError = (frame) => {
    console.error(`Broker reported error: ${frame.headers['message']}`);
    console.error(`Additional details: ${frame.body}`);
    alert("Problema de conexão");
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
                            <div class="project_card removable editable" id="project_${position}" backendId="${project.id}">
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

function alert(message) {
    $(`#alert`).text(message);
    // Mostrar a mensagem de sucesso
    document.getElementById('alert').style.display = 'block';

    // Fechar o modal
    $('#createProjectModal').modal('hide');

    // Ocultar a mensagem de sucesso após 3 segundos (3000 milissegundos)
    setTimeout(function () {
        document.getElementById('alert').style.display = 'none';
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
    alert('Projeto criado com sucesso!');
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
    alert('Catálogo criado com sucesso!');
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
    alert('Cartão criado com sucesso!');
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

function updateProjects(projects) {
    const socketPub = `/app/workspace/${workspaceId}/project.update`
    stompClient.publish({
        destination: socketPub,
        body: JSON.stringify(projects)
    });
    console.log(`PUB: ${socketPub}`);
}

function updateCatalogs(catalogs) {
    const socketPub = `/app/workspace/${workspaceId}/project/catalog.update`
    stompClient.publish({
        destination: socketPub,
        body: JSON.stringify(catalogs)
    });
    console.log(`PUB: ${socketPub}`);
}

function updateCards(cards) {
    const socketPub = `/app/workspace/${workspaceId}/project/catalog/card.update`
    stompClient.publish({
        destination: socketPub,
        body: JSON.stringify(cards)
    });
    console.log(`PUB: ${socketPub}`);
}

function deleteProject(projectId) {
    const socketPub = `/app/workspace/${workspaceId}/project.delete/${projectId}`
    stompClient.publish({
        destination: socketPub
    });
    console.log(`PUB: ${socketPub}`);
    alert('Projeto excluido com sucesso!');
}

function deleteCatalog(catalogId) {
    const socketPub = `/app/workspace/${workspaceId}/project/catalog.delete/${catalogId}`
    stompClient.publish({
        destination: socketPub
    });
    console.log(`PUB: ${socketPub}`);
    alert('Catálogo excluido com sucesso!');
}

function deleteCard(cardId) {
    const socketPub = `/app/workspace/${workspaceId}/project/catalog/card.delete/${cardId}`
    stompClient.publish({
        destination: socketPub
    });
    console.log(`PUB: ${socketPub}`);
    alert('Cartão excluido com sucesso!');
}

function initCatalog() {
    const dropzones = document.querySelectorAll('.list-container');
    dropzones.forEach(item => {
        new Sortable(item, {
            group: 'list',
            sort: true,
            filter: '.add-list',
            draggable: '.list',
            ghostClass: "ghost",

            // catálogo movido
            onEnd: function (event) {

                const oldProjectPosition = event.from.parentElement.id.substring(8);
                const newProjectPosition = event.to.parentElement.id.substring(8);

                let position;
                let catalogs = [];

                // movido entre projetos diferentes
                if (oldProjectPosition !== newProjectPosition) {

                    position = 1;
                    // atualiza todas as posições de catalogos do antigo projeto (catalog_<position>)
                    $(`#project_${oldProjectPosition} #list_catalog div[id^=catalog]`)
                        .each(function () {
                            $(this).attr('id', `catalog_${position}`);
                            let catalog = {
                                'id': $(this).attr('backendId'),
                                'name': $(this).text(),
                                'description': '',
                                'idProject': $(`#project_${oldProjectPosition}`).attr('backendId'),
                                'projectPosition': position
                            }
                            catalogs.push(catalog);
                            position++;
                        });

                }

                // atualiza todas as posições de catalogos do novo projeto (card_<position>)
                position = 1;
                $(`#project_${newProjectPosition} #list_catalog div[class^=list]`)
                    .each(function () {
                        $(this).attr('id', `catalog_${position}`);
                        let catalog = {
                            'id': $(this).attr('backendId'),
                            'name': $(this).children('#catalog_name').text(),
                            'description': '',
                            'idProject': $(`#project_${newProjectPosition}`).attr('backendId'),
                            'projectPosition': position
                        }
                        catalogs.push(catalog);
                        position++;
                    });

                updateCatalogs(catalogs);
            }
        });
    });
}

// DRAG AND DROP FEATURES
function initCard() {
    const dropzones = document.querySelectorAll('.content');
    dropzones.forEach(item => {
        new Sortable(item, {
            group: 'card',
            sort: true,
            draggable: '.card',
            ghostClass: "ghost",

            // cartão movido
            onEnd: function (event) {

                const oldCatalogPosition = event.from.parentElement.id.substring(8);
                const newCatalogPosition = event.to.parentElement.id.substring(8);

                const oldProjectPosition = event.from.parentElement.parentElement.parentElement.id.substring(8);
                const newProjectPosition = event.to.parentElement.parentElement.parentElement.id.substring(8);

                let position;
                let cards = [];

                // movido entre catálogos diferentes
                if (oldProjectPosition !== newProjectPosition || oldCatalogPosition !== newCatalogPosition) {

                    position = 1;
                    // atualiza todas as posições de cartões do antigo catálogo (card_<position>)
                    $(`#project_${oldProjectPosition} #list_catalog #catalog_${oldCatalogPosition} #list_card div[id^=card]`)
                        .each(function () {
                            $(this).attr('id', `card_${position}`);
                            let card = {
                                'id': $(this).attr('backendId'),
                                'name': $(this).text(),
                                'description': '',
                                'idCatalog': $(`#project_${oldProjectPosition} #list_catalog #catalog_${oldCatalogPosition}`).attr('backendId'),
                                'catalogPosition': position
                            }
                            cards.push(card);
                            position++;
                        });

                }

                // atualiza todas as posições de cartões do novo catálogo (card_<position>)
                position = 1;
                $(`#project_${newProjectPosition} #list_catalog #catalog_${newCatalogPosition} #list_card div[id^=card]`)
                    .each(function () {
                        $(this).attr('id', `card_${position}`);
                        let card = {
                            'id': $(this).attr('backendId'),
                            'name': $(this).text(),
                            'description': '',
                            'idCatalog': $(`#project_${newProjectPosition} #list_catalog #catalog_${newCatalogPosition}`).attr('backendId'),
                            'catalogPosition': position
                        }
                        cards.push(card);
                        position++;
                    });

                updateCards(cards);
            }
        });
    });
}

function inputBlurHandler() {
    this.classList.add('inactive');
    this.disabled = true;
    this.classList.remove('active');
    list.option('disabled', false);
}

function bodyClickHandler(e) {
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

    if (e.keyCode === 13) { // 13 = Enter key
        e.preventDefault();
        e.target.blur();

        // atualiza nome do cartão
        if (e.target.id ^= 'card_') {
            let cards = [{
                'id': e.target.getAttribute('backendId'),
                'name': e.target.innerHTML,
                'description': '',
                'idCatalog': e.target.parentElement.parentElement.getAttribute('backendId'),
                'catalogPosition': e.target.id.substring(5)
            }];
            updateCards(cards);
        }

        // atualiza nome do catálogo
        if (e.target.id === 'catalog_name') {
            let catalogs = [{
                'id': e.target.parentElement.getAttribute('backendId'),
                'name': e.target.innerHTML,
                'description': '',
                'idProject': e.target.parentElement.parentElement.parentElement.getAttribute('backendId'),
                'projectPosition': e.target.parentElement.id.substring(8)
            }];
            updateCatalogs(catalogs);
        }
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
    const el = e.target;
    el.contentEditable = false;
    el.classList.remove('editing');

    if (el.classList.contains('pending')) {
        el.className = 'card removable editable';

        // insere id (card_<last_position>)
        el.id = `card_${el.parentNode.querySelector('.content').children.length + 1}`;

        // recupera catalogId que o card está inserido
        const catalogId = el.parentNode.getAttribute('backendId');

        // recupera texto do card
        const cardName = el.innerText;

        const newEl = document.createElement('div');
        newEl.className = 'add-card editable';
        newEl.id = 'insert_card';
        newEl.appendChild(document.createTextNode('+ Adicionar novo card'));
        el.parentNode.appendChild(newEl);
        el.parentNode.querySelector('.content').appendChild(el);

        // envia informação para o banco de dados
        insertCard(catalogId, cardName, '');
    }

    if (el.parentElement.className === 'list initial') {
        el.parentElement.className = 'add-list';
    }

    if (el.parentElement.className === 'list pending') {
        el.parentElement.className = 'list';

        //insere id (catalog_<last_position>)
        el.parentElement.id = `catalog_${el.parentNode.parentNode.children.length}`

        // recupera projectId que o card está inserido
        const projectId = el.parentElement.parentNode.parentNode.getAttribute('backendId');

        // recupera texto do card
        const catalogName = el.innerText;

        el.className = 'title removable editable';

        const newContent = document.createElement('div');
        newContent.className = 'content';
        newContent.id = 'list_card';

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

        // envia informação para o banco de dados
        insertCatalog(projectId, catalogName);
    }

    initDelete();
}

function initDelete() {
    const editables = document.querySelectorAll('.editable');
    editables.forEach(item => {
        item.addEventListener('mouseenter', elMouseEnterHandler);
        item.addEventListener('mouseleave', elMouseLeaveHandler);
    });
}

function elMouseEnterHandler(e) {
    const el = e.target;
    const isRemovable = el.classList.contains('removable');

    if (isRemovable) {

        // cria botão de apagar objeto quando o mouse é colocado em cima
        const del = document.createElement('span');
        del.className = 'del';
        del.innerHTML = '&times;';
        el.appendChild(del);

        // fica aguardando o botão ser clicado
        el.addEventListener('click', deleteHandler);
    }
}

function elMouseLeaveHandler(e) {
    const del = e.target.querySelector('span');
    if (del) e.target.removeChild(del);
}

function deleteHandler(e) {
    const parent = e.target.parentElement;

    // apaga cartão
    if (parent.classList.contains('card')) {

        const catalogPosition = parent.parentElement.parentElement.id.substring(8);
        const projectPosition = parent.parentElement.parentElement.parentElement.parentElement.id.substring(8);

        const cardsCount = parent.parentElement.children.length;

        let nextPosition = parseInt(parent.id.substring(5)) + 1;

        parent.parentElement.removeChild(parent);

        // atualiza lista de cartões que sobraram
        while (nextPosition <= cardsCount) {
            $(`#project_${projectPosition} #list_catalog #catalog_${catalogPosition} #list_card #card_${nextPosition}`).attr('id', `card_${nextPosition - 1}`);
            nextPosition++;
        }

        deleteCard(parent.getAttribute('backendId'));
    }

    // apaga catálogo
    if (parent.classList.contains('title')) {

        const projectPosition = parent.parentElement.parentElement.parentElement.id.substring(8);

        const catalogCount = parent.parentElement.parentElement.children.length - 1;

        let nextPosition = parseInt(parent.parentElement.id.substring(8)) + 1;

        parent.parentElement.parentElement.removeChild(parent.parentElement);

        // atualiza lista de catálogos que sobraram
        while (nextPosition <= catalogCount) {
            $(`#project_${projectPosition} #list_catalog #catalog_${nextPosition}`).attr('id', `catalog_${nextPosition - 1}`);
            nextPosition++;
        }

        deleteCatalog(parent.parentElement.getAttribute('backendId'));
    }

    // apaga projeto
    if (parent.classList.contains('project_card')) {

        const projectPosition = parent.id.substring(8);

        const count = parent.parentElement.children.length;

        let nextPosition = parseInt(parent.id.substring(8)) + 1;

        parent.parentElement.removeChild(parent);

        // atualiza lista de projetos que sobraram
        while (nextPosition <= count) {
            console.log( $(`#project_${nextPosition}`).html())
            $(`#project_${nextPosition}`).attr('id', `project_${nextPosition - 1}`);
            nextPosition++;
        }

        deleteProject(parent.getAttribute('backendId'));
    }
}

function workspaceUI() {
    const main = document.querySelector('#main');

    // const list = new Sortable(main, {
    //     group: 'list',
    //     sort: true,
    //     filter: '.add-card',
    //     draggable: '.list',
    //     ghostClass: "ghost",
    //     dragoverBubble: true,
    // });

    initCard();
    initCatalog();

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

