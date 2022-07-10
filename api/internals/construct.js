'use strict'

const {loggerBuilder, logLevels} = require("../../logging");
const log = loggerBuilder()
                    .name('internals builder')
                    .level(logLevels.INFO)
                .build();

const {internalUnitBuilder} = require('./internal-unit');

function configureInternals(inputs){
    let {parsedConf, featureStore} = inputs;

    if (parsedConf !== undefined) {
        let {internals} = parsedConf;

        let internalUnits = {};

        for (let internalUnitName in internals){
            let {input, call} = internals[internalUnitName];

            let internalUnitCall = featureStore.featureFunctions[call];
            if ( internalUnitCall !== undefined){
                internalUnits[internalUnitName] = internalUnitBuilder()
                                                                .name(internalUnitName)
                                                                .alias(input)
                                                                .call(internalUnitCall)
                                                            .build();
            }
        }

        return {
            internals: internalUnits
        }
    } else {
        return {
            error: `no parsed conf provided`
        }
    }
}

module.exports = {
    configureInternals
}
