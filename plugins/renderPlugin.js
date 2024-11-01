module.exports = async (fastify, opts) => {
    function isAjax(req) {return req.headers["x-requested-with"] === "XMLHttpRequest"};

    fastify.get("/", async (req, rep) => {
        const data = { title:"homepage" };

        if (isAjax(req)) {
            return rep.viewAsync("index", data, { layout: "./layouts/data.ejs"} );
        } else {
            return rep.viewAsync("index", data, { layout: "./layouts/layout.ejs" });
        }
    });
    
    fastify.get("/test", async (req, rep) => {
        const data = { title:"testpage" };

        if (isAjax(req)) {
            return rep.viewAsync("test", data, { layout: "./layouts/data.ejs"} );
        } else {
            return rep.viewAsync("test", data, { layout: "./layouts/layout.ejs" });
        }
    });

    fastify.get("/chat", async (req, rep) => {
        const data = { title:"chatroom" };

        if (isAjax(req)) {
            return rep.viewAsync("chat", data, { layout: "./layouts/data.ejs"} );
        } else {
            return rep.viewAsync("chat", data, { layout: "./layouts/layout.ejs" });
        }
    });
};