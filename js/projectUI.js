const main = document.querySelector('#main');

const list = new Sortable(main, {
  group: 'list',
  sort: true,
  filter: '.add-card',
  draggable: '.list',
  ghostClass: "ghost",
  dragoverBubble: true,
});

function initContent() {
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

initContent();

// for test only
function initContent2() {
  const dropzones = document.querySelectorAll('.project_card');
  dropzones.forEach(item => {
    new Sortable(item, {
      group: 'list',
      sort: true,
      draggable: '.list',
      ghostClass: "ghost",
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initContent2();
});

const inputs = document.querySelectorAll('textarea');

inputs.forEach(item => {
  item.addEventListener('blur', inputBlurHandler);
});

function inputBlurHandler() {
  this.classList.add('inactive');
  this.disabled = true;
  this.classList.remove('active');
  list.option('disabled', false);
}

const body = document.querySelector('body');

body.addEventListener('click', bodyClickHandler);

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
    const newEl = document.createElement('div');
    newEl.className = 'add-card editable';
    newEl.appendChild(document.createTextNode('+ Adicionar novo card'));
    el.parentNode.appendChild(newEl);
    el.parentNode.querySelector('.content').appendChild(el);
  }

  if (el.parentElement.className === 'list initial') {
    el.parentElement.className = 'add-list';
  }

  if (el.parentElement.className === 'list pending') {
    el.parentElement.className = 'list';
    el.className = 'title removable editable';
    const newContent = document.createElement('div');
    newContent.className = 'content';

    el.parentElement.appendChild(newContent);

    const newEl = document.createElement('div');
    newEl.className = 'add-card editable';
    newEl.appendChild(document.createTextNode('+ Adicionar novo card'));
    el.parentNode.appendChild(newEl);

    initContent();

    const addList = document.createElement('div');
    addList.className = 'add-list';
    const title = document.createElement('div');
    title.className = 'title editable';
    title.appendChild(document.createTextNode('+ Adicionar novo catálogo'));
    addList.appendChild(title);
    el.parentElement.parentElement.appendChild(addList);
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

initDelete();

function elMouseEnterHandler(e) {
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
  const del = e.target.querySelector('span');
  if (del) e.target.removeChild(del);
}

function deleteHandler(e) {
  const parent = e.target.parentElement;

  if (parent.classList.contains('card')) {
    parent.parentElement.removeChild(parent);
  }

  if (parent.classList.contains('title')) {
    parent.parentElement.parentElement.removeChild(parent.parentElement);
  }
}
