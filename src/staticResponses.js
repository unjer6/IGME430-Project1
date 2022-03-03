const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../hosted/client.html`);
const style = fs.readFileSync(`${__dirname}/../hosted/style.css`);
const js = fs.readFileSync(`${__dirname}/../hosted/client.js`);

const chevronUp = fs.readFileSync(`${__dirname}/../hosted/images/chevron-up.png`);
const chevronDown = fs.readFileSync(`${__dirname}/../hosted/images/chevron-down.png`);
const plus = fs.readFileSync(`${__dirname}/../hosted/images/plus.png`);
const check = fs.readFileSync(`${__dirname}/../hosted/images/check.png`);
const close = fs.readFileSync(`${__dirname}/../hosted/images/close.png`);
const cart = fs.readFileSync(`${__dirname}/../hosted/images/cart.png`);
const alert = fs.readFileSync(`${__dirname}/../hosted/images/alert.png`);

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

const notFound = (request, response) => {
  const data = createErrorJSON('The page you are looking for was not found.', 'notFound');
  getData(request, response, 404, 'application/json', data);
};

// GET

const getIndex = (request, response) => {
  getData(request, response, 200, 'text/html', index);
};

const getCSS = (request, response) => {
  getData(request, response, 200, 'text/css', style);
};

const getJS = (request, response) => {
  getData(request, response, 200, 'application/javascript', js);
};

const getChevronUp = (request, response) => {
  getData(request, response, 200, 'image/png', chevronUp);
};

const getChevronDown = (request, response) => {
  getData(request, response, 200, 'image/png', chevronDown);
};

const getPlus = (request, response) => {
  getData(request, response, 200, 'image/png', plus);
};

const getCheck = (request, response) => {
  getData(request, response, 200, 'image/png', check);
};

const getClose = (request, response) => {
  getData(request, response, 200, 'image/png', close);
};

const getCart = (request, response) => {
  getData(request, response, 200, 'image/png', cart);
};

const getAlert = (request, response) => {
  getData(request, response, 200, 'image/png', alert);
};

// HEAD

const notFoundHead = (request, response) => {
  getHead(request, response, 404, 'application/json');
};

module.exports = {
  // GET
  getIndex,
  getCSS,
  getJS,
  notFound,
  getChevronUp,
  getChevronDown,
  getPlus,
  getCheck,
  getClose,
  getCart,
  getAlert,
  // HEAD
  notFoundHead,
};
