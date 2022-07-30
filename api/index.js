'use strict'

const {initServers, startServices} = require('./servers');
const {extractEndpoints} = require('./endpoints');
const {initClients} = require('./clients');
const {makeFeaturesRoutable, initRouters} = require('./routing');
const {configureInternals} = require('./internals');
const {initializeTimers,startTimers} = require('./timers');

module.exports = {
    extractEndpoints,
    initClients,
    makeFeaturesRoutable,
    initRouters,
    initServers,
    startServices,
    configureInternals,
    initializeTimers,
    startTimers
}

