const mime = require("mime-types")
const http = require("http")
const url = require("url")
const fs = require("fs-extra")
const path = require("path")

const utils = require("./utils")

class WebServer {
  constructor({ servePath }) {
    this.server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url)
      let pathname = path.join(servePath, parsedUrl.pathname)

      fs.exists(pathname, exist => {
        if (!exist) {
          res.statusCode = 404
          res.end(`File ${pathname} not found!`)
          return
        }

        if (fs.statSync(pathname).isDirectory()) {
          pathname += "/index.html"
        }

        fs.readFile(pathname, (err, data) => {
          if (err) {
            res.statusCode = 500
            res.end(`Error getting the file: ${err}.`)
          } else {
            res.setHeader("Content-type", mime.lookup(pathname) || "text/plain")
            res.end(data)
          }
        })
      })
    })
  }

  listen(...args) {
    utils.info(`Starting web server on port ${args[0]}`)
    this.server.listen(...args)
  }

  close() {
    utils.info("Closing web server")
    this.server.close()
  }
}

module.exports = WebServer
