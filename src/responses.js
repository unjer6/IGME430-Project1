const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../hosted/client.html`);
const style = fs.readFileSync(`${__dirname}/../hosted/style.css`);
const js = fs.readFileSync(`${__dirname}/../hosted/client.js`);

const users = {};

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

// Head handlers

const notFoundHead = (request, response) => {
  getHead(request, response, 404, 'application/json');
};

// Post handlers

module.exports = {
  // GET
  getIndex,
  getCSS,
  getJS,
  notFound,
  // HEAD
  notFoundHead,
  // POST
};