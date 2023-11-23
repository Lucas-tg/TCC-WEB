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

    var requestOptions = {
        method: 'GET', redirect: 'follow'
    };

    fetch(`http://localhost:8082/workspaces/${workspaceId}`, requestOptions)
        .then(response => response.json())
        .then(json => {
            showWorkspace(json);
            workspaceUI();
        })
        .catch(error => console.log('error', error));

    const socketSub = `/topic/workspace/${workspaceId}/project.list`;

    stompClient.subscribe(socketSub, (workspace) => {
        console.log(`RESPONSE FROM: ${socketSub}`);
        showWorkspace(JSON.parse(workspace.body));
        workspaceUI();
    });
    console.log(`SUBSCRIBED: ${socketSub}`);
};

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

function insertProject() {
    const dest = `/app/workspace/${workspaceId}/project.add`;
    const body = {
        'name': $("#newProjectName").val(),
        'description': $("#newProjectDescription").val(),
        'idWorkspace': workspaceId,
        'workspacePosition': -1
    };
    socketPub(dest, body);
    alert('Projeto criado com sucesso!');
}

function insertCatalog(projectId, catalogName) {
    const dest = `/app/workspace/${workspaceId}/project/catalog.add`;
    const body = {
        'name': catalogName,
        'idProject': projectId,
        'projectPosition': -1
    };
    socketPub(dest, body);
    alert('Catálogo criado com sucesso!');
}

function insertCard(catalogId, cardName, cardDescription) {
    const dest = `/app/workspace/${workspaceId}/project/catalog/card.add`;
    const body = {
        'name': cardName,
        'description': cardDescription,
        'idCatalog': catalogId,
        'catalogPosition': -1
    };
    socketPub(dest, body);
    alert('Cartão criado com sucesso!');
}

function updateProject(project) {
    const dest = `/app/workspace/${workspaceId}/project.update`
    socketPub(dest, project);
}

function updateCatalog(catalog) {
    const dest = `/app/workspace/${workspaceId}/project/catalog.update`;
    socketPub(dest, catalog);
}

function updateCard(card) {
    const dest = `/app/workspace/${workspaceId}/project/catalog/card.update`
    socketPub(dest, card);
}

function deleteProject(projectId) {
    const dest = `/app/workspace/${workspaceId}/project.delete/${projectId}`
    socketPub(dest, null);
    alert('Projeto excluido com sucesso!');
}

function deleteCatalog(catalogId) {
    const dest = `/app/workspace/${workspaceId}/project/catalog.delete/${catalogId}`
    socketPub(dest, null);
    alert('Catálogo excluido com sucesso!');
}

function deleteCard(cardId) {
    const dest = `/app/workspace/${workspaceId}/project/catalog/card.delete/${cardId}`
    socketPub(dest, null);
    alert('Cartão excluido com sucesso!');
}

function showWorkspace(workspace) {
    showProjects(workspace.projects);
}

function showProjects(projects) {

    // atualiza todas as posições de projeto (project_<position>)
    let position = 1;
    $(`#projects div[id^=project]`)
        .each(function () {
            $(this).attr('id', `project_${position}`);
            position++;
        });

    const projectsCount = projects.length;

    // clear projects
    if (projectsCount === 0) {
        $(`#projects`).remove();

    } else {
        projects.sort(function (a, b) {
            return a.workspacePosition - b.workspacePosition;
        });

        // tela não possui nada
        if ($(`#projects`).length <= 0) {
            $("#main").append(`<div class="container" id="projects"></div>`);
        }
        projects.forEach(project => {

            // reescreve os dados do projeto para aquela posição
            if ($(`#project_${project.workspacePosition}`).length > 0) {
                $(`#project_${project.workspacePosition} #header #project_name`).text(project.name);
                $(`#project_${project.workspacePosition}`).attr("backendId", project.id);

                showCatalogs(project.catalogs, project.workspacePosition);

            } else { // cria novo projeto no final
                const divProject = `
                            <div class="project_card" id="project_${project.workspacePosition}" backendId="${project.id}">
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

                showCatalogs(project.catalogs, project.workspacePosition);
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

function showCatalogs(catalogs, workspacePosition) {

    // atualiza todas as posições de catálogo do projeto (catalog_<position>)
    let position = 1;
    $(`#project_${workspacePosition} #list_catalog div[id^=catalog]`)
        .each(function () {
            $(this).attr('id', `catalog_${position}`);
            position++;
        });

    var catalogsCount = catalogs.length;

    catalogs.sort(function (a, b) {
        return a.projectPosition - b.projectPosition;
    });

    catalogs.forEach(catalog => {

        const projectPosition = catalog.projectPosition;

        // reescreve os dados do catálogo para aquela posição
        if ($(`#project_${workspacePosition} #list_catalog #catalog_${projectPosition}`).length > 0) {
            $(`#project_${workspacePosition} #list_catalog #catalog_${projectPosition} #name_catalog`).text(catalog.name);
            $(`#project_${workspacePosition} #list_catalog #catalog_${projectPosition}`).attr("backendId", catalog.id);

            showCards(catalog.cards, workspacePosition, projectPosition);

        } else { // cria novo catálogo no final

            $(`#project_${workspacePosition} #list_catalog #insert_catalog`).remove();
            const divCatalog = `
                    <div class="list" id="catalog_${projectPosition}" backendId="${catalog.id}">
                        <div class="title removable editable" id="name_catalog">${catalog.name}</div>
                        <div class="content" id="list_card"></div>
                        <div class="add-card editable" id="insert_card">+ Adicionar novo card</div>
                    </div>
                    <div class="add-list" id="insert_catalog">
                        <div class="title editable">+ Adicionar novo catálogo</div>
                    </div>`;
            $(`#project_${workspacePosition} #list_catalog`).append(divCatalog);

            showCards(catalog.cards, workspacePosition, projectPosition);
        }
    });

    // remove catalogos que sobraram
    for (let id = catalogsCount; id < $(`#project_${workspacePosition} #list_catalog div[id^=catalog]`).length; id++) {
        $(`#project_${workspacePosition} #list_catalog div[id^=catalog]`)[id].remove();
    }
}

function showCards(cards, workspacePosition, projectPosition) {

    // atualiza todas as posições de cartões do catálogo (card_<position>)
    let position = 1;
    $(`#project_${workspacePosition} #list_catalog #catalog_${projectPosition} #list_card div[id^=card]`)
        .each(function () {
            $(this).attr('id', `card_${position}`);
            position++;
        });

    var cardsCount = cards.length;

    cards.sort(function (a, b) {
        return a.catalogPosition - b.catalogPosition;
    });

    cards.forEach(card => {

        const catalogPosition = card.catalogPosition;

        // reescreve os dados do cartão para aquela posição
        if ($(`#project_${workspacePosition} #list_catalog #catalog_${projectPosition} #list_card #card_${catalogPosition}`).length > 0) {
            $(`#project_${workspacePosition} #list_catalog #catalog_${projectPosition} #list_card #card_${catalogPosition}`).text(card.name);
            $(`#project_${workspacePosition} #list_catalog #catalog_${projectPosition} #list_card #card_${catalogPosition}`).attr("backendId", card.id);

            // cria novo cartão no final
        } else {
            const divCard = `<div class="card removable editable" id="card_${catalogPosition}" backendId="${card.id}">${card.name}</div>`;
            $(`#project_${workspacePosition} #list_catalog #catalog_${projectPosition} #list_card`).append(divCard);

        }
    });

    // remove cartões que sobraram
    for (let id = cardsCount; id < $(`#project_${workspacePosition} #list_catalog #catalog_${projectPosition} #list_card div[id^=card]`).length; id++) {
        $(`#project_${workspacePosition} #list_catalog #catalog_${projectPosition} #list_card div[id^=card]`)[id].remove();
    }
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

                // recupera posição do novo projeto
                const newProjectPosition = event.to.parentElement.id.substring(8);

                // recupera posição dentro do novo projeto
                const listDiv = event.to.children;
                let newPosition = 1;
                let id = 0;
                while (listDiv.length > newPosition && listDiv[id].getAttribute('backendId') !== event.item.getAttribute('backendId')) {
                    if (listDiv[id].id !== 'insert_catalog') {
                        newPosition++;
                    }
                    id++;
                }

                console.log(event.item);

                let catalog = {
                    'id': event.item.getAttribute('backendId'),
                    'name': event.item.querySelector('#name_catalog').innerHTML,
                    'description': '',
                    'idProject': $(`#project_${newProjectPosition}`).attr('backendId'),
                    'projectPosition': newPosition
                }

                updateCatalog(catalog);
            }
        });
    });
}

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

                // recupera posição do novo projeto
                const newProjectPosition = event.to.parentElement.parentElement.parentElement.id.substring(8);

                // recupera posição do novo catálogo dentro do projeto
                const newCatalogPosition = event.to.parentElement.id.substring(8);

                // recupera posição dentro do novo catálogo
                const listDiv = event.to.children;
                let newPosition = 1;
                while (listDiv[newPosition - 1].getAttribute('backendId') !== event.item.getAttribute('backendId')) {
                    newPosition++;
                }

                event.item.setAttribute('id', `card_${newPosition}`);
                let card = {
                    'id': event.item.getAttribute('backendId'),
                    'name': event.item.innerHTML,
                    'description': '',
                    'idCatalog': $(`#project_${newProjectPosition} #list_catalog #catalog_${newCatalogPosition}`).attr('backendId'),
                    'catalogPosition': newPosition
                }

                updateCard(card);
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

        let backendId = e.target.getAttribute('backendId');
        // atualiza nome do cartão
        if (e.target.classList.contains('card') && backendId != null) {
            let card = {
                'id': backendId,
                'name': e.target.innerHTML,
                'description': '',
                'idCatalog': e.target.parentElement.parentElement.getAttribute('backendId'),
                'catalogPosition': e.target.id.substring(5)
            };
            updateCard(card);
        }

        // atualiza nome do catálogo
        backendId = e.target.parentElement.getAttribute('backendId');
        if (e.target.id === 'name_catalog' && backendId != null) {
            let catalog = {
                'id': backendId,
                'name': e.target.innerHTML,
                'description': '',
                'idProject': e.target.parentElement.parentElement.parentElement.getAttribute('backendId'),
                'projectPosition': e.target.parentElement.id.substring(8)
            };
            updateCatalog(catalog);
        }

        // atualiza nome do projeto
        // if (e.target.id === 'project_name') {
        //     let catalogs = {
        //         'id': e.target.parentElement.getAttribute('backendId'),
        //         'name': e.target.innerHTML,
        //         'description': '',
        //         'idProject': e.target.parentElement.parentElement.parentElement.getAttribute('backendId'),
        //         'projectPosition': e.target.parentElement.id.substring(8)
        //     };
        //     updateCatalog(catalog);
        // }
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

    // insere cartão
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

    // insere catálogo
    if (el.parentElement.className === 'list pending') {
        el.parentElement.className = 'list';

        //insere id (catalog_<last_position>)
        el.parentElement.id = `catalog_${el.parentNode.parentNode.children.length}`

        // recupera projectId que o card está inserido
        const projectId = el.parentElement.parentNode.parentNode.getAttribute('backendId');

        // recupera texto do card
        const catalogName = el.innerText;

        el.className = 'title removable editable';
        el.id = 'name_catalog';

        const newContent = document.createElement('div');
        newContent.className = 'content';
        newContent.id = 'list_card';

        el.parentElement.appendChild(newContent);

        const newEl = document.createElement('div');
        newEl.className = 'add-card editable';
        newEl.id = 'insert_card';
        newEl.appendChild(document.createTextNode('+ Adicionar novo card'));
        el.parentNode.appendChild(newEl);

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
        deleteCard(parent.getAttribute('backendId'));
    }

    // apaga catálogo
    if (parent.classList.contains('title')) {
        deleteCatalog(parent.parentElement.getAttribute('backendId'));
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

