const http = require('http');
const url = require('url');
const query = require('querystring');

const staticHandler = require('./staticResponses.js');
const apiHandler = require('./apiResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// whether or not to slow the server down on purpose for demonstration and debugging
const LAG_SWITCH = false;

const urlStruct = {
  GET: {
    '/': staticHandler.getIndex,
    '/style.css': staticHandler.getCSS,
    '/client.js': staticHandler.getJS,

    '/images/chevron-up.png': staticHandler.getChevronUp,
    '/images/chevron-down.png': staticHandler.getChevronDown,
    '/images/plus.png': staticHandler.getPlus,
    '/images/check.png': staticHandler.getCheck,
    '/images/close.png': staticHandler.getClose,
    '/images/cart.png': staticHandler.getCart,
    '/images/alert.png': staticHandler.getAlert,

    '/getListNames': apiHandler.getListNames, // returns a list of all the names of lists in the db
    '/getList': apiHandler.getList, // gets a grocery list using a name query param
  },
  HEAD: {
    '/getListNames': apiHandler.getListNamesHead,
    '/getList': apiHandler.getListHead,
  },
  POST: {
    '/addList': apiHandler.addList, // adds (or updates) a list to the database passing in json as the body
  },
  DELETE: {
    '/deleteList': apiHandler.deleteList, // deletes a list with a given name from the database
  },

  notFound: staticHandler.notFound,
};

// Code adapted from in class demos
const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = JSON.parse(bodyString);

    handler(request, response, bodyParams);
  });
};

// Code adapted from in class demos
const onRequest = (request, response) => {
  const doAfterDelay = () => {
    const parsedUrl = url.parse(request.url);
    const params = query.parse(parsedUrl.query);

    if (urlStruct[request.method] && urlStruct[request.method][parsedUrl.pathname]) {
      if (request.method === 'POST') {
        return parseBody(request, response, urlStruct[request.method][parsedUrl.pathname]);
      }

      return urlStruct[request.method][parsedUrl.pathname](request, response, params);
    }

    return urlStruct.notFound(request, response, params);
  };

  if (LAG_SWITCH) {
    // artificially simulate slow server response time
    // obviously remove this in real production
    setTimeout(doAfterDelay, 500);
  } else {
    doAfterDelay();
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
