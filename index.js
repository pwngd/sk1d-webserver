const fastify = require("fastify");
const path = require("path");
const fastifyStatic = require("@fastify/static");
const pov = require("@fastify/view");
const ejs = require("ejs");
const renderPlugin = require("./plugins/renderPlugin.js");

const server = fastify({ logger: true });

server.register(fastifyStatic, {
  root: path.join(__dirname, "public")
});

server.register(pov, {
  engine: { ejs },
  root: path.join(__dirname, "views")
});

server.register(renderPlugin);

const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();