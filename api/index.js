'use strict'

const {initServers, startServices} = require('./servers');
const {extractEndpoints} = require('./endpoints');
const {initClients} = require('./clients');
const {initRouters} = require('./routing');
const {configureInternals} = require('./internals');

module.exports = {
    extractEndpoints,
    initClients,
    initRouters,
    initServers,
    startServices,
    configureInternals
}

