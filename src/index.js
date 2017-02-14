#!/usr/bin/env node

const commander = require("commander")
const path = require("path")

const findTests = require("./utils/find-tests")
const seleniumRunner = require("./tester/selenium-runner")
const testDiffs = require("./tester/test-diffs")
const groupSpecs = require("./utils/group-specs")
const setup = require("./setup/setup")
const readConfig = require("./utils/read-config")
const config = require("./models/config")
const tests = require("./models/tests")
const runReporters = require("./utils/run-reporters")
const WebServer = require("./utils/web-server")
const store = require("./utils/store")
const utils = require("./utils/utils")
const makeMaster = require("./utils/make-master")
const SeleniumManager = require("./utils/selenium-manager")

const appVersion = require(path.join(__dirname, "..", "package.json")).version

commander
  .version(appVersion)
  .option("-c, --config <path>", "set path to config file")
  .option("-t, --test <test,test>", "test(s) to run")
  .option("-p, --reporter <reporter,reporter>", "filter reporters(s) to run, e.g. 'console'")
  .option("-b, --browser <browser,browser>", "filter browser(s) to run, e.g. 'chrome'")
  .option("-r, --resolution <res,res>", "filter resolution(s) to run, e.g. '1200x800'")
  .option("-v, --verbose", "verbose console output")
  .option("-d, --download-before", "download master screenshots before running tests")
  .option("--upload", "upload new screenshots and quit")
  .option("--make-master", "make current screenshots into master and quit")
  .option("--update-selenium", "update selenium and browser drivers")
  .parse(process.argv)

function shutdown({ seleniumManager, webServer, exitCode = 0 }) {
  setTimeout(() => { // Needed for browser to close correctly
    webServer.close()
    if (config.get("selenium.autostart", true)) {
      seleniumManager.close()
    }
    process.exit(exitCode)
  }, 500)
}

function setupCleanShutdown({ seleniumManager, webServer }) {
  if (process.platform === "win32") {
    // eslint-disable-next-line global-require
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.on("SIGINT", () => {
      process.emit("SIGINT")
    })
  }

  process.on("SIGINT", () => {
    shutdown({ seleniumManager, webServer })
  })

  process.on("uncaughtException", err => {
    console.log(err)
    console.log(err.stack)
    shutdown({ seleniumManager, webServer })
  })
}

function fireZeEngines() {
  // eslint-disable-next-line global-require

  const seleniumManager = new SeleniumManager()
  const webServer = new WebServer({ servePath: config.get("temp.build.path") })
  let exitCode = 1

  setupCleanShutdown({ seleniumManager, webServer })

  findTests()
    .then(tests.set)
    .then(setup)
    .then(() => {
      if (config.get("selenium.autostart", true)) {
        seleniumManager.start()
      }
    })
    .then(() => webServer.listen(config.get("webServer.port")))
    .then(seleniumRunner)
    .then(testDiffs)
    .then(specs => ({
      flatSpecs: specs,
      groupedSpecs: groupSpecs(specs)
    }))
    .then(specs => {
      exitCode = specs.flatSpecs.every(spec => spec.passTest) ? 0 : 1
      return specs
    })
    .then(specs => runReporters({ specs, type: "result" }))
    .then(() => {
      shutdown({ seleniumManager, webServer, exitCode })
    })
    .catch(err => {
      utils.error(err)
      shutdown({ seleniumManager, webServer, exitCode: 1 })
    })
}

if (require.main === module) {
  config.setAll(readConfig(commander))

  if (config.get("args.updateSelenium")) {
    const seleniumManager = new SeleniumManager()
    seleniumManager.update()
  } else if (config.get("args.upload")) {
    store.upload()
  } else if (config.get("args.makeMaster")) {
    makeMaster()
  } else {
    fireZeEngines()
  }
} else {
  utils.error("Running VTest as a module is not yet supported")
}

module.exports = fireZeEngines
