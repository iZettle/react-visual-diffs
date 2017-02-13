let TESTS

function set(tests) {
  TESTS = [...tests]
  return TESTS
}

function get() {
  return TESTS
}

module.exports = {
  set,
  get
}
