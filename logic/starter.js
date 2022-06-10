'use strict'

function StateConstructor(initialState){

    let currentState = initialState;

    /**
     *
     * @param {Object} inputs
     * @param {Function} callback
     * @returns {*}
     */
    async function incrementState(callback, inputs){

        let stateError;

        if (inputs !== undefined){
            let {error} = inputs;
            stateError = error;
        }

        if (stateError !== undefined){
            currentState = {
                ...currentState,
                error: stateError
            }
        } else {
            let stateIncrement;
            try {
                stateIncrement = await callback({
                    ...currentState,
                    ...inputs
                });
            } catch (ex) {
                stateIncrement = { error: ex }
            }
            currentState = {
                ...currentState,
                ...stateIncrement
            }
        }

        return new StateConstructor(currentState);
    }

    return {
        ...currentState,
        incrementState
    }

}


module.exports = {
    StateConstructor
}
