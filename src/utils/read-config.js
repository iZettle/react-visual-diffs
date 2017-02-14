const fs = require("fs-extra")
const path = require("path")
const deepAssign = require("deep-assign")
const objectPath = require("object-path")

const utils = require("./utils")

const defaultConfig = require("../defaults/vtest.conf")

const DEFAULT_CONF_NAME = "vtest.conf.js"

function readConfig(commander) {
  const defaultConfName = path.join(process.cwd(), DEFAULT_CONF_NAME)
  let userConfig = {}
  const startArgs = {}

  /**
   * User config file to read
   */
  if (commander.config) {
    let argConfName = commander.config
    if (!path.isAbsolute(argConfName)) {
      argConfName = path.join(process.cwd(), argConfName)
    }

    if (!fs.existsSync(argConfName)) {
      throw new Error(`Config file does not exist: ${commander.config}`)
    }

    utils.infoValue("Using config", argConfName)
    // eslint-disable-next-line global-require
    userConfig = require(argConfName)
  } else if (fs.existsSync(defaultConfName)) {
    utils.infoValue("Using config", defaultConfName)
    // eslint-disable-next-line global-require
    userConfig = require(defaultConfName)
  } else {
    utils.infoValue("Using config", "default")
  }

  const outConfig = deepAssign({}, defaultConfig, userConfig)

  /**
   * Browser
   */
  if (commander.browser) {
    const browsers = commander.browser.split(",")
      .map(browser => browser.trim())
    objectPath.set(outConfig, "screenshots.matrix.browsers", browsers)
  }

  /**
   * Resolution
   */
  if (commander.resolution) {
    const resolutions = commander.resolution.split(",")
      .map(browser => browser.trim())
      .map(res => {
        const hw = res.split("x")
        const out = {
          width: Number.parseInt(hw[0], 10),
          height: Number.parseInt(hw[1], 10)
        }

        if (
          hw.length !== 2 ||
          Number.isNaN(out.width) ||
          Number.isNaN(out.height)
        ) {
          throw new Error("Resolution does not match the format 'WidthxHeight', e.g. '1200x800'")
        }

        return out
      })

    objectPath.set(outConfig, "screenshots.matrix.resolutions", resolutions)
  }

  /**
   * Reporters.
   *
   * Respects reporter settings if set
   */
  if (commander.reporter) {
    const reporters = commander.reporter.split(",")
      .map(reporter => reporter.trim())
      .map(reporter => `vtest-${reporter}-reporter`)
      .map(reporter => {
        const existingReporter = outConfig.reporters
          .filter(existing => existing.name === reporter)
        return existingReporter.length ? existingReporter : reporter
      })
      .reduce((accumulator, current) => accumulator.concat(current), [])

    objectPath.set(outConfig, "reporters", reporters)
  }

  /**
   * Download master screenshots from store before running tests.
   */
  if (commander.downloadBefore) {
    objectPath.set(outConfig, "store.downloadBeforeTest", true)
  }

  /**
   * Tests to run
   */
  if (commander.test) {
    startArgs.filterTests = commander.test
  }

  /**
   * Update Selenium
   */
  if (commander.updateSelenium) {
    startArgs.updateSelenium = true
  }

  /**
   * Verbose
   */
  if (commander.verbose) {
    startArgs.verbose = true
  }

  /**
   * Verbose
   */
  if (commander.upload) {
    startArgs.upload = true
  }

  /**
   * Make master
   */
  if (commander.makeMaster) {
    startArgs.makeMaster = true
  }

  /**
   * Return
   */
  return deepAssign(outConfig, { args: startArgs })
}

module.exports = readConfig
