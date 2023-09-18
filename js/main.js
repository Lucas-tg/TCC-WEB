const stompClient = new StompJs.Client({
  brokerURL: 'ws://localhost:8082/ws'
});

stompClient.onConnect = (frame) => {
  setConnected(true);
  console.log('Connected: ' + frame);


  listWorkspace();



};

function listProject(){
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  fetch("http://localhost:8082/workspaces/1/projects", requestOptions)
    .then(response => response.json())
    .then(json => userProject(json)) // implementar essa funcao
    //.then(json => console.log(json))
    .catch(error => console.log('error', error));

 // stompClient.subscribe('/topic/user/' + userId + '/workspace.list', (user) => {
 //   showGreeting(JSON.parse(user.body));
 // });

  //console.log('SUBSCRIBED: /topic/user/' + userId + '/workspace.list');

}

function listWorkspace() {
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  fetch("http://localhost:8082/users/1/workspaces", requestOptions)
    .then(response => response.json())
    .then(json => userWorkspace(json))
    //.then(json => console.log(json))
    .catch(error => console.log('error', error));

  stompClient.subscribe('/topic/user/' + userId + '/workspace.list', (user) => {
    showGreeting(JSON.parse(user.body));
  });

  console.log('SUBSCRIBED: /topic/user/' + userId + '/workspace.list');
}

stompClient.onWebSocketError = (error) => {
  console.error('Error with websocket', error);
};

stompClient.onStompError = (frame) => {
  console.error('Broker reported error: ' + frame.headers['message']);
  console.error('Additional details: ' + frame.body);
};

function setConnected(connected) {
  $("#connect").prop("disabled", connected);
  $("#disconnect").prop("disabled", !connected);
  if (connected) {
    $("#conversation").show();
  } else {
    $("#conversation").hide();
  }
  $("#workspaces").html("");
}

function connect() {
  stompClient.activate();
}

function disconnect() {
  stompClient.deactivate();
  setConnected(false);
  console.log("Disconnected");
}

function insertWorkspace() {
  stompClient.publish({
    destination: "/app/user/" + userId + "/workspace.add",
    body: JSON.stringify({ 'name': $("#name").val(), 'description': $("#description").val() })
  });
}

function updateWorkspace(id) {
  var name = document.getElementById("editName_" + id).value;
  var description = document.getElementById("editDescription_" + id).value;

  stompClient.publish({
    destination: "/app/user/" + userId + "/workspace.update/" + id,
    body: JSON.stringify({ 'name': name, 'description': description })
  });
}

function deleteWorkspace(id) {
  stompClient.publish({
    destination: "/app/user/" + userId + "/workspace.delete/" + id
  });
}

function showGreeting(user) {
  $("#workspaces").html("");
  user.workspaces.sort(function (a, b) {
    return new Date(b.workspace.updateDate) - new Date(a.workspace.updateDate);
  });
  document.getElementById("workspaces").innerHTML = "";
  user.workspaces.forEach(workspaces => {

    var rowId = workspaces.workspace.id;
    $("#workspaces").append("<tr id='" + rowId + "'>")
    $("#workspaces").append("<td><input id='editId_" + rowId + "' value='" + workspaces.workspace.id + "' readonly></td>");
    $("#workspaces").append("<td><input id='editName_" + rowId + "' value='" + workspaces.workspace.name + "'></td>");
    $("#workspaces").append("<td><input id='editDescription_" + rowId + "' value='" + workspaces.workspace.description + "'></td>");
    $("#workspaces").append("<td><input id='editCreationDate_" + rowId + "' value='" + workspaces.workspace.creationDate + "' readonly></td>");
    $("#workspaces").append("<td><input id='editUpdateDate_" + rowId + "' value='" + workspaces.workspace.updateDate + "' readonly></td>");
    $("#workspaces").append("<td><input id='editOwner_" + rowId + "' value='" + workspaces.owner + "' readonly></td>");
    $("#workspaces").append("<td><button onclick='updateWorkspace(\"" + rowId + "\")'>Update</button><button onclick='deleteWorkspace(\"" + rowId + "\")'>Delete</button></td>");
    $("#workspaces").append("</tr>")

  });
}

function userWorkspace(user) {
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
    cardFooter.className = "card-footer";
    cardFooter.innerHTML = `<p>Data criação: ${workspaces.workspace.creationDate}</p><p>Data ultima atualização: ${workspaces.workspace.updateDate}</p>`;

    workspaceCard.appendChild(cardHeader);
    workspaceCard.appendChild(cardBody);
    workspaceCard.appendChild(cardFooter);

    workspacesContainer.appendChild(workspaceCard);
  });
}






const userId = 1;
$(function () {
  $("form").on('submit', (e) => e.preventDefault());
  $("#connect").click(() => connect());
  $("#disconnect").click(() => disconnect());
  $("#insert").click(() => insertWorkspace());
  $(".update-btn").click(() => updateWorkspace());
});







// TODO: mudar o nome dessa funcao
function criarCartao2(titulo) {
  const novoCartao = document.createElement('div');
  // novoCartao.className = 'card';
  novoCartao.innerHTML = `
<div class="card" draggable="true" ondragstart="drag(event)">
  <div class="card-body">
    <h5 class="card-title">${titulo}</h5>
    <a href="#" class="btn btn-primary card-editar">Editar</a>
    <a href="#" class="btn btn-primary card-remover">Delete</a>
  </div>
</div>
`;
  return novoCartao;
}



/*
quero que quando eu clicar para inserir um novo cartao no projeto ele aparece um popup
com opções do que sera inserido.
Ideias de opções:
    - Titulo do card
    - Descricao do card
    - Tag do card (label)
    - data de inicio/termino ou apaenas a data de criacao do card
    - imagem


Projeto
    A descricao do card sera exibida?
    ou ela sera ocultada?
    ou vai aparecer apenas uma parte da desciacao com reticencias no final?
*/


function adicionarCartao(botao) {
  const coluna = botao.closest('.card').querySelector('.card-body');
  const tituloCartao = prompt('Digite o título do cartão:');
  if (tituloCartao) {
    const novoCartao = criarCartao2(tituloCartao);
    coluna.appendChild(novoCartao);
    // salvarCartoes();
  }
}

let idProjeto = 1;
function criarProjeto_teste() {
  const inserir = document.getElementById("test_projeto");

  console.log(idProjeto)

  const novoID = `project${idProjeto}`;

  console.log(novoID);

  const novoProjeto = document.createElement('div');
  novoProjeto.id = novoID;
  novoProjeto.className = 'project';

  //   <h5>Projeto${idProjeto}</h5>
  novoProjeto.innerHTML = `
<div class="row">
  <div id="container7" class="container">
    <div class="card">
      <div class="col-12">
        <div class="card-header">
          <h2>Projeto 1</h2>
        </div>
        <div class="card-body" ondrop="drop(event)" ondragover="allowDrop(event)">
          <div class="item">
            <div class="col-12">
              <div class="card" draggable="true" ondragstart="drag(event)">
                <div class="card-header">
                  <h2>Coluna 1</h2>
                </div>
                <div class="card-body" ondrop="drop(event)" ondragover="allowDrop(event)">
                  <div class="card" draggable="true" ondragstart="drag(event)">
                    <div class="card-body">
                      <h5 class="card-title">Título do cartão</h5>
                      <a href="#" class="btn btn-primary card-editar">Editar</a>
                      <a href="#" class="btn btn-primary card-remover">Delete</a>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <button class="btn btn-primary" onclick="adicionarColuna(this)">Adicionar cartão</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary" onclick="adicionarContainer(this)">Adicionar Projeto</button>
        </div>
      </div>
    </div>
  </div>
</div>
  `;

  idProjeto++;
  inserir.appendChild(novoProjeto);
}



function adicionarColuna(botao) {
  // Encontra o elemento pai do botão usando closest
  const projetoElement = botao.closest('.project');
  const idProjeto = projetoElement.id;

  // Cria e adiciona a coluna ao projeto correspondente
  const novaColuna = criarColuna();
  projetoElement.querySelector('.card-body').appendChild(novaColuna);
}


function criarColuna() {
  const novaColuna = document.createElement('div');
  novaColuna.className = 'item';

  const novaCard = criarCartao();
  novaColuna.appendChild(novaCard);


  return novaColuna;
}

function criarCartao() {
  const novoCartao = document.createElement('div');
  novoCartao.className = 'col-12';
  //novoCartao.draggable = false;
  // novoCartao.ondragstart = drag;

  novoCartao.innerHTML = `
  <div class="card" draggable="true" ondragstart="drag(event)">
<div class="card-header">
  <h2>Coluna ${document.querySelectorAll('.col-12').length + 1}</h2>
</div>
<div class="card-body" ondrop="drop(event)" ondragover="allowDrop(event)">
  <div class="card" draggable="true" ondragstart="drag(event)">
    <div class="card-body">
      <h5 class="card-title">Título do cartão</h5>
      <a href="#" class="btn btn-primary card-editar">Editar</a>
      <a href="#" class="btn btn-primary card-remover">Delete</a>
    </div>
  </div>
</div>
<div class="card-footer">
  <button class="btn btn-primary" onclick="adicionarCartao(this)">Adicionar cartão</button>
  <button class="btn btn-primary" onclick="adicionarCartao(this)">Adicionar cartão</button>
</div>
</div>
`;

  return novoCartao;
}

// salva no armazenamento local do navegador
function salvarCartoes() {
  const colunas = document.querySelectorAll('.card-body');
  const cartoes = [];
  colunas.forEach(coluna => {
    const cartoesColuna = coluna.querySelectorAll('.card');
    const cartoesColunaArray = Array.from(cartoesColuna);
    cartoes.push(cartoesColunaArray.map(cartao => cartao.innerHTML));
  });
  localStorage.setItem('cartoes', JSON.stringify(cartoes));
}

function carregarCartoes() {
  const cartoes = JSON.parse(localStorage.getItem('cartoes'));
  if (cartoes) {
    const colunas = document.querySelectorAll('.card-body');
    colunas.forEach((coluna, i) => {
      const cartoesColuna = cartoes[i];
      cartoesColuna.forEach(cartao => {
        const novoCartao = criarCartao(cartao);
        coluna.appendChild(novoCartao);
      });
    });
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setData

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData("text");
  const card = document.getElementById(data);
  const coluna = event.target.closest('.card-body');
  coluna.appendChild(card);
}

document.addEventListener('DOMContentLoaded', carregarCartoes);

let cartaoArrastado = null;

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/drag_event

document.addEventListener('dragstart', event => {
  if (event.target.classList.contains('card')) {
    cartaoArrastado = event.target;
    setTimeout(() => cartaoArrastado.classList.add('invisible'), 0);
  }
});

document.addEventListener('dragend', event => {
  if (event.target.classList.contains('card')) {
    event.target.classList.remove('invisible');
    cartaoArrastado = null;
    // salvarCartoes();
  }
});

document.addEventListener('dragover', event => {
  event.preventDefault();
  //let dragableElement = document.getElementById("dragable");
  if (event.target.classList.contains('card-body')) { //&& event.target === dragableElement) {
    const coluna = event.target;
    const cartoesColuna = coluna.querySelectorAll('.card:not(.invisible)');
    const cartaoAnterior = cartoesColuna[cartoesColuna.length - 1];
    if (cartaoAnterior) {
      const limiteInferior = cartaoAnterior.getBoundingClientRect().bottom;
      if (event.clientY > limiteInferior) {
        cartaoAnterior.after(cartaoArrastado);
        //  salvarCartoes();
      }
    } else {
      coluna.prepend(cartaoArrastado);
      //  salvarCartoes();
    }
  }
});

document.addEventListener('click', event => {
  if (event.target.classList.contains('card-remover')) {
    const resposta = confirm('Tem certeza de que deseja excluir este cartão?');
    if (resposta) {
      const cartao = event.target.closest('.card');
      cartao.remove();
      // salvarCartoes();
    }
  } else if (event.target.classList.contains('card-editar')) {
    const cartao = event.target.closest('.card');
    const tituloAtual = cartao.querySelector('.card-title').textContent;
    const novoTitulo = prompt('Editar título do cartão:', tituloAtual);
    if (novoTitulo !== null) {
      cartao.querySelector('.card-title').textContent = novoTitulo;
      // salvarCartoes();
    }
  } else if (event.target.classList.contains('card-add')) { // esse é um botao para criar um novo card ao projeto
    // tenho que exibir um popup com as opcoes a serem inseridas
  } else if (event.target.classList.contains('card-edt')) {
    // aqui ele ira abrir um popup para editar o card ja existente,
    // talvez mudar o else if acima com a calsse card-editar?
  }
});

