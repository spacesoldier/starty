'use strict'

const {loggerBuilder, logLevels} = require("../logging");
const log = loggerBuilder()
                    .name('app starter')
                    .level(logLevels.INFO)
                .build();

function StateConstructor(initialState){

    let currentState = initialState;

    /**
     *
     * @param {Object} params
     * @param {Function} callback
     * @returns {*}
     */
    async function incrementState(callback, params){

        let stateError;

        if (currentState !== undefined){
            let {error} = currentState;
            stateError = error;
        }

        if (stateError !== undefined){
            // skip the startup stage calls if an error occurred before
            log.error(`skip the stage: ${callback.name}`);
        } else {
            let stateIncrement;
            try {
                stateIncrement = await callback({
                    ...currentState,
                    ...params
                });
            } catch (ex) {
                stateIncrement = { error: ex }
            }
            currentState = {
                ...currentState,
                ...stateIncrement
            }
        }

        let {error} = currentState;

        if (error !== undefined){
            let errorStatus = `Startup sequence terminated on ${callback.name} stage`;
            log.error(errorStatus);
            throw Error(error);
        } else {
            return new StateConstructor(currentState);
        }
    }

    return {
        ...currentState,
        incrementState
    }

}


module.exports = {
    StateConstructor
}
