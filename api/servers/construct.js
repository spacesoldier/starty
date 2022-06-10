'use strict'

const {loggerBuilder, logLevels} = require('../../logging');

const log = loggerBuilder()
                    .name('server builder')
                    .level(logLevels.INFO)
                .build();

const {serverBuilder} = require('./server');

function initServers(inputs){

    let {parsedConf, handlers} = inputs;
    if (parsedConf !== undefined && handlers !== undefined){

        let {servers} = parsedConf;

        let preparedServers = {};

        for (let serverName in servers){
            let {hosts, port, protocol} = servers[serverName];
            log.info(`initializing server ${serverName}`);
            preparedServers[serverName] = serverBuilder()
                                                    .host(hosts)
                                                    .port(port)
                                                    .protocol(protocol)
                                                    .handler(handlers[serverName].handleRequest)
                                                .build();
        }

        return {
            runningServers: preparedServers
        }

    } else {
        return {
            error: `not enough data for server initialization`
        }
    }
}

function startServices(inputs){

    let {runningServers} = inputs;

    if (runningServers !== undefined){
        for (let serverName in runningServers){
            runningServers[serverName].start();
        }
    } else {
        return {
            error: `found no servers to start`
        }
    }
}

module.exports = {
    initServers,
    startServices
}
