const fs = require("fs-extra")
const path = require("path")
const utils = require("../utils/utils")
const config = require("../models/config")
const tests = require("../models/tests")
const Handlebars = require("handlebars")

function composeTestIndex() {
  const source = fs.readFileSync(config.get("templates.testIndex.index"), "utf-8")
  const template = Handlebars.compile(source)

  const files = tests.get()
    .map(file => ({
      name: file.id,
      path: path.join(process.cwd(), file.componentPath),
      propsPath: path.join(
        process.cwd(),
        file.path,
        file.componentSettingFiles
      )
    }))

  return template({
    files,
    componentWrapper: config.get("templates.testIndex.componentWrapper"),
    defaultContext: config.get("reactContext")
  })
}

function writeTestIndex(data) {
  fs.outputFileSync(config.get("temp.build.testIndex"), data)
}

function generateTestIndex() {
  utils.info("Generating test index")
  return Promise.resolve()
    .then(composeTestIndex)
    .then(writeTestIndex)
}

module.exports = generateTestIndex
