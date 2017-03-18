#TODO 
* Make true styleguide reporter where user can render the different components (which uses the finished build). Also make it so that you can run ONLY the styleguide reporter (and not the screenshotting stuff!)
* Try if instead of scrolling (when taking retina screenshots) - if we can increase the viewport size to the double.
* Figure out a way to be able to name components (not just variants)
* Make it work when used as a dependency
* Replace node-resemble with 
	* https://github.com/oliver-moran/jimp + https://github.com/mapbox/pixelmatch
	* http://rembrandtjs.com/ 
	* https://github.com/peter-mouland/node-resemble-v2

### Nice to have features
* Create `SaveFile` method which is sent to reporters. Refactor reporters to use it
* Validate config against schema
* * Create a helper.js which exports _static_:
	* Lorem Ipsum 
	* Fake users
* Better way of detecting if all resources are loaded before taking screenshot (now just delays for n amount of time)
* Maybe replace Sharp with https://github.com/oliver-moran/jimp 
* Make a better solution for HiDPI screens. Currently it only handles 1x and 2x screens.
* HTML-reporter:
	* Show props in HTML reporter. Eg like here https://klarna.github.io/ui
	* Make better default html template: Inspiration:
		* https://ant.design/docs/react/introduce
		* http://element.eleme.io/#/en-US/component/radio
		* http://devdocs.io/


### Nice to have bugfixes
* When merging configs, you cant merge an array into a non-array default. Remove possibility to define things as both strings and array and only allow arrays in those cases?


### Document

Use GitBook

