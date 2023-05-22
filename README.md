### Motivation

console.log is like REPL, that offers minimum interactive environment before execution

> NOTE: unit of code (source) must be explicitly passed to console.log(source) to be marshalled back through puppeteer instance

### Collect input from console.log to terminal of choice :

> TIP : Open DevTools on browser of choice , type in keyword `void` inside window and freely walk (Ctrl + Enter or Tab: _4 columns space for default Tab_) with cursor in a console window : once ready remove keyword void & press enter to execute or append session with global variables

=== 

```js
/* 
- @https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
- @https://stackoverflow.com/questions/33539797/how-to-create-string-with-multiple-spaces-in-javascript
*/

// both will return the same result
console.log("\xa0\xa0\xa0\xa0>_") /* <= equivalent of single tab (i.e. 4 non-breaking spaces) */
console.log("\t>_")
```