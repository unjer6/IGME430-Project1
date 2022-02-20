const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../hosted/client.html`);
const style = fs.readFileSync(`${__dirname}/../hosted/style.css`);
const js = fs.readFileSync(`${__dirname}/../hosted/client.js`);

const lists = {};

// Helpers

const createErrorJSON = (message, id) => {
  let json = `{"message": "${message}"`;

  if (id) { json += `,"id":"${id}"`; }

  json += '}';

  return json;
};

const getData = (request, response, code, type, data) => {
  response.writeHead(code, { 'Content-Type': type });
  response.write(data);
  response.end();
};

const getHead = (request, response, code, type) => {
  response.writeHead(code, { 'Content-Type': type });
  response.end();
};

// Get handlers

const getIndex = (request, response) => {
  getData(request, response, 200, 'text/html', index);
};

const getCSS = (request, response) => {
  getData(request, response, 200, 'text/css', style);
};

const getJS = (request, response) => {
  getData(request, response, 200, 'application/javascript', js);
};

const notFound = (request, response) => {
  const data = createErrorJSON('The page you are looking for was not found.', 'notFound');
  getData(request, response, 404, 'application/json', data);
};

const getListNames = (request, response) => {
  const data = { names: [] };
  Object.keys(lists).forEach((name) => {
    data.names.push(name);
  });
  getData(request, response, 200, 'application/json', JSON.stringify(data));
};

const getList = (request, response, params) => {
  if (!params.name) {
    const data = {
      id: 'getListMissingParams',
      message: 'Name is required.',
    };
    return getData(request, response, 400, 'application/json', JSON.stringify(data));
  }

  if (!lists[params.name]) {
    return notFound(request, response);
  }

  return getData(request, response, 200, 'application/json', JSON.stringify(lists[params.name]));
};

// Head handlers

const notFoundHead = (request, response) => {
  getHead(request, response, 404, 'application/json');
};

const getListNamesHead = (request, response) => {
  getHead(request, response, 200, 'application/json');
};

const getListHead = (request, response) => {
  getHead(request, response, 200, 'application/json');
};

// Post handlers

const addList = (request, response, params) => {
  if (!params.name) {
    const data = {
      id: 'addListMissingParams',
      message: 'Name is required.',
    };
    return getData(request, response, 400, 'application/json', JSON.stringify(data));
  }

  let statusCode = 204;

  if (!lists[params.name]) {
    statusCode = 201;
    lists[params.name] = {};
  }

  lists[params.name].name = params.name;
  lists[params.name].items = [];
  if (params.items) {
    params.items.forEach((item) => {
      lists[params.name].items.push(item);
    });
  }

  if (statusCode === 201) {
    const data = {
      message: 'Created Successfully',
    };
    return getData(request, response, statusCode, 'application/json', JSON.stringify(data));
  }

  return getHead(request, response, statusCode, 'application/json');
};

module.exports = {
  // GET
  getIndex,
  getCSS,
  getJS,
  getListNames,
  getList,
  notFound,
  // HEAD
  getListNamesHead,
  getListHead,
  notFoundHead,
  // POST
  addList,
};
