var express = require('express');
var router = express.Router();
var QRCode = require('qrcode')


//SPDX-License-Identifier: Apache-2.0

var controller = require('../controller.js');


router.get('/qrcode/:owner', function(req, res, next) {
  var obj = {
    'Owner' : req.params.owner,
    'BloodType' : 'Full',
    'Org' : 'daejon'
  }
  var tmp = JSON.stringify(obj)
  QRCode.toDataURL(tmp, function (err, url) {
    // console.log(url)
    res.status(200).send({'data' : tmp ,'qrcode' : url});
  })
});

// router.get('/', function(req, res){
  
//   req.session.userid="user1";
//   console.log(req.session);
//   res.json({});
// });

router.get('/card/all', function(req, res){
  controller.queryCardAll(req, res);
});

router.get('/card/owner/:val', function(req, res){
  controller.queryCardByOwner(req, res);
});

router.get('/card/date/:val', function(req, res){
  controller.queryCardByDate(req, res);
});

router.get('/card/bloodType/:val', function(req, res){
  controller.queryCardByBloodType(req, res);
});

router.get('/history/:id', function(req, res){
  controller.getHistoryCard(req, res);
});

// router.get('/card/:id', function(req, res){
//   console.log("req.session.userid");
//   console.log(req.session);
//   console.log(req.session.userid);
//   //check session
//   // var sess=req.session;
//   // if(sess.userid){
//   // controller.get_cargo(req, res);
//   // }else{
//   //  var response={
// 	//    result:"fail",
// 	//    value:"login please"
//   //  };
//   //  console.log("request fail - login please");
//   //  res.json(response);
//   // }
//   controller.queryCard(req, res);
// });

router.post('/createCard', function(req, res){
  //check session
  controller.createCard(req, res);

  // var sess=req.session;
  // if(sess.userid){
  // controller.add_cargo(req, res);
  // }else{
  //  var response={
	//    result:"fail",
	//    value:"login please"
  //  };
  //  console.log("request fail - login please");
  //  res.json(response);
  // }
});


router.post('/useCard', function(req, res){
//   //check session
//   var sess=req.session;
//   if(sess.userid){
  controller.useCard(req, res);
//   }else{
//    var response={
// 	   result:"fail",
// 	   value:"login please"
//    };
//    console.log("request fail - login please");
//    res.json(response);
  // }

});


router.post('/donateCard', function(req, res){
  //   //check session
  //   var sess=req.session;
  //   if(sess.userid){
    controller.donateCard(req, res);
  //   }else{
  //    var response={
  // 	   result:"fail",
  // 	   value:"login please"
  //    };
  //    console.log("request fail - login please");
  //    res.json(response);
    // }
  
  });

// /* GET home page. */

// router.get('/get_point/', function(req, res){
//   //check session
//   var sess=req.session;
//   if(sess.userid){
//   controller.get_point(req, res);
//    }else{
//    var response={
// 	   result:"fail",
// 	   value:"login please"
//    };
//    console.log("request fail - login please");
//    res.json(response);
//   }
// });


// router.post('/subtract_point', function(req, res){
//   //check session
//   var sess=req.session;
//   if(sess.userid){
//   controller.subtract_point(req, res);
//    }else{
//    var response={
// 	   result:"fail",
// 	   value:"login please"
//    };
//    console.log("request fail - login please");
//    res.json(response);
//   }
// });

// router.post('/add_point', function(req, res){
//   //check session
//   var sess=req.session;
//   if(sess.userid){
//   controller.add_point(req, res);
//    }else{
//    var response={
// 	   result:"fail",
// 	   value:"login please"
//    };
//    console.log("request fail - login please");
//    res.json(response);
//   }
// });

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.userid="user1";
  res.render('index');
});

router.get('/login',(req, res, next) => {
  res.render('login');
});


module.exports = router;
