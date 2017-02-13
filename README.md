### CLI Args

```
-h, --help                          output usage information
-V, --version                       output the version number
-c, --config <path>                 set path to config file
-t, --test <test,test>              test(s) to run
-p, --reporter <reporter,reporter>  reporters(s) to run, e.g. 'console'
-b, --browser <browser,browser>     browser(s) to run, e.g. 'chrome'
-r, --resolution <res,res>          resolution(s) to run, e.g. '1200x800'
```    

### Webpack config

Your Webpack config (set in `build.webpackConfig`) is left intact with a few exceptions. The config is modified for the VTester to be able to do its job. This is what's merged into your Webpack config

```
{
  entry: {
    main: [
      CONFIG.build.webpackEntryMain,
      CONFIG.temp.build.testIndex
    ]
  },

  output: {
    path: CONFIG.temp.build.path,
    libraryTarget: "var",
    library: "reactComponents"
  },

  externals: {
    react: "React",
    "react-dom": "ReactDOM"
  }
}
```


### Prop files


* Either a Javascript file with an export or a JSON file.
* Can be a single export of props or an array of props
* No matter if it's a single collection of props or an array of collections, the prop `vTestName` _may_ be added which can be used by reporters to create a friendly name for this component variant (it will _not_ be passed on as props to the component).

`.js`

```
function hello() {
  return "Hello from Javascript invoked function"
}

module.exports = {
  vTestName: "Hello from JS",
  helloMsg: hello()
}
```

`.json`

```
[{
    "helloMsg": "Hi!"
}, {
    "vTestName": "Longer Hello Message",
    "helloMsg": "Oh, hello there dear human being"
}]
```

