'use strict'

function EndpointMethod(name, rqHandlerName){
    const methodName = name;
    const handlerName = rqHandlerName;

    let handlerFunction;

    /**
     *
     * @param {Function} fn
     */
    function setHandlerFunction(fn){
        handlerFunction = fn;
    }

    return {
        methodName,
        handlerName,
        handlerFunction
    }
}

function methodBuilder(){
    let mtName;

    /**
     *
     * @param {string} setName
     * @returns this
     */
    function name(setName){
        mtName = setName;
        return this;
    }

    let mtHandlerName;

    /**
     *
     * @param setHandlerName
     * @returns this
     */
    function handlerName(setHandlerName){
        mtHandlerName = setHandlerName;
        return this;
    }

    /**
     *
     * @returns {{handlerFunction, methodName, handlerName}}
     */
    function build(){
        return new EndpointMethod(
          mtName ?? 'GET',
          mtHandlerName ?? 'defaultRequestSink'
        );
    }

    return {
        name,
        handlerName,
        build
    }
}

module.exports = {
    methodBuilder,
    EndpointMethod
}
