'use strict'

const {loadFeatures, initFeatures} = require('./discover');
const {featureStoreBuilder} = require('./feature');
const {StateConstructor} = require('./starter');

module.exports = {
    loadFeatures,
    initFeatures,
    featureStoreBuilder,
    StateConstructor
}
