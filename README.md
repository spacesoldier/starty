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
- you write an application configuration in Yaml format
- create the directories which will have your application code inside, feature by feature
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
Probably it could be useful to imagine it has several inputs dedicated to the `methods` used for calling an external API endpoint.
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
      input: "authApiRequest"
      success: "onAuthSuccess"
      fail: "onAuthError"
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
      - "127.0.0.1"
    port: 8080
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
    url: "https://authorization-service/auth"
    port: 8080
    methods:
      post:
        input: "authApiRequest"
        success: "onAuthSuccess"
        fail: "onAuthError"



```
&nbsp;
### Writing the application logic
When all the preparations are done it's time to write some application logic.
In previous sections we defined a lot of stuff about the configuration and binding the connections 
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
└─── config.yml
```

The contents of a feature directory could be more complex. In fact, it could contain any structure, probably a sort of project dedicated to this feature implementation.
In fact the one important thing is to share through `index.js` file only the functions needed for the application and nothing more.
As Starty uses `require` to discover these functions, all other stuff from the feature implementation directory will live in its own scope, providing limited amount of integration points to the application scope.
Yet another sort of open/closed principle in action, one may notice.

## Example project:
https://github.com/spacesoldier/messageBridgeServicePrototype


## Version history
0.1.xx - the very first attempt, usable for building simple REST API which could call external API

## Contacts
I appreciate any feedback, so please feel free to write me an email: 
silviosalgari@gmail.com