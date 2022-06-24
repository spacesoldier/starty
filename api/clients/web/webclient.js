'use strict'

const {loggerBuilder, logLevels} = require("../../../logging");

const {httpMethods, httpsMethods} = require('./implementations');
const protocols = require('./protocols');
const methods = require('./methods');
const {encode} = require('node:querystring');

const clientImplementations = {
    [protocols.HTTP] : httpMethods,
    [protocols.HTTPS] : httpsMethods
}

/**
 *
 * @param {string} baseUrl
 * @param {string} method
 * @param {function} onSuccess
 * @param {function} onFail
 * @returns {{basePath, urlToCall, callMethods}}
 */

function webClient(name, baseUrl, port, method, onSuccess, onFail) {
    const clientName = name;
    const urlToCall = baseUrl;
    const portToCall = port;
    const urlParts = baseUrl.split('://');

    const protocol = urlParts[0].toLowerCase();

    const implementation = clientImplementations[protocol];

    const callMethod = method;
    let onSuccessCallback = onSuccess;
    let onFailCallback = onFail;

    const log = loggerBuilder()
                            .name(`${clientName} client`)
                            .level(logLevels.INFO)
                        .build();

    function getSuccessCall(){
        return onSuccessCallback;
    }

    function getFailCall(){
        return onFailCallback;
    }

    /**
     *
     * @param {function} callback
     */
    function setSuccessCall(callback){
        onSuccessCallback = callback;
    }

    /**
     *
     * @param {function} callback
     */
    function setFailCall(callback){
        onFailCallback = callback
    }

    /**
     *
     * @param {{request, payload, response, msgId}} aggregate
     * @returns {{handle: (function(*): *)}}
     */
    function handleSuccessResult(aggregate){

        let msgAggregate = aggregate;

        function handle(result){
            msgAggregate.payload = result;
            log.info(`Received OK response for ${aggregate.msgId}`);
            onSuccessCallback(msgAggregate);
        }

        return {
            handle
        }
    }

    /**
     *
     * @param {{request, payload, response, msgId}} aggregate
     * @returns {{handle: (function(*): *)}}
     */
    function handleFailResult(aggregate){

        let msgAggregate = aggregate;

        function handle(result){
            msgAggregate.payload = result;
            log.info(`Received ERROR response for ${aggregate.msgId}`);
            onFailCallback(msgAggregate);
        }

        return {
            handle
        }
    }


    /**
     *
     * @param {Message} callRequest
     * @returns {Promise<void>}
     */
    function call (msg){

        if (implementation !== undefined){
            if (callMethod in implementation){
                log.info(`We'll call ${urlToCall} with ${method} method`);

                let {headers, query} = msg.request;
                let requestBody = msg.payload;

                let queryStr;
                if (query !== undefined){
                    queryStr = `?${encode(query)}`;
                } else {
                    queryStr = ''
                }

                let doRequest = implementation[method];

                if (doRequest !== undefined){
                    doRequest(
                        urlToCall+queryStr,
                        {
                            port: portToCall,
                            headers: {...headers}
                        },
                        handleSuccessResult(msg).handle,
                        handleFailResult(msg).handle,
                        requestBody
                    );
                }
            }
        }

    }

    return {
        call,
        getSuccessCall,
        getFailCall,
        setSuccessCall,
        setFailCall
    }
}

function webClientBuilder(){

    let clientName;

    /**
     *
     * @param {string} name
     * @returns this
     */
    function name(name){
        clientName = name;
        return this;
    }

    let onSuccessCall;

    /**
     *
     * @param {function} callback
     * @returns this
     */
    function onSuccess(callback){
        onSuccessCall = callback;
        return this;
    }

    let onFailCall;

    /**
     *
     * @param {function} callback
     * @returns this
     */
    function onFail(callback){
        onFailCall = callback;
        return this;
    }

    let clientUrl;

    /**
     *
     * @param {string} baseUrl
     * @returns this
     */
    function url(baseUrl){
        clientUrl = baseUrl;
        return this;
    }

    let callMethod;

    /**
     *
     * @param {string} mtd
     * @returns this
     */
    function method(mtd){
        callMethod = mtd;
        return this;
    }

    let servicePort;

    /**
     *
     * @param {number} port
     */
    function port(port){
        servicePort = port;
        return this;
    }

    function checkPortByProtocol(url){
        let urlParts = url.split('://');
        let protocol = urlParts[0].toUpperCase();
        if (protocol in protocols){
            return protocols.defaultPorts[protocol]
        } else {
            return  80;
        }
    }

    function build(){
        return new webClient(
            clientName,
            clientUrl,
            servicePort ?? checkPortByProtocol(clientUrl),
            callMethod ?? methods.GET,
            onSuccessCall,
            onFailCall
        );
    }


    return {
        name,
        url,
        method,
        port,
        onSuccess,
        onFail,
        build
    }
}

module.exports = {
    webClientBuilder
}
