const form = document.getElementById("form");
const list = document.getElementById("option-list");
const resetBtn = document.getElementById('resetBtn');
const saveBtn = document.getElementById('saveBtn');
let params;
let tab;
let originPathName;
let searchParams = '';


async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [activeTab] = await chrome.tabs.query(queryOptions);

  return activeTab;
}

async function handleSave() {
  if(detectChange(params)) {
    const {origin, hash, pathname} = new URL(tab.url);
    searchParams = `?${params.toString()}`;
    const newPathname = document.getElementById('pathname') ? document.getElementById('pathname').value : null;
    originPathName = originPathName !== newPathname ? newPathname : originPathName;
    const newUrl = `${origin}${originPathName}${searchParams}${hash}`;

    chrome.tabs.update(tab.id, {url: newUrl});
    resetState(params, originPathName);
  }
}
function handleReset() {
  if (detectChange(params)) {
    const originParams = new URLSearchParams(searchParams);
    resetState(originParams);
  }
}

function resetState(data, pathname) {
  constructOptions(data, pathname);
  saveBtn.setAttribute('disabled', '');
  resetBtn.setAttribute('disabled', '');
}


function detectChange(changedParams, pathname) {
  return `?${changedParams.toString()}` !== searchParams || pathname !== originPathName;
}

function handleChange(e) {
  let {value, id} = e.target;
  value = value.trim();

  if (params.has(id)) {
      params.set(id, value);
    if (detectChange(params, originPathName)) {
      resetBtn.removeAttribute('disabled');
      saveBtn.removeAttribute('disabled');
    }
  } else {
    if (detectChange(params, value)) {
      resetBtn.removeAttribute('disabled');
      saveBtn.removeAttribute('disabled');
    }
  }
}

async function constructOptions(data, pathname = '/') {
  const options = [];
  list.innerHTML = '';

    for (const [key, value] of data.entries()) {
      const input = document.createElement('input');
      input.id = key;
      input.type = 'text';
      input.value = value;
      input.onchange = handleChange;

      const label = document.createElement('label');
      const container = document.createElement('div');
      const wrapper = document.createElement('div');

      label.className = 'text-right';
      container.className = 'item';
      wrapper.className = 'wrapper';

      label.innerText = `${key} :`;

      wrapper.appendChild(input);
      container.appendChild(label);
      container.appendChild(wrapper)

      options.push(container);
    }

    for (const item of options) {
      list.appendChild(item);
    }

    const checkboxContainer = document.createElement('div');
    const pathnameInput = document.createElement('input');

    pathnameInput.id = 'pathname';
    pathnameInput.value = pathname;
    pathnameInput.onchange = handleChange;
    checkboxContainer.className = 'item';
    checkboxContainer.innerHTML = `<div class="wrapper">pathname</div>`;
    checkboxContainer.appendChild(pathnameInput);

    list.appendChild(checkboxContainer);
}


async function bootstrap() {
  tab = await getCurrentTab();
  const {search, pathname} = new URL(tab.url);

  if (search) {
    params = new URLSearchParams(search);
    searchParams = search;
    originPathName = pathname;
  }

    if (params) {
    constructOptions(params, originPathName);
  }
  resetBtn.onclick = handleReset;
  saveBtn.onclick = handleSave;
}

bootstrap();

