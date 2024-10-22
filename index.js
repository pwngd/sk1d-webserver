const fastify = require("fastify");
const path = require("path");
const fastifyStatic = require("@fastify/static");
const pov = require("@fastify/view");
const ejs = require("ejs");

const server = fastify({ logger: true });

server.register(fastifyStatic, {
  root: path.join(__dirname, "public")
});

server.register(pov, {
  engine: { ejs },
  root: path.join(__dirname, "views"),
  layout: "./layouts/layout.ejs"
});

server.get("/", async (req, rep) => {
  return rep.viewAsync("index",  { title:"homepage" });
});

server.get("/test", async (req, rep) => {
  return rep.viewAsync("test",  { title:"testpage" });
});

const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();