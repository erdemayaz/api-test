const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

/**
 * it loads node environments from .env file
 */
if (process.env.NODE_ENV === "development") {
    dotenv.config({ path: ".env.development" });
} else {
    dotenv.config({ path: ".env" });
}

/**
 * mongodb connection with mongoose module
 */
mongoose.connect(process.env.MONGODB_SRV,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

// new instance for express application
var app = express();

/**
 * set middlewares
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * set routers as middleware
 */
app.use("/api", require('./routes/ApiRouter'));

/**
 * handle all invalid requests
 */
app.all("*", (req, res) => {
    res.status(404).json({ status: false, msg: "404" });
});

/**
 * express http server listening on dedicated port
 */
app.listen(process.env.PORT, () => {
    console.info(`Magic things happen on port ${process.env.PORT}`);
});