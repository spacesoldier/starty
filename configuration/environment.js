'use strict'
const {loggerBuilder, logLevels} = require('../logging');

const log = loggerBuilder()
                        .name('environment resolver')
                        .level(logLevels.INFO)
                    .build();
function getEnvVars(){

    return {
        env: process.env
    }

}

/**
 *
 * @param {string} envVarName
 * @param envVarDefault
 * @returns {{defaultValue, name}}
 * @constructor
 */
function EnvVarUsage(envVarName, envVarDefault){
    const name = envVarName;
    const defaultValue = envVarDefault;
    let valueFromEnv;

    function setValue(actualEnvVal){
        valueFromEnv = actualEnvVal;
    }

    function actualValue(){
        return valueFromEnv ?? defaultValue;
    }

    function stringInConfig(){
        return `\${${name}:${defaultValue}}`;
    }

    return {
        name,
        defaultValue,
        actualValue,
        setValue,
        stringInConfig
    }
}

function envVarUsageBuilder(){

    let envVarName;

    /**
     *
     * @param {string} varName
     * @returns this
     */
    function name(varName){
        envVarName = varName;
        return this;
    }

    let envDefVal;

    /**
     *
     * @param envValDef
     * @returns this
     */
    function defaultValue(envValDef){
        envDefVal = envValDef;
        return this;
    }

    function build(){
        return new EnvVarUsage(
            envVarName,
            envDefVal
        );
    }

    return {
        build,
        name,
        defaultValue
    }
}

function extractEnvValueDefinition(envValFromConf){
    let envValParts = envValFromConf.split(':');
    let envValDef = envVarUsageBuilder()
                                .name(envValParts[0].slice(2))
                                .defaultValue(envValParts[1].slice(0,-1))
                            .build();
    return envValDef;
}

const envVarTemplate = /\${.*:.*}/g;

function findEnvironmentUsageInConfig(confContents) {
    let envVarUsageInConf = [];

    let envVarUsages = confContents.match(envVarTemplate);

    for (let usage of envVarUsages) {
        let envVarUsageDef = extractEnvValueDefinition(usage);
        log.info(`found ${envVarUsageDef.name} variable with default value ${envVarUsageDef.defaultValue}`);
        envVarUsageInConf.push(envVarUsageDef);
    }
    return envVarUsageInConf;
}

function fillValuesFromEnvironment(envVarUsageInConf, env) {
    for (let envVarUsage of envVarUsageInConf) {
        if (envVarUsage.name in env) {
            let envVarValue = env[envVarUsage.name];
            envVarUsage.setValue(envVarValue);
        }
    }
    return envVarUsageInConf;
}

function replaceDefaultsWithActualValues(confContents, envVarUsageInConf) {
    let newConfigText = confContents;
    for (let envVarUsage of envVarUsageInConf) {
        newConfigText = newConfigText.replaceAll(
            envVarUsage.stringInConfig(),
            envVarUsage.actualValue()
        );
    }
    return newConfigText;
}

function resolveEnvVars(inputs){

    let {env, confContents} = inputs;

    if (env !== undefined){

        if (confContents !== undefined){

            let envVarUsageInConf = findEnvironmentUsageInConfig(confContents);

            envVarUsageInConf = fillValuesFromEnvironment(envVarUsageInConf, env);

            let newConfigText = replaceDefaultsWithActualValues(confContents, envVarUsageInConf);

            return {
                confContents: newConfigText
            }
        } else {
            return {
                error: "no config contents provided. cannot start the application"
            }
        }

    }

}

module.exports = {
    getEnvVars,
    resolveEnvVars
}