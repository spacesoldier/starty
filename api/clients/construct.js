'use strict'

const {webClientBuilder} = require('./web');
const clientTypes = require('./client-types');

const clientImplementations = {
    [clientTypes.WEB]: webClientBuilder()
}

const {loggerBuilder, logLevels} = require("../../logging");
const log = loggerBuilder()
                        .name('client builder')
                        .level(logLevels.INFO)
                    .build();

function initClients(inputs){

    let {parsedConf, featureStore} = inputs;

    if (parsedConf !== undefined) {
        let {clients} = parsedConf;

        if (clients !== undefined && featureStore !== undefined){

            let externalServiceClients = {};

            for (let clientName in clients){
                let clientType = clients[clientName].type;
                if (clientType !== undefined){
                    log.info(`initializing ${clientName} ${clientType} client`);
                    if (clientType in clientImplementations){
                        let {url, port, methods} = clients[clientName];
                        let clientBuilder = clientImplementations[clientType];
                        for (let method in methods){
                            let {input, success, fail} = methods[method];

                            let successHandler = featureStore.featureFunctions[success];
                            let failHandler = featureStore.featureFunctions[fail];

                            if (successHandler !== undefined){
                                externalServiceClients[input] = clientBuilder
                                                                            .name(clientName)
                                                                            .method(method)
                                                                            .url(url)
                                                                            .port(port)
                                                                            .onSuccess(successHandler)
                                                                            .onFail(failHandler)
                                                                        .build();
                            } else {
                                log.info(`cannot initialize ${clientName} client due to lack of a call result handler`)
                            }

                        }

                    }

                }

            }

            return {
                externalClients: externalServiceClients
            }
        }

    } else {
        return {
            error: `no parsed conf provided`
        }
    }


}

module.exports = {
    initClients
}
