'use strict'

const {loggerBuilder} = require('../logging');

/**
 *
 * @param {Array.<function>} initActions
 * @param {Object} logic
 * @returns {{initialize: initializeFeatures, addInitAction: addInitAction, addFeatureFunction: addFeatureFunction, featureFunctions: {}}}
 */
function FeatureStore(initActions, logic){

    const initSequence = [];

    const featureFunctions = {};

    const log = loggerBuilder()
                            .name('feature store')
                            .level('info')
                    .build();

    /**
     *
     * @param {function} action
     */
    function addInitAction(action){
        initSequence.push(action);
    }

    /**
     *
     * @param {string} featureFuncName
     * @param {Function} featureFunc
     */
    function addFeatureFunction(featureFuncName, featureFunc){
        if (featureFuncName in featureFunctions){
            if (Array.isArray(featureFunctions[featureFuncName])){
                featureFunctions[featureFuncName].push(featureFunc);
                log.info(`several logic functions under the name ${featureFuncName} exist, adding one more`);
            } else {
                log.info(`a logic function under the name ${featureFuncName} exist, converting to array of functions`);
                let existingFn = featureFunctions[featureFuncName];
                let featureFuncArr = [
                    existingFn,
                    featureFunc
                ];
                featureFunctions[featureFuncName] = featureFuncArr;
            }
        } else {
            featureFunctions[featureFuncName] = featureFunc;
            log.info(`added a logic function ${featureFuncName} to the feature store`)
        }
    }

    async function initializeFeatures (){
            for (const action of initSequence) {
                if (action instanceof Function){
                    await action();
                }
            }
    };

    return {
        addInitAction,
        addFeatureFunction,
        initializeFeatures,
        featureFunctions
    };
}

function featureStoreBuilder(){

    let initActions = [];

    /**
     *
     * @param {Function} initAction
     * @returns this
     */
    function initAction(initAction){
        initActions.push(initAction);
        return this;
    }

    let featureFunctions = {

    }

    /**
     *
     * @param {string} funcName
     * @param {Function} featureFunc
     * @returns this
     */
    function featureFunction(funcName, featureFunc){
        featureFunctions[funcName] = featureFunc;
        return this;
    }


    /**
     *
     * @returns {{initializeFeatures: initializeFeatures, addInitAction: addInitAction, addFeatureFunction: addFeatureFunction, featureFunctions: {}}}
     */
    function build(){
        return new FeatureStore(
            initActions,
            featureFunctions
        );
    }

    return {
        initAction,
        featureFunction,
        build
    }
}

module.exports = {
    featureStoreBuilder
}

