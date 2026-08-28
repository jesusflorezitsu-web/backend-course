const http = require('node:http');

const HOST = 'localhost';
const PORT = 3000;

const server = http.createServer((request, response) => {
  const { method, url } = request;

  console.log(`${method} ${url}`);

  if (url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Hola, soy tu primer servidor HTTP.');
    return;
  }

  if (url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (url === '/api/info') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(
      JSON.stringify({
        app: 'request-api',
        version: '1.0.0',
        environment: 'development',
        routes: ['/', '/health', '/api/info'],
      })
    );
    return;
  }

  response.writeHead(404, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor escuchando en http://${HOST}:${PORT}`);
});