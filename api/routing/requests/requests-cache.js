'use strict'
const {loggerBuilder, logLevels} = require("../../../logging");

const log = loggerBuilder()
                        .name('requests cache')
                        .level(logLevels.INFO)
                    .build();

function RequestsCache(){

    const rqCache = {};

    function put(id, rqObject, receiverName){
        if (rqCache[id] !== undefined){
            let objectSource = rqCache[id].receiver;
            log.warn(`${receiverName} rewriting existing request ${id} written to cache by ${objectSource}`);
        }
        rqCache[id] = {
            message: rqObject,
            receiver: receiverName
        }
    }

    /**
     *
     * @param {string} requestId
     * @returns {{}}
     */
    function pop(requestId){
        let errorMsg = 'not found';

        let result = rqCache[requestId];

        if (result !== undefined){
            delete rqCache[requestId];
        }

        // cache test monitor
        // for (let name in rqCache){
        //     console.log(name);
        // }

        return {
            ...(
                (result && result)
                ??
                {error: errorMsg}
            )
        }
    }

    return {
        put,
        pop
    }
}


function requestsCacheBuilder(){

    function build(){
        return new RequestsCache();
    }

    return {
        build
    }
}


module.exports = {
    requestsCacheBuilder
}
