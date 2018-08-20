var mysql = require('mysql');
// var connection = mysql.createConnection({
//     host     : 'localhost',
//     user     : 'root',
//     password : '1q2w3e!@#',
//     database : 'blockchain'
// });
var connection = mysql.createConnection({
  host     : 'ec2-52-15-254-236.us-east-2.compute.amazonaws.com',
  user     : 'root',
  password : '1q2w3e!@#',
  database : 'blockchain'
});


connection.connect();

// var sql = 'SELECT * FROM SystemInfo';
// connection.query(sql, function (err, rows, fields) {
//   if (err) console.log(err);
//   console.log('rows', rows); //row는 배열이다.
//   console.log('fields', fields); //fields는 컬럼을 의미한다.
// });


var sql = 'SELECT MAX(idx) FROM SystemInfo';
connection.query(sql, function (err, rows, fields) {
  if (err) console.log(err);
  console.log(rows);
  // var tmp =rows[0]["MAX(idx)"];
  // console.log(tmp); //row는 배열이다.
//   console.log('fields', fields); //fields는 컬럼을 의미한다.
});


connection.end();//접속이 끊긴다.