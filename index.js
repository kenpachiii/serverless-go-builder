'use strict';

const { exec } = require('child_process');

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.predeploy.bind(this),
    };
  }

  predeploy() {

    if (!process.env.GOPATH) {
      console.error("GO is required to run this plugin and GOPATH was not found!")
    }

    const functionNames = this.serverless.service.getAllFunctions()
    const functions = functionNames
      .map((func) => this.serverless.service.getFunction(func))
      .filter((func) => func.runtime.includes("go"))

    functions.forEach(async (func) => {

        try {
            const output = func.handler;
            
            exec(`go build -o ${output}`, (error) => {
              if (error) {
                console.error(`exec error: ${error}`);
                return;
              }
            });
            
        } catch(err) {
            console.error(err);
        }
    })
  }

}

module.exports = ServerlessPlugin;