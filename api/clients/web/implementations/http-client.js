'use strict'
const http = require('http');
const methods = require("../methods");

function checkHttpOptions(options, defaultMethod){
    let {method, port} = options;

    if (method === undefined){
        options.method = defaultMethod;
    }

    if (port === undefined){
        options.port = 80;
    }

    return options;
}

function performHttpRequest(url, options, onSuccessCall, onFailCall) {

    let responseParts = [];

    let apiRequest = http.request(url, options, res => {

        res.on('data', chunk => {
            responseParts.push(chunk);
        });
        res.on('end', () => {
            let responseData = Buffer.concat(responseParts).toString();

            if (res.statusCode == 200){
                onSuccessCall(responseData);
            } else {
                onFailCall(responseData);
            }


        });
    });
    return apiRequest;
}

function doGet(url, options, onSuccess, onFail, payload){
    options = checkHttpOptions(options, 'GET');

    let req = performHttpRequest(url, options, onSuccess, onFail);
    req.on('error', err => {
        onFail(err);
    });
    req.end();

}

function doPost(url, options, onSuccess, onFail, payload){
    options = checkHttpOptions(options, 'POST');

    let req = performHttpRequest(url, options, onSuccess, onFail);
    req.on('error', err => {
        onFail(err);
    });
    req.write(payload);
    req.end();
}

function doPut(url, options, onSuccess, onFail, payload){
    options = checkHttpOptions(options, 'PUT');
}

function doDelete(url, options, onSuccess, onFail, payload){
    options = checkHttpOptions(options, 'DELETE');
}

const httpMethods = {
    [methods.GET]: doGet,
    [methods.POST]: doPost,
    [methods.PUT]: doPut,
    [methods.DELETE]: doDelete
}

module.exports = {
    httpMethods
}
