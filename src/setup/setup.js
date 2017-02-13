const generateTestIndex = require("./generate-test-index")
const build = require("./build")
const cleanTemp = require("./clean-temp")
const copyFilesToDist = require("./copy-files-to-dist")
const buildIndexHTML = require("./build-index-html")
const store = require("../utils/store")
const config = require("../models/config")
const warnIfNoMasterScreenshots = require("./warn-if-no-master-screenshots")

function setup() {
  return Promise.resolve()
    .then(() => cleanTemp({
      build: true,
      screenshot: true,
      diffScreenshot: true,
      masterScreenshot: config.get("store.downloadBeforeTest"),
      testIndex: true,
      reports: true
    }))
    .then(() => store.download({ type: "inline" }))
    .then(warnIfNoMasterScreenshots)
    .then(generateTestIndex)
    .then(build)
    .then(copyFilesToDist)
    .then(buildIndexHTML)
}

module.exports = setup
