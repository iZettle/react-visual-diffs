const path = require("path")

const local = subPath => path.resolve(__dirname, subPath)

module.exports = {
  lint: {
    files: local("src/**/*.js")
  },
  test: {
    files: local("src/**/*test.js")
  }
}
