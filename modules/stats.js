const os = require("os");
const totalMemory = os.totalmem();
const totalMemoryFormatted = formatBytes(totalMemory);

function formatBytes(bytes) {
    return (bytes / 1024 / 1024).toFixed(2);
}

function convertSeconds(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days} days, ${hours} hours, ${minutes} mins, ${secs} seconds`;
}

module.exports = (fastify) => {
    const stats = {
        online: fastify.io.engine.clientsCount,
        views: fastify.uniqueIPs.size,
        memory: `${formatBytes(totalMemory - os.freemem())}/${totalMemoryFormatted} MB`,
        uptime: convertSeconds(os.uptime())
    };

    return stats;
};