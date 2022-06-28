'use strict'

const {readAppConfig,parseConfig} = require('./config');
const {getEnvVars,resolveEnvVars} = require('./environment')

module.exports = {
    readAppConfig,
    parseConfig,
    getEnvVars,
    resolveEnvVars
}