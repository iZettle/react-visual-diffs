const path = require("path")

const tempRoot = path.join(process.cwd(), "temp", "vtest")

module.exports = {
  selenium: {
    /**
     * Whether or not to auto start a Selenium. Set to false
     * to use an external Selenium (defined in host property)
     */
    autostart: true,
    /**
     * If autostart is set to true, the local will be started here,
     * change the host to the external one if autostart is set to false
     */
    host: "http://0.0.0.0:4444/wd/hub"
  },
  /**
   * VTest will start a web server which will serve
   * the React components for the browser(s) to
   * take a screenshot on.
   *
   * Change port if it's clashing with something
   */
  webServer: {
    port: 9002
  },
  files: {
    /**
     * Where to search for components and prop files?
     */
    src: "src/**/*",
    componentFiles: {
      /**
       * Which file extensions do your components have?
       * * Can be string or array
       */
      ext: ["js", "jsx"]
    },
    propFiles: {
      /**
       * Which file extensions do your prop files have?
       * Can be string or array
       */
      ext: ["json", "js"],
      /**
       * What endings do your prop files have?
       * Looking for files e.g: ComponentName.vtest.js
       */
      ending: "vtest"
    }
  },
  temp: {
    /**
     * [ADVANCED]
     * Where to save the screenshots?
     */
    screenshots: {
      new: path.join(tempRoot, "screenshots-new"),
      master: path.join(tempRoot, "screenshots-master"),
      diff: path.join(tempRoot, "screenshots-diff")
    },
    build: {
      /**
       * [ADVANCED]
       * Where to save the output of the Webpack build.
       * This is also the folder which gets served by the web server,
       * and where the browsers are taking the screenshots from.
       */
      path: path.join(tempRoot, "build"),
      /**
       * [ADVANCED]
       * Where to save the test root file. The test root file is a
       * temporary file which exports all components with a propfile and
       * which gets read as the index file of Webpack.
       */
      testIndex: path.join(tempRoot, "test-root", "index.test.js")
    }
  },
  templates: {
    testIndex: {
      /**
       * [ADVANCED]
       * This is the file which will act as the main file for Webpack,
       * and it will contain imports/exports of all React components which
       * are being tested
       */
      index: path.join(__dirname, "test-index.hbs"),

      /**
       * [ADVANCED]
       * This file exports a React component which will wrap the component
       * under test and provide React context to it if needed.
       */
      componentWrapper: path.join(__dirname, "component-wrapper")
    },
    mountingHTML: {
      /**
       * [ADVANCED]
       * This is the file which will be served by the web server and which will
       * render the Webpack bundle.
       * Replace path to a custom version if needed.
       */
      index: path.join(__dirname, "index.hbs"),
      /**
       * Do you want other dependencies to be injected in your index file?
       */
      dependencies: [
        path.join(process.cwd(), "node_modules", "react", "dist", "react.js"),
        path.join(process.cwd(), "node_modules", "react-dom", "dist", "react-dom.js")
      ],
      /**
       * When injecting the dependencies into your index file, which order should
       * they be added in? Any dependencies not in this list will be added in random
       * order after dependencies in this list.
       *
       * Both CSS and JS dependencies can be specified (but js files
       * are included as <script> and CSS files are included as <style> elements)
       */
      dependenciesOrder: [
        "manifest.js",
        "react.js",
        "react-dom.js",
        "main.js"
      ],
      /**
       * [ADVANCED]
       * Where to ReactDom.render()? The element ID must be in your index file.
       */
      renderElement: "root",
      /**
       * [ADVANCED]
       * What to take a screenshot of? Usually the same as renderElement.
       * The element ID must be in your index file (or added by React)
       */
      screenshotElement: "body"
    }
  },
  build: {
    /**
     * What Webpack should be used for compiling your components?
     */
    webpackConfig: "webpack.conf.js",
    /**
     * Note: Webpack main CAN NOT be configured in your Webpack conf as Vtest will
     * overwrite that setting with it's own.
     *
     * However, if you want other things to be added to your Webpack main
     * they can be defined here.
     *
     * Can be array or string.
     */
    webpackEntryMain: ["babel-polyfill"],
    /**
     * Show Webpack log in console?
     *
     * There are a few different logging levels,
     * Can be set to string, e.g. "errors-only" or for more granular
     * control, pass an object, see:
     * https://github.com/webpack/docs/wiki/node.js-api#statstojsonoptions
     */
    webpackLog: "errors-only"
  },
  screenshots: {
    /**
     * Trim whitespace from screenshots?
     */
    trim: true,
    /**
     * When diffing master and new screenshots, how many percents difference
     * should be tolerated?
     */
    diffThreshold: 1,
    /**
     * If VTest is run on a non-retina display, should retina be
     * emulated?
     *
     * Retina master screenshots can be compared against new emulated Retina
     * screenshots. However, non-retina master screenshots CAN NOT be compared
     * against new Retina screenshots. Therefor, when used by multiple users where
     * some are using Retina displays and some are not - emulate Retina!
     */
    emulateRetina: true,

    /**
     * [ADVANCED]
     * When emulating Retina display, the browsers will scroll and take multiple screenshots.
     * This waiting time till 1) Make sure scrolling is done and 2) That any
     * show-on-scroll-scrollbars are hidden before screenshot is taken.
     */
    scrollWait: 1000,

    /**
     * After spinning up a browser and rendered the first component, should
     * it wait for for an amount of time before taking a screenshot and
     * continuing on with the other tests?
     *
     * E.g if you style is using external resources (such as fonts on cdn),
     * then you want to give the browser some time to load those resources. As
     * any subsequent tests are just re-mounting of a React component those resources
     * are already loaded.
     */
    browserFirstTestWait: 3000,
    matrix: {
      /**
       * Which browsers should be used to take screenshots?
       *
       * Can be string or array
       */
      browsers: [
        // "safari",
        "chrome"
      ],
      /**
       * Which screen resolutions should be used to take screenshot
       *
       * Can be array of objects or single object.
       */
      resolutions: [
        { width: 1200, height: 1000 },
        // { width: 600, height: 400 }
      ]
    }
  },
  logs: {
    /**
     * Where to save the Selenium log?
     */
    selenium: "selenium.log"
  },
  /**
   * An array of all reporters you want.
   * vtest-html-reporter, vtest-console-reporter & vtest-json-reporter
   * are bundled with VTests, search NPM for more.
   *
   * Pass an object with the mandatory property "name" which must be the npm package name.
   * You can also pass the npm package name as a simple string.
   *
   * A reporter can be a "test" reporter or a "result" reporter. Test reporters are run each
   * per performed tests and result reporters are run after all tests are completed. If no
   * "type" is specified, "result" is implied.
   */
  reporters: [{
    name: "vtest-console-reporter"
  }, {
    name: "vtest-console-reporter",
    type: "test"
  }, {
    name: "vtest-json-reporter",
    output: path.join(tempRoot, "reports", "report.json"),
    /**
     * Format of the JSON. Can be "grouped" or "flat".
     */
    depth: "flat"
  }, {
    /**
     * NPM name of the reporter
     */
    name: "vtest-html-reporter",
    /**
     * Different reporters have different settings
     *
     * Where to save the HTML report?
     */
    output: path.join(tempRoot, "reports", "report.html")
    /**
     * Change to use your own hHandlebars template
     */
    // template: path.join(process.cwd(), "template.hbs")
  }, {
    name: "vtest-html-reporter",
    output: path.join(tempRoot, "reports", "styleguide.html"),
    template: path.join(
      path.dirname(require.resolve("vtest-html-reporter")),
      "styleguide-html.hbs"
    )
  }],
  /**
   * No store is enabled by default
   * A store is somewhere to store your data, or
   * in other words: Somewhere you can download and
   * upload screenshots to for other users to use.
   */
  store: {
    /**
     * Should master screenshots be downloaded from store before
     * tests are run? This can be overridden with the
     * --download-before argument
     *
     * This also first cleans the master screenshots folder
     */
    downloadBeforeTest: false
    // adapater: {
    //   /**
    //    * NPM name of the store adaptor. The S3 store is
    //    * bundled with vtest
    //    */
    //   name: "vtest-s3-store",
    //
    //   /**
    //    * Different stores have different settings, these are
    //    * the S3 settings.
    //    */
    //   region: "eu-west-1",
    //   accessKey: "1234567890",
    //   secretKey: "abcdefghijklmnopqrstuvwxyz",
    //   bucket: "visual-regression-tests",
    //   remoteDir: "project-1"
    // }
  }
  /**
   * File which will module.exports an object which will be used as React context,
   * see sample reactContext file for example.
   */
  // reactContext: path.join(process.cwd(), vtest.reactContext.js)
}
