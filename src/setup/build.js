const deepAssign = require("deep-assign")
const path = require("path")
const webpack = require("webpack")
const utils = require("./../utils/utils")
const config = require("./../models/config")

function modifyWebpackConfig(webpackConfig) {
  const out = deepAssign({}, webpackConfig)
  out.output = out.output || {}
  out.output.path = config.get("temp.build.path")
  out.output.libraryTarget = "var"
  out.output.library = "vtest"

  out.externals = out.externals || {}
  out.externals.react = "React"
  out.externals["react-dom"] = "ReactDOM"

  out.entry = out.entry || {}
  out.entry.main = [].concat(config.get("build.webpackEntryMain", []))
  out.entry.main.push(config.get("temp.build.testIndex"))

  return Promise.resolve(out)
}

function runWebpack(webpackConfig) {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig).run((err, stats) => {
      if (err) {
        reject(err)
      }
      const output = stats.toString(config.get("build.webpackLog"))
      if (output) {
        utils.log(output)
      }
      resolve()
    })
  })
}

function modifyAndRunWebpack() {
  utils.info("Building with Webpack")

  // eslint-disable-next-line global-require
  const webpackConfig = require(path.join(process.cwd(), config.get("build.webpackConfig")))
  return modifyWebpackConfig(webpackConfig)
    .then(runWebpack)
}

module.exports = modifyAndRunWebpack
