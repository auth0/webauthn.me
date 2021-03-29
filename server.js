const express = require("express");
const enforce = require("express-sslify");

const app = express();

if (process.env.NODE_ENV === "production") {
    console.log("Redirecting to TLS endpoint.");
    app.use(
        enforce.HTTPS({
            // Required for proper use under a reverse proxy (Heroku, etc.).
            trustProtoHeader: true,
        })
    );
}

app.use("/", express.static("dist/"));
app.use("/introduction", express.static("dist/introduction.html"));
app.use("/debugger", express.static("dist/debugger.html"));
app.use("/browser-support", express.static("dist/browser-support.html"));

app.listen(process.env.PORT || 3000, function() {
    console.log("Started.");
});