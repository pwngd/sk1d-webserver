const { SMTPServer } = require("smtp-server");
const fs = require("fs");

const smtp = new SMTPServer({
    secure: true,
    key: fs.readFileSync('/etc/letsencrypt/live/sk1d.org/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/sk1d.org/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/sk1d.org/chain.pem'),

    onAuth(auth, session, callback) {
        if (auth.username === "user" && auth.password === "password") {
            callback(null, { user: "user" });
        } else {
            callback(new Error("Invalid username or password"));
        }
    },

    onData(stream, session, callback) {
        let message = '';
        stream.on("data", (chunk) => {
            message += chunk.toString();
        });
        stream.on("end", () => {
            console.log("Message received:", message);
            callback();
        });
    }
});

smtp.listen(process.env.SMTP_PORT, ()=>{
    console.log(`SMTP Server is running at ${process.env.SMTP_PORT}`);
});