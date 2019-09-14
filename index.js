'use strict';

const { exec } = require('child_process');
const path = require('path');

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

    const sericeRuntime = this.serverless.service.provider.runtime;
    const servicePath = this.serverless.config.servicePath;

    const functionNames = this.serverless.service.getAllFunctions()
    const functions = functionNames
      .map((func) => this.serverless.service.getFunction(func))
      .filter((func) => {
        if (sericeRuntime.includes("go") && typeof func.runtime === "undefined") {
          return true
        } else if (typeof func.runtime !== "undefined") {
          return func.runtime.includes("go")
        } else {
          return false
        }
      })

    functions.forEach(async (func) => {

        try {

            let build = null
            if (typeof func.build !== "undefined") {
              build = path.join(servicePath, func.build)
            }

            const output = path.join(servicePath, func.handler);
            
            if (build) {

              exec(`cd ${build} ; GOOS=linux go build -ldflags="-s -w" -o ${output}`, (error) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  return;
                }
              });
            }
        } catch(err) {
            console.error(err);
        }
    })
  }

}

module.exports = ServerlessPlugin;