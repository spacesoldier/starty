'use strict'
const fs = require('fs');
const yaml = require('js-yaml');

function parseConfig (inputs) {
    let config;
    let {confContents} = inputs;

    if (confContents !== undefined){
        try {
            config = yaml.load(confContents);
            return {
                parsedConf: config
            };
        } catch (ex){
            console.log(ex);
            return {
                error: ex
            }
        }
    } else {
        return {
            error: `no config contents provided for parsing`
        }
    }
}

async function readAppConfig(inputs){
    let {confPath} = inputs;

    if (confPath === undefined){
        confPath = './config.yml'
    }

    try {
        const data = await fs.promises.readFile(confPath);
        return {confContents: Buffer.from(data)};
    } catch (err) {
        return {error: err};
    }
}

module.exports = {
    readAppConfig,
    parseConfig
}

