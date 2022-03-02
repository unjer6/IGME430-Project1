const http = require('http');
const url = require('url');
const query = require('querystring');

const staticHandler = require('./staticResponses.js');
const apiHandler = require('./apiResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': staticHandler.getIndex,
    '/style.css': staticHandler.getCSS,
    '/client.js': staticHandler.getJS,

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

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
