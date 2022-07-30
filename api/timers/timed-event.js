'use strict'
const crypto = require('crypto');

const {loggerBuilder, logLevels} = require("../../logging");

function TimedEvent(timerName, timerAlias, scheduledCall, timerPeriod){
    const name = timerName;
    const alias = timerAlias;
    let timerCall = scheduledCall;
    const period = timerPeriod;

    /**
     *
     * @returns {Function}
     */
    function getCall(){
        return timerCall;
    }

    /**
     *
     * @param {Function} newTimerCall
     */
    function setCall(newTimerCall){
        timerCall = newTimerCall;
        let peep = {};
    }

    function call(){
        let msg = {
            msgId: crypto.randomUUID(),
            payload: new Date()
        };

        timerCall(msg);
    }

    let timer;

    const log = loggerBuilder()
                            .name(`timer ${timerName}`)
                            .level(logLevels.INFO)
                        .build();

    function start(){
        if (timer !== undefined){
            try{
                clearInterval(timer);
                log.info(`restarted`);
            } catch (ex){
                log.warn(`error when trying to restart: ${ex}`);
            }
        }
        timer = setInterval(call,period);
        log.info(`started at ${new Date().toTimeString()}`);
    }

    function stop(){
        if (timer !== undefined){
            try{
                clearInterval(timer);
                log.info(`stopped at ${new Date().toTimeString()}`);
            } catch (ex){
                log.warn(`error when trying to stop: ${ex}`);
            }
        }
    }

    return {
        name,
        alias,
        call,
        period,
        start,
        stop,
        getCall,
        setCall
    }
}

let defaultTimedCall = () => {}

function timedEventBuilder(){

    let tName;

    /**
     *
     * @param {string} timerName
     * @returns this
     */
    function name(timerName){
        tName = timerName;

        return this;
    }

    let tAlias;

    /**
     *
     * @param {string} timerAlias
     * @returns this
     */
    function alias(timerAlias){
        tAlias = timerAlias;

        return this;
    }

    let tPeriod;

    /**
     *
     * @param {number} timerPeriod in milliseconds
     * @returns this
     */
    function period(timerPeriod){
        tPeriod = timerPeriod
        return this;
    }

    let tCall;

    /**
     *
     * @param {Function} scheduledCall
     * @returns this
     */
    function call(scheduledCall){
        tCall = scheduledCall;
        return this;
    }

    /**
     *
     * @returns {{call, period, stop: stop, name, start: start, alias}}
     */
    function build(){
        return new TimedEvent(
            tName ?? 'timer',
            tAlias ?? 'unknown',
            tCall ?? defaultTimedCall,
            tPeriod ?? 1000
        );
    }

    return {
        alias,
        call,
        name,
        period,
        build
    }

}


module.exports = {
    timedEventBuilder
}
