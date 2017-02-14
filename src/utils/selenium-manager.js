const fs = require("fs-extra")
const spawn = require("child_process").spawn

const utils = require("./utils")
const config = require("./../models/config")

const wm = require.resolve("webdriver-manager")

class SeleniumManager {
  constructor() {
    this.seleniumLog = config.get("logs.selenium")
  }

  writeLog(str) {
    fs.appendFile(this.seleniumLog, str)
  }

  start() {
    utils.info("Starting Selenium")

    fs.ensureFileSync(this.seleniumLog)

    this.wdmProcess = spawn("node", [wm, "start"])

    this.wdmProcess.stdout.on("data", data => {
      this.writeLog(data)
    })

    this.wdmProcess.stderr.on("data", data => {
      this.writeLog(data)
    })

    this.wdmProcess.on("close", code => {
      this.writeLog(`Selenium Process closed with code ${code}\n`)
    })

    this.wdmProcess.on("exited", code => {
      this.writeLog(`Selenium Process exited with code ${code}\n`)
    })
  }

  close() {
    utils.info("Closing Selenium")
    this.writeLog("Closing Selenium\n")
    const shutdownProcess = spawn("node", [wm, "shutdown"])
    setTimeout(() => {
      this.writeLog("Killing rogue processes\n")
      this.wdmProcess.kill()
      shutdownProcess.kill()
    }, 1000)
  }

  update() {
    const wdmProcess = spawn("node", [wm, "update"])

    process.on("SIGINT", () => {
      wdmProcess.kill()
    })

    wdmProcess.stdout.on("data", data => {
      utils.log(data.toString().replace(/\n$/gm, ""))
    })

    wdmProcess.stderr.on("data", data => {
      utils.log(data.toString().replace(/\n$/gm, ""))
    })

    wdmProcess.on("close", code => {
      if (code) {
        utils.error("\nSomething went wrong when updating Selenium\n")
      } else {
        utils.info("\nSelenium and WebDrivers are updated!\n")
      }
    })
  }

}

module.exports = SeleniumManager
