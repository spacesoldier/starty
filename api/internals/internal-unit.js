'use strict'

/**
 *
 * @param {string} name
 * @param {string} alias
 * @param {function} call
 * @constructor
 */
function InternalLogicUnit(name, alias, call){

    const unitName = name;
    const unitAlias = alias;
    let unitCall = call;

    /**
     *
     * @returns {Function}
     */
    function getCall(){
        return unitCall;
    }

    /**
     *
     * @param {Function} newUnitCall
     */
    function setCall(newUnitCall){
        unitCall = newUnitCall;
    }

    return {
        alias: unitAlias,
        call: unitCall,
        getCall,
        setCall
    }
}

function defaultCallImpl (msg){
    return msg;
}

function internalUnitBuilder(){

    let uName;

    /**
     *
     * @param {string} unitName
     * @returns this
     */
    function name(unitName){
        uName = unitName;

        return this;
    }

    let uAlias;

    /**
     *
     * @param {string} unitAlias
     * @returns this
     */
    function alias(unitAlias){
        uAlias = unitAlias;

        return this;
    }

    let uCall;

    /**
     *
     * @param {Function} unitCall
     * @returns this
     */
    function call(unitCall){
        uCall = unitCall;

        return this;
    }

    /**
     *
     * @returns {{call: Function, setCall: setCall, alias: string, getCall: (function(): Function)}}
     */
    function build(){
        return new InternalLogicUnit(
            uName ?? 'unset',
            uAlias ?? 'unknown',
            uCall ?? defaultCallImpl
        );
    }

    return {
        name,
        alias,
        call,
        build
    }
}

module.exports = {
    internalUnitBuilder
}