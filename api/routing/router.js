'use strict'

const {routeNodeBuilder, routeErrors} = require('./nodes');

// This is a prototype of a router which process the requests
// to different paths and applies request handlers
function Router(){

    const routeTree = routeNodeBuilder()
                            .name('root')
                        .build();

    /**
     *
     * @param {string} path
     * @param {string} method
     * @param {Function} requestHandler
     */
    function addRoute(path, method, requestHandler){
        routeTree.addHandler(path, method, requestHandler);
    }

    /**
     *
     * @param {string} path
     * @param {string} method
     * @returns {{error: string}|{handler: {Function}}}
     */
    function findRoute(path, method){
        let {error, handler: requestHandler} = routeTree.findHandler(path, method);
        if (error != undefined){
            return {
                error: routeErrors.NOT_FOUND
            }
        } else {
            return {
                handler: requestHandler
            }
        }
    }

    return {
        addRoute,
        findRoute
    }
}

function routerBuilder(){
    let endpoints = [];

    /**
     *
     * @param {string} path
     * @param {string} method
     * @param {Function} handler
     */
    function route(path, method, handler){
        endpoints.push({path,method,handler});
    }

    function build(){
        const newRouter = new Router();

        endpoints.forEach(
            endpoint => {
                let {path, method, handler} = endpoint;
                newRouter.addRoute(path,method,handler);
            }
        )

        return newRouter;
    }

    return {
        route,
        build
    }
}


module.exports = {
    routerBuilder
}

