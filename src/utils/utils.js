const chalk = require("chalk")
const fs = require("fs-extra")

function log(str = "") {
  console.log(str)
}

function info(str = "") {
  console.log(chalk.blue(str))
}

function infoValue(what = "", val = "") {
  console.log(`${chalk.blue(what)}: ${val}`)
}

function warn(str = "") {
  console.log(`${chalk.yellow("WARNING:")} ${str}`)
}

function error(str = "") {
  console.log(`${chalk.red("ERROR:")} ${str}`)
}

function createDir({ path }) {
  return new Promise((resolve, reject) => {
    fs.ensureDir(path, err => {
      if (err) {
        reject()
      } else {
        resolve()
      }
    })
  })
}

module.exports = {
  info,
  log,
  infoValue,
  warn,
  error,
  createDir,
  format: {
    badge: {
      good: chalk.bgGreen.white,
      bad: chalk.bgRed.white
    }
  }
}
