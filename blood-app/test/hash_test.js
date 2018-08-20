
const hash = require('js-hash-code');

var str = "test1";

console.log(hash(str,'sha256'));
console.log(hash(str,'sha512'));