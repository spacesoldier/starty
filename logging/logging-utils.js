'use strict'

function dateTimeMs(){
    let dateTimeNow = new Date();
    return dateTimeNow.toISOString();
}

const logLevels = {
    INFO: 'INFO',
    DEBUG: 'DEBUG',
    WARN: 'WARN',
    ERROR: 'ERROR'
}

function log(loggerName, loggingLevel='info', loggingSink){

    const logName = loggerName;
    const logLevel = loggingLevel;
    const logSink = loggingSink;

    const logMsgTemplate = `[${dateTimeMs()}] `;

    function logMessage(msgLevel, msg){
        return logMsgTemplate + `[${msgLevel}] [${loggerName}] ${msg}`;
    }

    /**
     *
     * @param {string} message
     */
    function info(message){
        logSink(logMessage(logLevels.INFO, message));
    }

    /**
     *
     * @param {string} message
     */
    function debug(message){
        logSink(logMessage(logLevels.DEBUG, message));
    }

    /**
     *
     * @param {string} message
     */
    function warn(message){
        logSink(logMessage(logLevels.WARN, message));
    }


    /**
     *
     * @param {string} message
     */
    function error(message){
        logSink(logMessage(logLevels.ERROR, message));
    }


    return {
        info,
        debug,
        error,
        warn
    }
}

function loggerBuilder(){

    let logModuleName;

    /**
     *
     * @param {string} logName
     * @returns this
     */
    function name(logName){
        logModuleName = logName;

        return this;
    }

    let logModuleLevel;

    /**
     *
     * @param {string} logLevel
     * @returns this
     */
    function level(logLevel){
        logModuleLevel = logLevel;
        return this;
    }

    let logModuleSink;

    /**
     *
     * @param logSink
     * @returns this
     */
    function logSink(logSink){
        return this;
    }

    function build(){
        return new log(
            logModuleName ?? '',
            logModuleLevel ?? logLevels.INFO,
            logModuleSink ?? (console.log)
        );
    }

    return {
        name,
        level,
        logSink,
        build
    }
}


module.exports = {
    loggerBuilder,
    logLevels
}
