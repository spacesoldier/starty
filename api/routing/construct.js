const {loggerBuilder, logLevels} = require("../../logging");

const {routerBuilder} = require('./router');
const {routedRequestHandler,messageRouter} = require('./requests');

const log = loggerBuilder()
                    .name('router')
                    .level(logLevels.INFO)
            .build();

function defaultRequestHandler(msg){
    let {request} = msg;

    if (request !== undefined){

        let {response} = msg;

        if (response !== undefined){
            response.statusCode = 501;
            response.headers = {};
            response.headers['Content-Type'] = 'text/html';
        }

        msg.payload = `<html lang="en">
            <body>
                <h3>Logic not implemented yet..</h3>   
            </body>
        </html>
        `;
    } else {
        msg.error = `no request provided, no logic implemented`;
    }

    return msg;
}


function initSingleRouter(routerDef){

    let {
        endpoints,
        appFeatureStore
    } = routerDef;

    let newRouter = routerBuilder();
    for (let enpName in endpoints){
        let {
            endpointLocation,
            endpointMethods
        } = endpoints[enpName];
        endpointMethods.forEach(
            method =>{
                let {
                    methodName,
                    handlerName
                } = method;
                let requestHandler = appFeatureStore.featureFunctions[handlerName];

                newRouter.route(
                    endpointLocation,
                    methodName,
                    requestHandler ?? defaultRequestHandler
                );

                if (requestHandler === undefined || requestHandler === null){
                    log.error(`Could not find an implementation of ${handlerName} for endpoint ${methodName} : ${endpointLocation}`);
                }
            }
        );
    }

    return newRouter.build();
}

/**
 *
 * @param {Function} featureFunc
 * @returns {process}
 */
function featureDecorator(featureFunc){
    return messageRouter.processMessage(featureFunc).process;
}

function makeFeaturesRoutable(inputs){
    let {featureStore} = inputs;

    if (featureStore !== undefined){
        featureStore.decorateAllFeatures(featureDecorator);
    }
}

function initRouters(inputs){

    let {
        featureStore,
        externalClients,
        serverEndpoints,
        internals,
        timers
    } = inputs;

    let internalSources = {
        ...externalClients,
        ...internals
    }


    for (let internalName in internalSources){
        messageRouter.addInternal(internalName, internalSources[internalName]);
    }

    if (featureStore !== undefined && serverEndpoints !== undefined){

        let routerDefs = {};
        let requestHandlers = {};

        for (let serverName in serverEndpoints) {
                routerDefs[serverName] = initSingleRouter({
                    endpoints: serverEndpoints[serverName],
                    appFeatureStore: featureStore
                });
                requestHandlers[serverName] = routedRequestHandler(
                                                    serverName,
                                                    routerDefs[serverName].findRoute
                                                );
        }

        return {
            routers: routerDefs,
            handlers: requestHandlers
        };
    } else {
        return {error: `not enough data provided for router initialization`};
    }
}

module.exports = {
    makeFeaturesRoutable,
    initRouters
}
