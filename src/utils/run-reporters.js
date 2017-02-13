const path = require("path")
const mapSeries = require("promise-map-series")
const chalk = require("chalk")

const utils = require("./utils")
const config = require("./../models/config")

function runSingleReporter({ specs, reporterConfig, type }) {
  const reporterName = reporterConfig.name ? reporterConfig.name : reporterConfig
  // eslint-disable-next-line global-require
  const reporter = require(path.join(process.cwd(), "node_modules", reporterName))
  // TODO. The above line feels a bit hackish but it's the only way I got it working
  // Try removing the node_modules parts once the reporters are published to NPM and
  // therefor "yarn link" is not needed. Could be that yarn link won't resolve correctly.
  return reporter[type]({
    specs,
    config,
    reporterConfig,
    chalk,
    log: {
      format: utils.format,
      log: utils.log,
      info: utils.info,
      infoValue: utils.infoValue,
      warn: utils.warn,
      error: utils.error
    }
  })
}

function runReporters({ specs, type }) {
  return Promise.resolve()
  .then(() =>
    [].concat(config.get("reporters"))
    .filter(reporter => {
      if (type === "result") {
        if (!Object.prototype.hasOwnProperty.call(reporter, "type")) {
          return true
        }
        return reporter.type === "result"
      }
      return reporter.type === "test"
    })
  )
  .then(reporterConfigs => mapSeries(
    reporterConfigs,
    reporterConfig => runSingleReporter({ specs, reporterConfig, type })
  ))
}

module.exports = runReporters
