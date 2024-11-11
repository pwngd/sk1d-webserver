module.exports = async (fastify, opts) => {
    const stats = require("../modules/stats.js");
    const MAX_CONNECTIONS_PER_IP = 3;
    const connections = {};
    const clients = new WeakMap();

    function addClient(socket, username){
        const clientData = [username];
        clients.set(socket, clientData);
    }

    fastify.ready(err => {
        if (err) {
            fastify.log.error(err);
            return;
        }

        if (fastify.io === null) return;

        setInterval(() => {
            if (fastify.io.engine.clientsCount<1) return; 
            const start = process.hrtime();
            const result = stats(fastify);
            const end = process.hrtime(start);
            result.elapsed = `${end[0] + end[1] / 1e9}s`;
            fastify.io.volatile.emit("stats", result);
        }, 3000);

        fastify.io.on("connection", (socket)=>{
            socket.request = null;

            const clientIp = socket.handshake.address;
            connections[clientIp] = (connections[clientIp] || 0) + 1;
            addClient(socket, "test");

            if (connections[clientIp] > MAX_CONNECTIONS_PER_IP) {
                socket.disconnect();
                connections[clientIp]--;
                return;
            }

            fastify.log.info("WS Connected");

            socket.on("disconnect", ()=>{
                fastify.log.info("WS Disconnected");
                connections[clientIp]--;
            });
        });
    });
};