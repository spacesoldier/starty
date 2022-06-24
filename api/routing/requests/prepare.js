'use strict'
const {decode} = require('node:querystring');

/**
 *
 * @param {string} url
 * @returns {string}
 */
function queryFromUrl(url){
    let query = url.match(/(?<=[?]).*/g);

    return query ? query[0] : '';
}

/**
 *
 * @param {string} url
 * @returns {string}
 */
function clearUrlFromQuery (url){
    let urlWithoutQuery = url.match(/.*(?=[?])/g);
    return urlWithoutQuery ? urlWithoutQuery[0] : url;
}

/**
 *
 * @param {IncomingMessage} rq
 * @returns {{headers, query: ParsedUrlQuery}}
 */
function unpackRequest(rq){

    let {headers, url} = rq;

    let queryParams = decode(queryFromUrl(url));

    return {
        headers,
        query: queryParams
    }
}

function checkAggregateEnvelope(outputMsgObj, origEnvelope){
    let {msgId, response} = outputMsgObj;
    if (msgId === undefined){
        outputMsgObj.msgId = origEnvelope.msgId;
    }
    if (response === undefined){
        outputMsgObj.response = origEnvelope.response;
    }
    return outputMsgObj;
}


module.exports = {
    unpackRequest,
    clearUrlFromQuery,
    checkAggregateEnvelope
}