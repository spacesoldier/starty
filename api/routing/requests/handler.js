'use strict'

const crypto = require('crypto');
const {loggerBuilder, logLevels} = require("../../../logging");
const {messageBuilder} = require('./message');
const {requestsCacheBuilder} = require('./requests-cache');
const {unpackRequest, clearUrlFromQuery, checkAggregateEnvelope} = require('./prepare');

const requestsCache = requestsCacheBuilder().build();

const finishRequestLogger = loggerBuilder()
                                        .name('output')
                                        .level(logLevels.INFO)
                                    .build();

function finishRequest(envelope){

    let origRequest = requestsCache.pop(envelope.msgId);
    if (origRequest !== undefined){
        let {error, message, receiver} = origRequest;

        if (error !== undefined){
            finishRequestLogger.error(`Request ${envelope.msgId} couldn't be found in cache. It may be finished before.`);
        } else {
            let {response} = message;
            response.statusCode = envelope.response.statusCode;

            for (let header in envelope.headers){
                response.setHeader(header, envelope.headers[header]);
            }

            try{
                response.write(envelope.payload);
                response.end();
            } catch (ex){
                requestsCache.put(envelope.msgId, origRequest.message, `error_${envelope.msgId}`);
                finishRequestLogger.error(`Error writing the response: ${ex}`);
                fail(500, envelope, ex);
            }


            let status = envelope.response.statusCode == 200 ? 'OK' : 'ERROR';
            finishRequestLogger.info(`[${receiver}] Request ${envelope.msgId} completed with status ${status}`);
        }

    }

}

function fail(statusCode, envelope, error){
    envelope.response.statusCode = statusCode;

    if (envelope.response.headers === undefined){
        envelope.response.headers = {};
    }

    let rsHeaders = envelope.response.headers;
    if (!('content-type' in rsHeaders)){
        rsHeaders['content-type'] = 'application/json';
    }

    envelope.payload = JSON.stringify(error);

    finishRequest(envelope);
}



function ok(envelope){

    if (envelope.response.statusCode === undefined){
        envelope.response.statusCode = 200;
    }

    // TODO: detect if it is needed to convert msg.payload to string
    // and set the content-type header properly

    finishRequest(envelope);

}

function messageRouterImpl(){
    const internalModules = {};

    /**
     *
     * @param {string} name
     * @param {Function} call
     */
    function addInternal(name, call){
        internalModules[name] = call;
    }

    /**
     *
     * @param {function} messageHandler
     */
    function processMessage(messageHandler){

        const handler = messageHandler;

        /**
         *
         * @param {{request, payload, response, msgId}} message
         */
        function process(message){
            try {
                let callResult = handler(message);
                let {payload} = callResult;

                if (payload !== undefined){
                    callResult = checkAggregateEnvelope(callResult, message);
                    // finalize response here
                    ok(callResult);
                } else {
                    // find an intersection between the message fields
                    // and internal modules names
                    let receiverNames = Object.keys(callResult).filter(key => Object.keys(internalModules).includes(key));

                    //route to internal services
                    for (let sinkName of receiverNames){
                        // very questionable, but it is very likely to use payload as a one known field for data
                        // before giving it into a custom function call
                        callResult.payload = callResult[sinkName];
                        // remove custom field
                        delete callResult[sinkName];

                        // TODO: implement the multiple subscribers to one source of messages
                        let {call} = internalModules[sinkName];
                        if (call !== undefined && call instanceof Function){
                            call(callResult);
                        }
                    }
                }

            } catch (ex){
                fail(500, message, ex);
            }
        }

        return {
            process,
        }
    }

    return {
        processMessage,
        addInternal
    }
}

const messageRouter = messageRouterImpl();


function prepareEnvelope(requestId, rq, rs, requestBody, handlerName) {
    let originalRequest = messageBuilder()
                                            .msgId(requestId)
                                            .request(rq)
                                            .response(rs)
                                            .payload(requestBody)
                                    .build();

    requestsCache.put(requestId, originalRequest, handlerName);
    let requestEnvelope = messageBuilder()
                                            .msgId(requestId)
                                            .request(unpackRequest(rq))
                                            .payload(requestBody)
                                        .build();
    return requestEnvelope;
}

/**
 *
 * @param {function} routerFunction
 */
function routedRequestHandler(name, routerFunction){

    const handlerName = name;
    const findRoute = routerFunction;

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

        let {url, method} = rq;

        rq.on('error', err => {
            log.error(`Error when processing ${method} request ${requestId} to ${url}`);
            let failEnvelope = prepareEnvelope(requestId, rq, rs, "", handlerName);
            fail(500, failEnvelope, err);
        }).on('data', chunk => {
            requestBodyChunks.push(chunk);
        }).on('end', () => {
            requestBody = Buffer.concat(requestBodyChunks).toString();

            log.info(`Received ${method} request ${requestId} to ${url}`);

            let urlWithoutQuery = clearUrlFromQuery(url);

            let {error, handler} = findRoute(urlWithoutQuery, method);

            if (error !== undefined){
                let failEnvelope = prepareEnvelope(requestId, rq, rs, requestBody, handlerName);
                fail(404, failEnvelope, error);
                log.info(`Request ${requestId} failed: ${error}`);
            } else {
                let requestEnvelope = prepareEnvelope(requestId, rq, rs, requestBody, handlerName);
                messageRouter.processMessage(handler).process(requestEnvelope);
            }

        })



    }

    return {
        handleRequest
    }
}



module.exports = {
    routedRequestHandler,
    messageRouter
}
