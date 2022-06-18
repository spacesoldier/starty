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

### Writing the configuration
First things first, you may already have a vision of what do you plan to build. And some details, for example, a way of integration for your application with others in your product's landscape. Or it could be an early bird which acts as a prototype of a whole system. Or you just need to write a microservice with a limited set of a functions.

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
serve-static:
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
# an example of the endpoint which accepts requests 
# with several methods
session:
  location: "/session"
    methods:
      get:
        handler: "newSession"
      post:
        handler: "validateSession"
      delete:
        handler: "deleteSession"
```


## Example project:
https://github.com/spacesoldier/messageBridgeServicePrototype


## Version
0.1.xx - the very first attempt, usable for building simple REST API which could call external API

## Contacts:
email: silviosalgari@gmail.com