'use strict'
const methods = require('./methods');

/**
 *
 * @param {string} callMethod
 * @param {Array.<object>} callHeaders
 * @param {object} callPayload
 * @param {function} onSuccessHandler
 * @param {function} onFailHandler
 * @param {Object} requestAggregate
 * @constructor
 */
function CallRequest (
    callMethod,
    callHeaders = [],
    callPayload,
    onSuccessHandler,
    onFailHandler,
    requestAggregate
){

    const method = callMethod;
    const headers = callHeaders;
    const payload = callPayload;
    const onSuccess = onSuccessHandler;
    const onFail = onFailHandler;
    const aggregate = requestAggregate;

    return {
        method,
        headers,
        payload,
        onSuccess,
        onFail,
        aggregate
    }
}

function requestBuilder(){
    let callMethod;

    /**
     *
     * @param {string} method
     * @returns this
     */
    function method(method){
        callMethod = method;
        return this;
    }

    let callHeaders;

    /**
     *
     * @param {Array} rqHeaders
     * @returns this
     */
    function headers(rqHeaders){
        callHeaders = rqHeaders;
        return this;
    }

    let requestPayload;
    /**
     *
     * @param {object} rqPayload
     * @returns this
     */
    function payload(rqPayload){
        requestPayload = rqPayload;
        return this;
    }

    let onCallSuccess;

    /**
     *
     * @param {function} successResultHandler
     * @returns this
     */
    function onSuccess(successResultHandler){
        onCallSuccess = successResultHandler;
        return this;
    }

    let onCallFail;
    /**
     *
     * @param failResultHandler
     * @returns this
     */
    function onFail(failResultHandler){
        onCallFail = failResultHandler;
        return this;
    }

    let callAggregate;

    /**
     *
     * @param {Object} aggr
     * @returns this
     */
    function aggregate(aggr){
        callAggregate = aggr;
        return this;
    }

    function build(){
        return new CallRequest(
            callMethod ?? methods.GET,
            callHeaders ?? [],
            requestPayload ?? {},          // IMHO an empty object could be slightly better than undefined value
            onCallSuccess ?? (()=>{}),
            onCallFail ?? (()=>{}),
            callAggregate ?? {}
        );
    }

    return {
        method,
        headers,
        payload,
        onSuccess,
        onFail,
        build
    }
}

module.exports = {
    requestBuilder
}
