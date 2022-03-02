let content;

const showErrorCode = (response) => {
    switch(response.status) {
        case 200: //success
          content.innerHTML = `<b>Success</b>`;
          break;
        case 201: //created
          content.innerHTML = '<b>Created</b>';
          break;
        case 204: //updated (no response back from server)
          content.innerHTML = '<b>Updated (No Content)</b>';
          break;
        case 400: //bad request
          content.innerHTML = `<b>Bad Request</b>`;
          break;
        case 404: //not found
          content.innerHTML = `<b>Not Found</b>`;
          break;
        default: //any other status code
          content.innerHTML = `Error code not implemented by client.`;
          break;
      }
};

const addHandler = async (response) => {
  if(response.status === 204) {return;};

  const obj = await response.json();
  console.log(obj);
  if (obj) {
      content.innerHTML += `<p>Message: ${obj.message}</p>`;
  }
};

const getHandler = async (response) => {
  const obj = await response.json();
  console.log(obj);

  if(response.status === 404 || response.status === 400){
    if (obj) {
      content.innerHTML += `<p>Message: ${obj.message}</p>`;
    }
    return;
  }

  if (obj && obj.names) {
      content.innerHTML += `<p>${JSON.stringify(obj.names)}</p>`;
  }
  else if (obj && obj.items) {
    content.innerHTML += `<p>${JSON.stringify(obj.items)}</p>`;
  }
};

// code adapted from in class demos
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

    showErrorCode(response);
    callback?.(response);
};

// code adapted from in class demos
const init = () => {
    
};

window.onload = init;