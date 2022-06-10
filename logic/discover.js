'use strict'
const appRoot = require('app-root-path');
const {promises} = require('fs');

const {loggerBuilder} = require('../logging');
const {featureStoreBuilder} = require('./feature');

const log = loggerBuilder()
                    .name('feature loader')
                    .level('info')
                .build();

const featureStore = featureStoreBuilder().build();

/**
 *
 * @param {string} pathToFeaturesDir
 * @returns {Promise<string[]>}
 */
async function readFeatureDir(pathToFeaturesDir){
    try {
        return promises.readdir(pathToFeaturesDir);
    } catch (err){
        let errorMsg = `Cannot start the application due to problem reading ./features directory: `+err;
        log.error(errorMsg);
        return {
            readError: errorMsg
        }
    }
}

/**
 *
 * @param {FeatureStore} featureModules
 */
function buildFeatures(featureModules){

    for (let featureName in featureModules){
        log.info(`loading ${featureName} to feature store`);
        let featureDesc = featureModules[featureName];

        for (let fnName in featureDesc){
            if (fnName === 'init'){
                featureStore.addInitAction(featureDesc.init);
            } else {
                featureStore.addFeatureFunction(fnName, featureDesc[fnName]);
            }
        }

    }

    return featureStore;
}

/**
 *
 * @param {string} whereToGetSomeFeatures
 * @returns {Promise<{{initializeFeatures: initializeFeatures, addInitAction: addInitAction, addFeatureFunction: addFeatureFunction, featureFunctions: {}}}>}
 */
async function loadFeatures(inputs){
    let {featurePath} = inputs;

    const featuresBasePath = featurePath ?? `${appRoot}/features`;
    let allFeatureDirs = await readFeatureDir(featuresBasePath);

    let {readError} = allFeatureDirs;

    if (readError !== undefined){
        return {
            error: readError
        };
    } else {
        const featureModules = {};

        allFeatureDirs.forEach(featureDir => {
            featureModules[featureDir] = require(`${featuresBasePath}/${featureDir}`);
        });

        return {
            featureStore: buildFeatures(featureModules)
        };
    }

}

/**
 *
 * @param featureStore
 */
async function initFeatures(inputs){
    let {featureStore} = inputs;
    if (featureStore !== undefined){
        await featureStore.initializeFeatures();
    } else {
        return {
            error: `no features to init`
        }
    }

    return {};
}

module.exports = {
    loadFeatures,
    initFeatures
}
