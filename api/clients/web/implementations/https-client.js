'use strict'


const methods = require("../methods");

function checkHttpsOptions(options, defaultMethod){
    let {method, port} = options;

    if (method === undefined){
        options.method = defaultMethod;
    }

    if (port === undefined){
        options.port = 443;
    }

    return options;
}

const https = require('https');

function performHttpsRequest(url, options, onSuccessCall, onFailCall) {

    let responseParts = [];

    let apiRequest = https.request(url, options, res => {

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
    options = checkHttpsOptions(options, 'GET');

    let req = performHttpsRequest(url, options, onSuccess, onFail);
    req.on('error', err => {
        onFail(err);
    });
    req.end();

}



function doPost(url, options, onSuccess, onFail, payload={}){
    options = checkHttpsOptions(options, 'POST');

    let req = performHttpsRequest(url, options, onSuccess, onFail);

    req.on('error', err => {
        onFail(err);
    });
    req.write(payload);
    req.end();
}

function doPut(url, options, onSuccess, onFail, payload){
    options = checkHttpsOptions(options, 'PUT');
}

function doDelete(url, options, onSuccess, onFail, payload){
    options = checkHttpsOptions(options, 'DELETE');
}

const httpsMethods = {
    [methods.GET]: doGet,
    [methods.POST]: doPost,
    [methods.PUT]: doPut,
    [methods.DELETE]: doDelete
}

module.exports = {
    httpsMethods
}