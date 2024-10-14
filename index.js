const fastify = require('fastify');
const fastifyStatic = require('@fastify/static');
const path = require('path');

const server = fastify({ logger: true });

server.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
});

const start = async () => {
  try {
    await server.listen(80);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
