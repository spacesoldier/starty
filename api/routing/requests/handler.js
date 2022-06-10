'use strict'

const crypto = require('crypto');

const {loggerBuilder, logLevels} = require("../../../logging");

const {messageBuilder} = require('./message');

function fail(statusCode, response, error, contentType='application/json'){
    response.statusCode = statusCode;
    if (!('content-type' in response.getHeaders())){
        response.setHeader('content-type', contentType);
    }

    response.write(JSON.stringify(error));
    response.end();
}

function ok(message){
    let {response, payload} = message;
    response.statusCode = 200;
    if (!('content-type' in response.getHeaders())){
        response.setHeader('Content-Type', 'text/plain');
    }

    response.write(payload);
    response.end();

}

/**
 *
 * @param {function} messageHandler
 */
function processMessage(messageHandler, internals){

    const handler = messageHandler;
    const internalModules = internals;

    /**
     *
     * @param {{request, payload, response, msgId}} message
     */
    function process(message){
        try {
            let callResult = handler(message);
            let {payload} = callResult;

            if (payload !== undefined){
                // finalize response here
                ok(message);
            } else {
                // find an intersection between the message fields
                // and internal modules names
                let receiverNames = Object.keys(callResult).filter(key => Object.keys(internalModules).includes(key));

                //route to internal services
                for (let sinkName of receiverNames){
                    // very questionable, but it is very likely to use payload as a one known field for data
                    let callPayload = callResult[sinkName];
                    callResult.payload = callPayload;
                    let {call} = internalModules[sinkName];
                    if (call !== undefined && call instanceof Function){
                        call(callResult);
                    }
                }
            }

        } catch (ex){
            fail(500, message.response, ex);
        }
    }

    return {
        process
    }
}

/**
 *
 * @param {function} routerFunction
 */
function routedRequestHandler(name, routerFunction, internalSinks){

    const handlerName = name;
    const findRoute = routerFunction;
    const internals = internalSinks;

    const log = loggerBuilder()
                            .name(handlerName)
                            .level(logLevels.INFO)
                        .build();





    /**
     * Handles an incoming API request.
     * @param {IncomingMessage} [rq]
     * @param {ServerResponse} [rs]
     * @type {(rq:IncomingMessage, rs: ServerResponse) => RequestWrapper}
     * @returns {RequestWrapper}
     */
    function handleRequest (rq, rs){

        let requestBodyChunks = [];
        let requestBody;

        const requestId = crypto.randomUUID();

        let {url, method, headers} = rq;

        rq.on('error', err => {
            log.error(`Received ${method} request ${requestId} to ${url}`);
            fail(500, rs, err);
        }).on('data', chunk => {
            requestBodyChunks.push(chunk);
        }).on('end', () => {
            requestBody = Buffer.concat(requestBodyChunks).toString();

            log.info(`Received ${method} request ${requestId} to ${url}`);

            let {error, handler} = findRoute(url, method);

            if (error !== undefined){
                fail(404, rs, error);
            } else {
                let msg = messageBuilder()
                                        .msgId(requestId)
                                        .request(rq)
                                        .response(rs)
                                        .payload(requestBody)
                                    .build();

                processMessage(handler, internals).process(msg);

            }

        })



    }

    return {
        handleRequest
    }
}



module.exports = {
    routedRequestHandler,
    processMessage
}
