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


function decorateClientsHandlers(internalClients) {
    for (let clientName in internalClients) {
        let {
            getSuccessCall,
            getFailCall,
            setSuccessCall,
            setFailCall
        } = internalClients[clientName];

        if (
            getSuccessCall !== undefined && getSuccessCall instanceof Function
            && setSuccessCall !== undefined && setSuccessCall instanceof Function
        ) {
            setSuccessCall(messageRouter.processMessage(getSuccessCall()).process);
        }

        if (
            getFailCall !== undefined && getFailCall instanceof Function
            && setFailCall !== undefined && setFailCall instanceof Function
        ) {
            setFailCall(messageRouter.processMessage(getFailCall()).process);
        }
    }

    return internalClients;
}

function decorateInternalLogicUnits(internals) {
    let decoratedInternals = {}
    for (let internalName in internals) {
        let {alias, getCall} = internals[internalName];
        let routedCall = messageRouter.processMessage(getCall()).process;
        decoratedInternals[alias] = {
                                        call: routedCall
                                    };
    }
    return decoratedInternals;
}

function initRouters(inputs){

    let {
        featureStore,
        externalClients,
        serverEndpoints,
        internals
    } = inputs;

    externalClients = decorateClientsHandlers(externalClients);
    let internalUnits = decorateInternalLogicUnits(internals);

    let internalSources = {
        ...externalClients,
        ...internalUnits
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
    initRouters
}
