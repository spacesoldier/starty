# Starty
A lightweight framework which helps to build modular and configurable Node.js applications

## Features
- automatic feature discovery
- application configuration using Yaml
- build a routing mechanics based on the provided configuration file
- routing the requests from logic parts of custom features to external resources
- logging

## Getting started
The process of application development with Starty consists of several steps which could be done in any sequence:
- [writing an application configuration](#Writing-the-configuration) in Yaml format
- [writing the code](#Writing-the-application-logic) which implements your application requirements, feature by feature
- let Starty discover your features at runtime and share them with the world according to the configuration

This scenario may look quite familiar for the programmers who may be new to Node.js based development, but have some previous experience with Java and one of the most popular Java frameworks - Spring Boot.

### Installation
```shell
npm i starty
```

### Writing the configuration
You may already have a vision of what do you plan to build. And some details, for example, a way of integration for your application with others in your product's landscape. Or it could be an early bird which acts as a prototype of a whole system. Or you just need to write a microservice with a limited set of a functions.

At the moment, Starty can help you to build a REST API and integrate with any other REST API.
So there could be defined two main sections in your `config.yml` file:

- servers
- clients

And, of course, you can provide an application name. Let's take a look at the empty configuration template:
```yaml
# an application name, it will appear in logs on startup
app-name: "Starty simple app"

# this section describes the application logic in a form of services
# it consists of servers and their endpoints definitions
servers:

# this section describes the usage of external services
# by defining the resources to call and how to handle the results
clients:


```
&nbsp;
#### Defining servers
Next, let's configure the server. We need to set the `port` number to listen, `hosts` or IP addresses from where to receive the requests and the `protocol` it supports. Also, it might be useful to set the name of the server.
When the server is defined, we can set up its endpoints.

```yaml
# a name of the server inside the application
my-http-server:
  hosts:
    - "127.0.0.1"
  port: 8080
  protocol: "http"
  endpoints:
```
Talking about endpoints let's assume that one endpoint has several basic properties. It could correspond to a given `location` and receive the requests with one or more `method`s. And when it comes to request handling it's a good time to name the request handler functions. So we can state a method of the endpoint and corresponding request `handler` function by providing its name.

An example of an endpoint which serves the requests with one method could be a controller providing the static content on a `GET` request.
```yaml
# a name of the endpoint which serves static content
serve-static:   # server name
  location: "/"
    methods:
      get:
        # the name of the function which handles the requests 
        # to the endpoint
        handler: "serveStatic"
```

Next, an example of an endpoint which serves the requests with several methods we could imagine a session controller.
Say, we could want it to start a new session on a `GET` request, validate an existing session on `POST` and terminate existing session on `DELETE` request.
```yaml
# an example of the endpoint which accepts the requests 
# with several methods
session:    # endpoint name
  location: "/session"
    methods:
      get:
        handler: "newSession"
      post:
        handler: "validateSession"
      delete:
        handler: "deleteSession"
```
&nbsp;
#### Defining clients
We have imagined a session controller. But it may not always know everything about the users and their roles.
So we can ask an external authorization service for help. Thus, we need to define a client for that purpose.

To allow the requests achieve their target API, several basic properties needed to be set.
Obviously, an `url` of the endpoint to call should be defined.
In some cases it could be needed to set up the `port`.
One of the important moments is to choose a `type` of the interaction with the external service.
At the moment, the only one type of clients available. 
It is *web* client which can send requests using *http* or *https* protocols.

Next, it's a good moment to think about the way the client may perform its operations.
Probably it could be useful to imagine it has several `alias`es dedicated to the `methods` used for calling an external API endpoint.
And we also need to know what to do when the external API call ended with `success` or with `fail` result by providing 
the function names which handle these sorts of result. Thus, an example of a client may look  like following:
```yaml
# a client which purpose is to call an external API
auth-api:   # client name
  type: "web"
  url: "https://authorization-service/auth"
  port: 8080
  methods:
    post:
      alias: "authApiRequest"
      success: "onAuthSuccess"
      fail: "onAuthError"
```
&nbsp;
#### Internal logic declaration
Let's imagine you plan to implement some logic which is not directly connected with the REST API implementation.
It could be some post-processing or data aggregation stage.
On the contrary, it can be a very important part of the implementation of the service, its core, separated into its own logical layer.

Starty allows to declare the internal parts of the logic in same style as it is done for the external resource clients.
Even in more simple manner. To be able to route the messages to dedicated function `call`s
it needs to know an `alias` of that function.

As an example we could imagine a function which counts how many users are online:

```yaml
internals:
  metrics:
    alias: "metricsCounter"
    call: "countUsersOnline"
```

&nbsp;
#### Scheduled events
Sometimes it is useful to perform some periodic operations. It could be sending some metrics, reports, etc.
In Node.js you can set up a timer for such a purpose. Starty helps to set up all timers in one place 
to keep an eye on the application structure.
The `schedule` section of the application config contains the timer definitions. Every timer has its own name, `alias`
and a `call` which points to the name of the function which will be executed by the timer. 
This scheduled function should be defined among other internal logic functions.
At this moment the `alias` of the timer is not important, but it could be used in future for managing timers. At least, cancelling or restarting them.

For our example case, let's show how many users are `online`, once a minute:

```yaml
schedule:
  online:
    alias: "onlineReport"
    call: "showUsersOnline"
    period: 60000   # milliseconds
```

&nbsp;
#### Environment variables

You can easily pass the environment variables into the application configuration. 
To prevent any errors, the default values should be set. The syntax looks like this:
```
   ${ENVIRONMENT_VARIABLE:default value}
```

Let's look at an example of the server configuration. 
Assume the port number to listen and an IP address to accept the requests from could be set using the environment variables.
So the server configuration will look like this:
```yaml
# a name of the server inside the application
my-http-server:
  hosts:
    - ${ACCEPT_HOST:"127.0.0.1"}
  port: ${PORT:8080}
  protocol: "http"
  endpoints:
```

&nbsp;
#### Bringing it all together

As a result, the example of an application configuration may look like following:

```yaml
# an application name, it will appear in logs on startup
app-name: "Starty simple app"

# this section describes the application logic in a form of services
# it consists of servers and their endpoints definitions
servers:
  # a name of the server inside the application
  my-http-server:
    hosts:
      - ${ACCEPT_HOST:"127.0.0.1"}
    port: ${PORT:8080}
    protocol: "http"
    endpoints:

      # a name of the endpoint which serves static content
      serve-static:   # server name
        location: "/"
          methods:
            get:
              # the name of the function which handles 
              #  the requests to endpoint
              handler: "serveStatic"
  
      # an example of the endpoint which accepts the requests 
      # with several methods
      session:    # endpoint name
        location: "/session"
          methods:
            get:
              handler: "newSession"
            post:
              handler: "validateSession"
            delete:
              handler: "deleteSession"


# this section describes the usage of external services
# by defining the resources to call and how to handle the results
clients:
  # a client which purpose is to call an external API
  auth-api:   # client name
    type: "web"
    url: ${AUTH_SRV_HOST:"https://authorization-service/auth"}
    port: ${AUTH_SRV_PORT:8080}
    methods:
      post:
        alias: "authApiRequest"
        success: "onAuthSuccess"
        fail: "onAuthError"

internals:
 metrics:
  alias: "metricsCounter"
  call: "countUsersOnline"

schedule:
 online:
  alias: "onlineReport"
  call: "showUsersOnline"
  period: 60000   # milliseconds

```
&nbsp;
### Writing the application logic
When all the preparations are done it's time to write some application logic.
In previous sections we described a lot of stuff about the configuration and binding the connections 
to the functions which will handle the requests and prepare the requests for external API.

As it was said before, it is possible to start working on the project either with configuration step, or with logic implementation step.
But it's always useful to keep in mind the plan and the project structure.

Talking about the project structure, let's take a look at it in terms of files and directories.

#### Typical project structure

At the root level of the application directory the configuration file `config.yml` is located.
The starting point of the application `app.js` is also located here.
When the application starts, the framework will perform a feature scan in the `features` directory.

Every feature implementation should be located in its own directory and provide the desired functions to the scope of the application
using the declaration in its `index.js` file. 

Thus, the project directory structure may look like following:

``` 
.
├─── features
│    ├─── feature1
│    │    ├─── feature1.js
│    │    └─── index.js
│    ├─── feature2
│    │    ├─── feature2.js
│    │    └─── index.js
│    .
│    .
│    .
│    └─── featureN
│         ├─── featureN.js
│         └─── index.js
├─── app.js
├─── config.yml
└─── package.json
```

The contents of a feature directory could be more complex. In fact, it could contain any structure, probably a sort of project dedicated to this feature implementation.
In fact the one important thing is to share through `index.js` file only the certain functions needed for the application and nothing more.
As Starty uses `require` to discover these functions, all other stuff from the feature implementation directory will live in its own scope, providing limited amount of integration points to the application scope.
Yet another sort of open/closed principle in action, one may notice.

&nbsp;
#### Entry point
The application entry point can be defined at the root level of an application directory.
In our example described above its file was named as `app.js`.
Let's take a look at the contents of this file:

```javascript
const {applicationStart} = require('starty');

applicationStart('./config.yml');
```

Looks simple, isn't it? What happens here is the following: we load Starty using `require`,
 tell where to find a configuration file and then let it do the job by discovering and configuring features from the directory which contains the features code.

This approach could be useful when it comes to run your applications in containerized environment.
For example, you can pack only the entry point and *node_modules* directory and mount the configuration file and features code directories
from the external source. Which allows to develop large applications with many features and separate them into multiple applications with limited functionality in relatively simple and painless manner. 

&nbsp;
#### Writing features
Now let's talk about writing the code aimed to implement the desired application feature set.
The big idea of the development approach is to implement the blocks of technical requirements in separate modules called features for simplicity.
One feature may contain the set of functions providing logic for one or more endpoints and client connections to the external resources.

Technically it is possible to use the functions from different features building new features.
This may cause the dependencies which at the moment could not be tracked by the framework. 
So, it is up to developer to track and maintain them when making a decision to separate the functionality of one application to multiple microservices.

And now let's get down to writing some code. Assume the current task is to implement the features defined in configuration from the example provided in previous parts.
There could be two major features: `serve-static` and `session` management.
Let's take a look at the possible project structure in this case:

```
.
├─── features
│    ├─── session
│    │    ├─── session.js
│    │    └─── index.js
│    └─── serve-static
│         ├─── data
│         │    ├─── favicon.ico
│         │    └─── index.html
│         ├─── serve-static.js
│         └─── index.js
├─── app.js
├─── config.yml
└─── package.json
```

Serving static content will be left for an exercise. Probably this feature will become a part of a framework in future. 
So as an example we will implement a session management functionality. Or at least a prototype of it, located in session.js file. 
This is by no means a production-ready code, provided just for the showcase

When it comes to request handling, Starty will route the requests to the corresponding functions in your code. 
The simplest request handler function could take no parameters, but must return an object which either contains a *payload*, 
or a field named by an input of a client connection according to the configuration.

```javascript
'use strict'
const crypto = require('crypto');

// this version returns a response immediately
function newSession(){
    return {
        payload: crypto.randomUUID()
    }
}

```

Also, it is possible to set the response headers:

```javascript
'use strict'
const crypto = require('crypto');

// this version returns a response immediately
function newSession(){
    
    let session = {
        token: crypto.randomUUID(),  // generate new token
        validUntil: new Date + 7     // which is valid for a week
    }
    
    let sessionDetails = {};
    
    sessionDetails.response = {};
    sessionDetails.response.headers = {
        'content-type': 'application/json'
    };   
    
    sessionDetails.payload = JSON.stringify(session);
    
    return sessionDetails;
}

// share your code with Starty
module.exports = {
    newSession
}
```
In this case Starty will take the headers from the *response* property and write it with the *payload* into the response message.
But the simplest examples could not always be useful. In fact Starty provides a message envelope object
as a parameter for every handler function. The message envelope can have several properties:
- msgId - a unique identifier of the incoming message, provided always
- request - an object which contains request *headers* and *query* parameters. These properties can be empty when none of them received
- payload - the request body which could be empty in case of handling a GET request, for example

You can use a simple logging feature provided by the framework. 
It helps to track events happened in user defined code in connection with the name of the code block as an event source and with the timestamp.
So, here is a bit more complex example with some logging usage:
```javascript
const {loggerBuilder, logLevels} = require('starty');
const log = loggerBuilder()
                        .name('session service')
                        .level(logLevels.INFO)
                    .build();

/**
 *
 * @param   {{  msgId:    string,
 *              request:  {headers: {object}, query: {object}}, 
 *              response: {object}, 
 *              payload:  {object}
 *          }} msg
 *          
 * @returns {{  msgId:    string, 
 *              request:  {headers: {object}, query: {object}}, 
 *              response: {headers:{object}}, 
 *              payload:  {object}
 *          }} msg
 */
function newSession(msg){

    if (msg.request.query !== undefined){
     let queryStr = JSON.stringify(msg.request.query);
     
     // you can use simple logger provided by the framework
     log.info(`query params:  ${queryStr}`);
    }
    
    let session = {
        token: crypto.randomUUID(),  // generate new token
        validUntil: new Date + 7     // which is valid for a week
    }
    
    // statusCode could be set here
    // especially when it's needed to report any errors
    msg.response.statusCode = 200;
    
    // setting the response headers
    msg.response.headers = {
        'content-type': 'application/json'
    };   
    
    // provide the output data
    msg.payload = JSON.stringify(session);
    
    return msg;
}

// share your code with Starty
module.exports = {
    newSession
}

```

An example output of the logger which could be found in console when a request with query params arrived:
> [2022-06-24T05:57:24.661Z] [INFO] [session service] query params:  {"foo":"bar","fizz":"buzz"}

The next and probably the last example will be a function which initiates the external resource call.
Let's imagine we need the session controller to get the new token from an external API:

```javascript
'use strict'

/**
 *
 * @param   {{  msgId:    string,
 *              request:  {headers: {object}, query: {object}}, 
 *              response: {object}, 
 *              payload:  {object}
 *          }} msg
 *
 * @returns {{  msgId:    string, 
 *              request:  {headers: {object}}, 
 *              response: {headers:{object}}, 
 *              authApiRequest:  {object}
 *          }} msg
 */
function newSession(msg){
    // just for the illustration purpose
    // let's say the client provided some parameters in query
    let authParams = msg.request.query;
      
    // fill a request to external service instead
    // assuming all needed information was provided 
    // in request query params
    msg.authApiRequest = {
     ...(authParams)
    };
   
    // we do not plan to return a result here
    // so we remove the 'payload' property 
    // from the outgoing message
    delete msg.payload;
    
    // setting proper headers for external API request
    // replacing originally received headers
    msg.request = {
     headers: {
      'content-type': 'application/json'
     }
    };
   
    return msg;
}

module.exports = {
                    newSession
                  }
```
In this case, the outgoing message will be routed to the external resource
according to the property name which corresponds to the alias of the client connections
defined in the configuration file.

After the receiving any results from the external resource Starty will forward them 
to the corresponding handler function in same manner. 
The result of the call will be written into the *payload* property of the message.
The message will then be provided to the handler function which deals with *success* or *fail* results of the call.

The handler functions are written in same style with same signatures.
According to current the example case, let's take a look at the authorization results handler.
Assume the new session opened successfully and needed details are provided in `msg.payload` field.
At this point we could decide to provide these details to user, but also increase the number of users online.
This decision may touch two zones of responsibility: one for receiving the details about new sessions and another for dealing with user counting.

Also let's look at the scheduled function calls. According to the configuration described in previous chapter,
there is one call which purpose is to report the current state of the online users counter.
When firing a timed event Starty provides a *Date* object as `msg.payload`. 
The result of a scheduled call could be routed to any internal or external receiver by the same rules as described above. 

The example code which illustrates all these ideas could look like the following:
```javascript
'use strict'
const {loggerBuilder, logLevels} = require('starty');
const log = loggerBuilder()
                        .name('session service')
                        .level(logLevels.INFO)
                  .build();
/**
 *
 * @param   {{  msgId:    string,
 *              request:  {headers: {object}, query: {object}}, 
 *              response: {object}, 
 *              payload:  {object}
 *          }} msg
 *
 * @returns {{  msgId:    string, 
 *              request:  {headers: {object}}, 
 *              response: {headers:{object}}, 
 *              metricsCounter:  {object}
 *          }} msg
 */
function onAuthSuccess(msg){
    
    // let's forward the message to the users counting function
    msg.metricsCounter = msg.payload;
    delete msg.payload;
    
    return msg;
}

// do not try this at home
// please :)
let usersCount = 0;

/**
 *
 * @param   {{  msgId:    string,
 *              request:  {headers: {object}, query: {object}}, 
 *              response: {object}, 
 *              payload:  {object}
 *          }} msg
 *
 * @returns {{  msgId:    string, 
 *              request:  {headers: {object}}, 
 *              response: {headers:{object}}, 
 *              payload:  {object}
 *          }} msg
 */
function countUsersOnline(msg){
    
    log.info(`hey, one more user online!`);
    
    usersCount += 1;
    
    return msg;
}

/**
 *
 * @param   {{  msgId:    string,
 *              [request]:  {headers: {object}, query: {object}}, 
 *              [response]: {object}, 
 *              payload:  {Date}
 *          }} msg
 *
 * @returns {{  msgId:    string, 
 *              [request]:  {headers: {object}}, 
 *              [response]: {headers:{object}}, 
 *              payload:  {object}
 *          }} msg
 */
function showUsersOnline(msg){
    
    let now = msg.payload.toISOString();
    
    log.info(`Currently at ${now} there are ${usersCount} users online`);
    
    return msg;
}

module.exports = {
                     onAuthSuccess,
                     countUsersOnline,
                     showUsersOnline
                 }

```

After receiving a result, the message will be routed to users counter and then it will be routed back to the user side.
At the moment, Starty allows to build only consecutive call chains.
This definitely will be changed and improved in next versions of the framework

The authorization error response handler will be left for an exercise to the curious reader

&nbsp;
## Example project:

The example project which uses Starty for demonstration purposes could be found here:
(the full demonstration example coming soon, so it's just an old version)
https://github.com/spacesoldier/messageBridgeServicePrototype

&nbsp;
## Version history

0.1.11 - correctly terminating the startup sequence in case of error in user defined code; correctly show the logging level in log messages

0.1.10 - fixed an error with decorating features caused by out of sync library development process

0.1.9 [deprecated] - introducing scheduling the events by timer in milliseconds. Start using a word `alias`
instead of `input` for internal functions in application configuration

0.1.8 - implemented internal logic declaration as a bits of code which could be used as a separate logic level

0.1.7 - enable setting URLs as environment variables default values in config.yml

0.1.6 - fixed an error handling case when *msg.payload* is not a string (will improve later)

0.1.5 - fixed a bug when request processing fails at the beginning

0.1.4 [deprecated] - environment variables support in application config

0.1.3 - returning status code 200 automatically only in case when it was not provided by user-defined code

0.1.2 - added the support for the query parameters, fixed some bugs and finished the idea of separation the request handling by the framework and message processing by the user defined code

0.1.1 [deprecated] - the very first draft, usable for building simple REST API which could call external API with GET and POST methods

## Contacts
I appreciate any feedback, so please feel free to write me an email: 
silviosalgari@gmail.com