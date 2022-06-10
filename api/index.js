'use strict'

const {initServers, startServices} = require('./servers');
const {extractEndpoints} = require('./endpoints');
const {initClients} = require('./clients');
const {initRouters} = require('./routing');

module.exports = {
    extractEndpoints,
    initClients,
    initRouters,
    initServers,
    startServices
}

