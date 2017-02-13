const path = require("path")
const fs = require("fs-extra")
const resemble = require("node-resemble-js")
const mapSeries = require("promise-map-series")

const utils = require("../utils/utils")
const config = require("../models/config")
const runReporters = require("../utils/run-reporters")

function failOrPass(resembleResult) {
  return Object.assign(resembleResult, {
    passTest: !(resembleResult.misMatchPercentage > config.get("screenshots.diffThreshold"))
  })
}

function performImageComparision({ screenshotNewBuffer, screenshotMasterBuffer }) {
  return new Promise(resolve => {
    resemble(screenshotNewBuffer)
      .compareTo(screenshotMasterBuffer)
      .onComplete(data => {
        // TODO, FIX SO THAT THIS ISN'T NEEDED!
        // There's seems to be some problem with the resemble library when running
        // multiple files.
        setTimeout(() => {
          resolve(data)
        }, 500)
      })
  })
}

function saveDifference({ resembleResult, spec }) {
  if (!resembleResult.passTest) {
    resembleResult
      .getDiffImage()
      .pack()
      .pipe(
        fs.createWriteStream(
          path.join(config.get("temp.screenshots.diff"), spec.screenshotFilename)
        )
      )
  }
  return resembleResult
}

function singleTest(spec) {
  const screenshotNew = path.join(config.get("temp.screenshots.new"), spec.screenshotFilename)
  const screenshotMaster = path.join(config.get("temp.screenshots.master"), spec.screenshotFilename)

  if (!fs.existsSync(screenshotMaster)) {
    const out = Object.assign(spec, {
      misMatchPercentage: 100,
      passTest: false,
      masterScreenshotExists: false
    })

    return runReporters({ specs: out, type: "test" }).then(() => out)
  } else {
    const screenshotNewBuffer = fs.readFileSync(screenshotNew)
    const screenshotMasterBuffer = fs.readFileSync(screenshotMaster)

    return performImageComparision({ screenshotNewBuffer, screenshotMasterBuffer })
      .then(failOrPass)
      .then(resembleResult => saveDifference({ resembleResult, spec }))
      .then(resembleResult =>
        Object.assign(spec, {
          misMatchPercentage: resembleResult.misMatchPercentage,
          passTest: resembleResult.passTest,
          masterScreenshotExists: true
        })
      )
      .then(specs => runReporters({ specs, type: "test" }).then(() => specs))
  }
}

function test(specs) {
  utils.info("Comparing screenshots against master")
  return utils.createDir({ path: config.get("temp.screenshots.diff") })
    .then(() => mapSeries(specs, spec => singleTest(spec)))
}

module.exports = test
