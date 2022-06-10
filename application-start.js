'use strict';

const {startyGreeting} = require('./about');
const {loggerBuilder,logLevels} = require('./logging');
const {readAppConfig, parseConfig} = require('./configuration');
const {
        extractEndpoints,
        initClients,
        initRouters,
        initServers,
        startServices
                    } = require('./api');
const {
        loadFeatures,
        initFeatures,
        StateConstructor
                    } = require('./logic');

const log = loggerBuilder()
                        .name('starty')
                        .level(logLevels.INFO)
                    .build();

/**
 *
 * @param {Object} inputs
 */
function lastInitStep(inputs){
    let {error} = inputs;

    if (error !== undefined){
        log.error(`Could not start application due to error: ${error}`);
    } else {
        log.info(`Initialization completed. All systems go!`);
    }
}


// configPath is the path to an application configuration file
// which declares all the stuff about ports to listen,
// protocols, endpoints and so on
function applicationStart(configPath) {

    startyGreeting();

    let appState = StateConstructor();
    appState.incrementState(                             loadFeatures                                        )
        .then(         state => state.incrementState(    initFeatures                                       ))
        .then(state => state.incrementState(    readAppConfig, {confPath: configPath}        ))
        .then(state => state.incrementState(    parseConfig                                        ))
        .then(state => state.incrementState(    extractEndpoints                                   ))
        .then(state => state.incrementState(    initClients                                        ))
        .then(state => state.incrementState(    initRouters                                        ))
        .then(state => state.incrementState(    initServers                                        ))
        .then(state => state.incrementState(    startServices                                      ))
        .then(state => state.incrementState(    lastInitStep                                       ))
        .catch(
            faultReason => {
                log.error(`cannot start app due to ${faultReason}`);
            }
        );

    return {

    };

}

module.exports = {
    applicationStart
}
