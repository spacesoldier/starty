'use strict'

const {EndpointMethod} = require('./method');

/**
 *
 * @param {string} name
 * @param {string} location
 * @param {Array.<EndpointMethod>} methods
 * @constructor
 */
function Endpoint (name, location, methods){
    const endpointName = name;
    const endpointLocation = location;
    const endpointMethods = methods;
    const endpointRoute = name.split('/');

    return {
        endpointName,
        endpointLocation,
        endpointMethods,
        endpointRoute
    }
}

function endpointBuilder(){

    let enpName;

    /**
     *
     * @param {string} epName
     * @returns this
     */
    function name(epName){
        enpName = epName;
        return this;
    }

    let enpLocation;

    /**
     *
     * @param {string} epLoc
     * @returns this
     */
    function location(epLoc){
        enpLocation = epLoc;
        return this;
    }

    let enpMethods = []

    /**
     *
     * @param {EndpointMethod} method
     * @returns this
     */
    function method(method){
        if (method !== undefined && method !== null){
            enpMethods.push(method);
        }
        return this;
    }

    function build(){
        return new Endpoint(
            enpName ?? enpLocation ?? '/',
            enpLocation ?? '/',
            enpMethods
        );
    }

    return {
        name,
        location,
        method,
        build
    }
}


module.exports = {
    endpointBuilder
}
