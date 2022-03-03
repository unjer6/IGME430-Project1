// html element container holding all grocery lists
let listContainer;

// template for individual gorcery items
const listItemTemplate = document.createElement("template");
listItemTemplate.innerHTML = `
<li><div class="row align-items-center">
  <div class="col pe-0"><input id="text" class="w-100" type="text"></div>
  <div id="moveUp" class="col-auto px-0"><button class="btn no-focus chevron-up" type="button"></button></div>
  <div id="moveDown" class="col-auto px-0"><button class="btn no-focus chevron-down" type="button"></button></div>
  <div id="delete" class="col-auto px-0"><button type="button" class="no-focus btn-close" aria-label="Close"></button></div>
</div></li>
`;

// template for grocery lists
const listTemplate = document.createElement("template");
listTemplate.innerHTML = `
<div class="accordion-item mb-3">
  <h2 class="accordion-header">
    <button id="headerBtn" class="accordion-button no-focus collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#id">
      My List
    </button>
  </h2>
  <div id="accordianCollapse" class="accordion-collapse collapse">
    <div class="accordion-body">

      <div id="listHiddenForLoading" class="d-none">
        <!-- List items -->
        <ol id="itemList" class="ps-3">



        </ol>
        
        <!-- Add new item -->
        <button id="addItemBtn" class="w-100 px-4 py-1 d-flex justify-content-between align-items-center no-focus btn btn-primary" type="button">
          <span>Add new item</span>
          <img src="images/plus.png" width="20" height="20">
        </button>
        
        <hr>

        <!-- Save and delete -->
        <div id="unsaved" class="d-none d-flex align-items-center justify-content-center"><strong>You have unsaved changes!</strong></div>
        <button id="saveBtn" class="w-100 px-4 py-1 d-flex align-items-center no-focus btn btn-success" type="button">
          <span id="saveButtonSpinner" class="d-none spinner-border spinner-border-sm me-2"></span>
          <span id="saveSpan" class="me-auto">Save list</span>
          <img src="images/check.png" width="20" height="20">
        </button>
        <button id="deleteBtn" class="w-100 mt-1 px-4 py-1 d-flex justify-content-between align-items-center no-focus btn btn-danger" type="button">
          <span>Delete list</span>
          <img src="images/close.png" width="20" height="20">
        </button>

      </div>

      <!-- Loading spinner for when we fetch the list contents -->
      <div id="listLoadingSpinner" class="d-flex justify-content-center align-items-center mt-3">
        <div class="spinner-border" role="status" aria-hidden="true"></div>
        <strong class="ms-3">Loading...</strong>
      </div>
    </div>
  </div>
</div>
`;


// code adapted from in class demos
// BUG: For some reason if callback is null or undefined then no fetch request is sent to the server
//    Maybe it has something to do with webpack?
const sendRequest = async (action, method, callback, data, contentType) => {
    const options = {
        method: method,
        headers: {
            'Accept': 'application/json',
        },
    };

    if (data) { options.body = data; };
    if (contentType) {options.headers['Content-Type'] = contentType; };

    let response = await fetch(action, options);

    callback?.(response);
};


// code borrowed from https://stackoverflow.com/a/2117523
// creates a unique identifying number
// used so elements that need unique IDs can generate them
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// creates a new grocery item in a given grocery list with a given value as the name of the item
const createNewListItem = (list, value) => {
  const newItem = listItemTemplate.content.cloneNode(true).childNodes[1];

  const itemList = list.querySelector("#itemList"); // the ol element of the list
  const unsaved = list.querySelector('#unsaved');   // the unsaved changes text element on list

  const text = newItem.querySelector('#text');    // the text input element
  text.value = value ?? "";
  text.addEventListener("change", () => {
    // show unsaved changes
    unsaved.classList.remove("d-none");
  });

  const moveUp = newItem.querySelector("#moveUp");  // the move item up arrow button
  moveUp.addEventListener("click", () => {
    if(newItem.previousElementSibling){
      // get the text span above
      previousTextEl = newItem.previousElementSibling.querySelector("#text");

      // swap the text
      const _ = text.value;
      text.value = previousTextEl.value;
      previousTextEl.value = _;

      // show unsaved changes
      unsaved.classList.remove("d-none");
    }
  });
  // if this is the first element being added to list
  if (!itemList.firstElementChild){
    moveUp.firstElementChild.classList.add("disabled");
  }

  const moveDown = newItem.querySelector("#moveDown");  // the move item down arrow button
  moveDown.addEventListener("click", () => {
    if(newItem.nextElementSibling){
      // get the text span above
      nextTextEl = newItem.nextElementSibling.querySelector("#text");

      // swap the text
      const _ = text.value;
      text.value = nextTextEl.value;
      nextTextEl.value = _;

      // show unsaved changes
      unsaved.classList.remove("d-none");
    }
  });
  // disable this list item's arrow
  moveDown.firstElementChild.classList.add("disabled");
  if (itemList.lastElementChild){
    // enable the arrow on the item above
    itemList.lastElementChild.querySelector("#moveDown").firstElementChild.classList.remove("disabled");
  }

  // setup delete item button
  newItem.querySelector("#delete").addEventListener("click", () => {
    newItem.remove();

    // disable the arrow up on first element
    if (itemList.firstElementChild){
      itemList.firstElementChild.querySelector("#moveUp").firstElementChild.classList.add("disabled");
    }

    // disable the arrow down on last element
    if (itemList.lastElementChild){
      itemList.lastElementChild.querySelector("#moveDown").firstElementChild.classList.add("disabled");
    }

    // show unsaved changes
    unsaved.classList.remove("d-none");
  });

  itemList.appendChild(newItem);

  return newItem;
};

// creates a new grocery list with a given name
const createNewList = (name) => {
  const newList = listTemplate.content.cloneNode(true).childNodes[1];  // the second node in the nodelist is the accordian div for the new list item

  // give the collapse a unique ID and make the btn point to it
  const accordianBtn = newList.querySelector("#headerBtn");
  const accordianCollapse = newList.querySelector("#accordianCollapse");

  const uuid = `id-${uuidv4()}`;  // every id must start with a letter

  accordianBtn.dataset.bsTarget = `#${uuid}`;
  accordianCollapse.id = uuid;

  accordianBtn.textContent = name;

  // the unsaved changes text element
  const unsaved = newList.querySelector('#unsaved');

  // configure add new item button
  newList.querySelector("#addItemBtn").addEventListener("click", () => {
    const newItem = createNewListItem(newList);
    const text = newItem.querySelector('#text');

    // set focus
    text.focus();

    // show unsaved changes
    unsaved.classList.remove("d-none");
  });

  // configure save list button
  const saveBtn = newList.querySelector("#saveBtn");
  const saveText = saveBtn.querySelector("#saveSpan");
  const saveSpinner = saveBtn.querySelector("#saveButtonSpinner");
  let previousTimeout;  // the timeout ID for the previous timeout set by the save button
  saveBtn.addEventListener("click", () => {
    //change text, disable, and reveal spinner
    saveText.textContent = "Saving...";
    saveSpinner.classList.remove("d-none");
    saveBtn.classList.add("disabled");
    clearTimeout(previousTimeout);

    // POST to server
    const data = {};
    data.name = accordianBtn.textContent;
    data.items = [];
    const list = newList.querySelector("#itemList");
    for (let i = 0; i < list.children.length; i++){
      data.items.push(list.children[i].querySelector("#text").value);
    }

    const callback = () => {
      // hide spinner and enable button
      saveSpinner.classList.add("d-none");
      saveBtn.classList.remove("disabled");
      // change text temporarily and then change it back to its normal text
      saveText.textContent = "Saved!";
      previousTimeout = setTimeout(() => {
        saveText.textContent = "Save list";
      }, 2000);
    };

    sendRequest("/addList", "POST", callback, JSON.stringify(data), "application/json");

    // hide unsaved changes
    unsaved.classList.add("d-none");
  });

  // configure delete list button
  const deleteBtn = newList.querySelector("#deleteBtn");
  const deleteText = deleteBtn.querySelector("span");
  deleteBtn.addEventListener("click", () => {
    if (deleteText.textContent === "Delete list"){
      deleteText.textContent = "Are you sure?";

      setTimeout(() => {
        if(deleteText) deleteText.textContent = "Delete list";
      }, 2000);
    }
    else{
      newList.remove();

      // DELETE
      sendRequest(`/deleteList?name=${accordianBtn.textContent}`, "DELETE", ()=>{});
    }
  });

  listContainer.appendChild(newList);

  return newList;
};

// code adapted from in class demos
const init = () => {
  // initialize UI
  listContainer = document.querySelector("#listContainer");

  const addNewListBtn = document.querySelector("#addNewListBtn");
  const addListInput = addNewListBtn.querySelector("input");
  const addListText = addNewListBtn.querySelector("span");
  const alert = document.querySelector("#alert");

  addNewListBtn.addEventListener("click", () => {
    addListText.classList.add("d-none");
    addListInput.classList.remove("d-none");
    addListInput.focus();
  });

  addListInput.addEventListener("change", () => {
    let valid = false;
    if(addListInput.value) {
      valid = true;
      // go through all the names of lists we have and check to see if this is a duplicate
      for(let i = 0; i < listContainer.children.length; i++){
        const name = listContainer.children[i].querySelector("#headerBtn").textContent;

        if (name === addListInput.value){
          valid = false;
          alert.classList.remove("d-none");
          break;
        }
      }
    }
    
    if(valid) {
      const newList = createNewList(addListInput.value);
      newList.querySelector("#listHiddenForLoading").classList.remove("d-none");
      newList.querySelector("#listLoadingSpinner").classList.add("d-none");
      newList.querySelector("#headerBtn").dispatchEvent(new Event('click'));  // show new added list

      // POST new list
      const data = {};
      data.name = addListInput.value;
      data.items = [];
      sendRequest("/addList", "POST", ()=>{}, JSON.stringify(data), "application/json");

      // reset text input
      addListInput.value = "";
      addListInput.blur();
      addListText.classList.remove("d-none");
      addListInput.classList.add("d-none");
      alert.classList.add("d-none");
    }
  });

  addListInput.addEventListener("focusout", () => {
    addListInput.value = "";
    addListInput.blur();
    addListText.classList.remove("d-none");
    addListInput.classList.add("d-none");
  });


  // Fetch lists from server
  sendRequest("/getListNames", "GET", async (res) => {
    const json = await res.json();

    if(json && json.names){
      for(let i = 0; i < json.names.length; i++){
        const newList = createNewList(json.names[i]);
        const listBtn = newList.querySelector("#headerBtn");
        listBtn.addEventListener("click", () => {
          if (listBtn.dataset.loaded) return;

          listBtn.dataset.loaded = "true";

          sendRequest(`/getList?name=${listBtn.textContent}`, "GET", async (res) => {
            const jsonList = await res.json();

            if(jsonList && jsonList.items){
              for(let j = 0; j < jsonList.items.length; j++){
                createNewListItem(newList, jsonList.items[j]);
              }
            }

            newList.querySelector("#listHiddenForLoading").classList.remove("d-none");
            newList.querySelector("#listLoadingSpinner").classList.add("d-none");
          });
        });
      }
    }

    document.querySelector("#hiddenForLoading").classList.remove("d-none");
    document.querySelector("#loadingSpinner").classList.add("d-none");
  });
};

window.addEventListener("load", init);