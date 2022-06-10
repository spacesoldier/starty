'use strict'

/**
 *
 * @param {string} id
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param data
 * @returns {{request, payload, response, msgId}}
 * @constructor
 */
function Message(id, req, res, data){

    const msgId = id;
    const request = req;
    const response = res;
    let payload = data;

    return {
        msgId,
        request,
        response,
        payload
    }
}


function messageBuilder(){

    let req;
    /**
     *
     * @param {IncomingMessage} rq
     * @returns this
     */
    function request(rq){
        req = rq;
        return this;
    }


    let res;
    /**
     *
     * @param {ServerResponse} rs
     * @returns this
     */
    function response(rs){
        res = rs;
        return this;
    }

    let requestId;

    /**
     *
     * @param rqId
     * @returns this
     */
    function msgId(rqId){
        requestId = rqId;
        return this;
    }

    let data;

    /**
     *
     * @param payload
     * @returns this
     */
    function payload(payload){
        data = payload;
        return this;
    }

    /**
     *
     * @returns {{request, payload, response, msgId}}
     */
    function build(){
        return new Message(requestId, req, res, data);
    }

    return {
        msgId,
        request,
        response,
        payload,
        build
    }
}

module.exports = {
    messageBuilder
}
