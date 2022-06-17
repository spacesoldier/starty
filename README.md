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
First thing first, you may already have a vision of a way to integrate your application with others in your project landscape. Or it will be an early bird which will act as a prototype of a whole system. Or you just need to write a microservice with a limited set of a functions.
At the moment, Starty can help you to build a REST API and integrate with any other REST API.
So there could be defined two main sections in your config.yml file:
- client
- server
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

## Example project:
https://github.com/spacesoldier/messageBridgeServicePrototype


## Version
0.1.xx - the very first attempt, usable for building simple REST API which could call external API
