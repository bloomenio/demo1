
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const server_config = require('./config');

// register middlewares
require('./middleware')(app, express);

// register routes
require('./routes')(app);

// start server
server.listen(server_config.port, () => {
    console.log(` [${(new Date()).toUTCString()}] Listening on port ${server_config.port}`);
});

module.exports = {express, app, server, io};
