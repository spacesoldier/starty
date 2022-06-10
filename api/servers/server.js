'use strict'
const http = require('http');
const https = require('https');

const {loggerBuilder} = require('../../logging');

const supportedProtocols = {
    HTTP: 'http',
    HTTPS: 'https'
}

const serverImplementations = {
    [supportedProtocols.HTTP]: http,
    [supportedProtocols.HTTPS]: https
}

/**
 *
 * @param {string} host
 * @param {number} port
 * @param {string} protocol
 * @param {Array} endpoints
 * @param {Function} rqHandler
 * @returns {{start: start}}
 * @constructor
 */
function Server(host, port, protocol, rqHandler){

    const serverHostname_s = host;
    const portToListen = port;
    const serverProtocol = protocol;
    const requestHandler = rqHandler;

    const serverInstances = [];

    const log = loggerBuilder()
                    .name(`${serverProtocol} server (${portToListen})`)
                    .level('info')
                .build();

    /**
     *
     * @param {number} srvNum
     */
    function onServerStart(srvNum){
        const serverNumber = srvNum;

        function apply(){
            if (Array.isArray(serverHostname_s)){
                let logMsg = `started server at `;
                logMsg += ` http://${serverHostname_s[serverNumber]}:${portToListen}/`;
                log.info(logMsg);
            } else {
                log.info(`started server at http://${serverHostname_s}:${portToListen}/`);
            }
        }

        return {
            apply
        }
    }

    /**
     *
     * @param {string} hostName
     */
    function initializeSingleServer (hostName){

        if (serverProtocol.toUpperCase() in supportedProtocols){
            let newServerInstance = serverImplementations[serverProtocol].createServer(requestHandler);
            newServerInstance.listen(
                portToListen,
                hostName,
                onServerStart(serverInstances.length).apply
            );
            serverInstances.push(newServerInstance);
        } else {
            log.error(`unsupported protocol ${serverProtocol}`);
        }

    }

    /**
     *
     * @param {Array|string} hostnames
     */
    function initializeMultipleServers (hostnames){
        hostnames.forEach( hostname => {
            initializeSingleServer(hostname);
        });
    }

    function start() {
        if (Array.isArray(serverHostname_s)) {
            initializeMultipleServers(serverHostname_s);
        } else {
            initializeSingleServer(serverHostname_s);
        }
    }

    return {
        start
    }

}

/**
 * Returns a new instance of `RequestWrapper`.
 * @param {IncomingMessage} [rq]
 * @param {ServerResponse} [rs]
 * @returns void
 * @type {(rq: IncomingMessage, rs: ServerResponse) => void}
 */
function defaultRequestSink(rq, rs){
    rs.statusCode = 501;
    rs.setHeader('Content-Type', 'text/html');

    rs.write('<html lang="en">');
    rs.write('<body>');
    rs.write(`<h3>Logic not implemented yet..</h3>`);
    rs.write('</body>');
    rs.write('</html>');

    rs.end();
}

function serverBuilder(){

    let hostName;

    /**
     *
     * @param {string} hostname
     * @returns this
     */
    function host(hostname){
        hostName = hostname;

        return this;
    }

    let portNumber;

    /**
     *
     * @param {number} listenPort
     * @returns this
     */
    function port(listenPort){
        portNumber = listenPort;

        return this;
    }

    let srvProtocol;

    /**
     *
     * @param {string} serverProtocol
     * @returns this
     */
    function protocol(serverProtocol){
        srvProtocol = serverProtocol;

        return this;
    }

    let exposeEndpoints;

    /**
     *
     * @param {Array} provideEndpoints
     * @returns this
     */
    function endpoints(provideEndpoints){
        exposeEndpoints = provideEndpoints;
        return this;
    }

    let requestSink;
    /**
     * @param {function} requestHandler
     * @returns this
     */
    function handler(requestHandler){
        requestSink = requestHandler;

        return this;
    }


    function build(){
        return new Server(
            hostName ?? '127.0.0.1',
            portNumber ?? 80,
            srvProtocol ?? 'http',
            requestSink ?? defaultRequestSink
        );
    }

    return {
        host,
        port,
        protocol,
        endpoints,
        handler,
        build
    }

}


module.exports = {
    serverBuilder,
    defaultRequestSink
}
