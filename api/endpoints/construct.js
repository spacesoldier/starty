'use strict'

const {methodBuilder} = require('./method');
const {endpointBuilder} = require('./endpoint');
const {loggerBuilder, logLevels} = require('../../logging');

const log = loggerBuilder()
                    .name('endpoint extractor')
                    .level(logLevels.INFO)
            .build();

/**
 *
 * @param {string} enpName
 * @param {Object} currEnpDef
 * @returns {*}
 */
function constructEndpoint(inputs) {
    let {enpName, location, methods} = inputs;

    if (enpName !== undefined && methods !== undefined){
        let currEnpMethods = [];
        Object.getOwnPropertyNames(methods)
            .forEach(methodName => {
                currEnpMethods.push(
                    methodBuilder()
                        .name(methodName.toUpperCase())
                        .handlerName(methods[methodName].handler)
                        .build()
                );
            });
        let newEndpoint = endpointBuilder()
            .name(enpName)
            .location(location);
        currEnpMethods.forEach(mtd => newEndpoint.method(mtd));
        return {
            endpoint: newEndpoint.build()
        };
    } else {
        return {
            error: `not enough data to initialize an endpoint`
        }
    }
}

function extractEndpoints(inputs){
    let {parsedConf} = inputs;

    if (parsedConf !== undefined){
        const {
            'app-name': appName,
            servers
        } = parsedConf;
        log.info(`Starting ${appName.toUpperCase()}..`);

        let serverEndpointDefs = {};

        for (let serverName in servers){
            const {endpoints} = servers[serverName];

            serverEndpointDefs[serverName] = {};

            log.info(`Reading endpoints for: ${serverName}`);
            for (let endpointName in endpoints){
                let {endpoint} = constructEndpoint({
                    enpName: endpointName,
                    location: endpoints[endpointName].location,
                    methods: endpoints[endpointName].methods
                });
                if (endpoint !== undefined){
                    serverEndpointDefs[serverName][endpointName] = endpoint;
                    log.info(`new endpoint ${endpointName}`);
                }
            }
        }

        return {
            serverEndpoints: serverEndpointDefs
        }

    } else {
        return {
            error: `could not start app - invalid configuration structure`
        }
    }
}

module.exports = {
    extractEndpoints
}
