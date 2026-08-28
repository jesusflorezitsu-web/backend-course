const http = require('node:http');

const PORT = 3000;

const server = http.createServer((request, response) => {
  const { method, url } = request;

  console.log(`${method} ${url}`);

  if (url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Inicio');
    return;
  }

  if (url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (url === '/api/info') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  response.writeHead(404, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`Servidor escuchando en http://${HOSTNAME}:${PORT}`);
});