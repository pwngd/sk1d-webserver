module.exports = (server, opts, done) => {
    function isAjax(req) return req.headers["x-requested-with"] === "XMLHttpRequest";

    server.get("/", async (req, rep) => {
        const data = { title:"homepage" };

        if (isAjax(req)) {
            return rep.viewAsync("index", data, { layout: "./layouts/data.ejs"} );
        } else {
            return rep.viewAsync("index", data, { layout: "./layouts/layout.ejs" });
        }
    });
    
    server.get("/test", async (req, rep) => {
        const data = { title:"testpage" };

        if (isAjax(req)) {
            return rep.viewAsync("test", data, { layout: "./layouts/data.ejs"} );
        } else {
            return rep.viewAsync("test", data, { layout: "./layouts/layout.ejs" });
        }
    });

    done();
}