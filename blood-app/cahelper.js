
var Fabric_Client = require('fabric-client');
var Fabric_CA_Client = require('fabric-ca-client');

var path = require('path');
var util = require('util');
var os = require('os');

//
var fabric_client=null;
var fabric_ca_client=null;
var admin_user = null;
var member_user = null;
var store_path = path.join(os.homedir(), '.hfc-key-store');


module.exports = (function(){

    var cahelper = {};

    cahelper.registerCaUser = function(id,password,handler,errhandler){
      fabric_client = null;
      fabric_client = new Fabric_Client();
      fabric_ca_client = null;
      return Fabric_Client.newDefaultKeyValueStore({ path: store_path
      }).then((state_store) => {
          // assign the store to the fabric client
          fabric_client.setStateStore(state_store);
          var crypto_suite = Fabric_Client.newCryptoSuite();
          // use the same location for the state store (where the users' certificate are kept)
          // and the crypto store (where the users' keys are kept)
          var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
          crypto_suite.setCryptoKeyStore(crypto_store);
          fabric_client.setCryptoSuite(crypto_suite);

          // be sure to change the http to https when the CA is running TLS enabled
          fabric_ca_client = new Fabric_CA_Client('http://192.168.99.100:7054', null , '', crypto_suite);

          // first check to see if the admin is already enrolled
          return fabric_client.getUserContext('admin', true);
    }).then((user_from_store) => {
        if (user_from_store && user_from_store.isEnrolled()) {
            console.log('Successfully loaded admin from persistence');
            admin_user = user_from_store;
        } else {
            throw new Error('Failed to get admin.... run registerAdmin.js');
        }

        // at this point we should have the admin user
        // first need to register the user with the CA server
        console.log(id+",,,"+password)
        return fabric_ca_client.register({enrollmentID:id,enrollmentSecret:password, affiliation: 'org1.department1',role: 'client',maxEnrollments:9999}, admin_user);
}).then((secret) =>{
  handler();
}).catch((err) => {
  console.log(err);
  errhandler();
});

}//helper.registerUser() _end

cahelper.enrollCaUser = function(id,password,handler,errhandler){
  fabric_client = null;
  fabric_ca_client = null;
  fabric_client = new Fabric_Client();

  return Fabric_Client.newDefaultKeyValueStore({ path: store_path
  }).then((state_store) => {
      // assign the store to the fabric client
      fabric_client.setStateStore(state_store);
      var crypto_suite = Fabric_Client.newCryptoSuite();
      // use the same location for the state store (where the users' certificate are kept)
      // and the crypto store (where the users' keys are kept)
      var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
      crypto_suite.setCryptoKeyStore(crypto_store);
      fabric_client.setCryptoSuite(crypto_suite);
      // be sure to change the http to https when the CA is running TLS enabled
      fabric_ca_client = new Fabric_CA_Client('http://192.168.99.100:7054', null , '',crypto_suite);
  return fabric_ca_client.enroll({enrollmentID: id, enrollmentSecret: password});
}).then(function(enrollment){
  console.log("ca enroll user success")
  return fabric_client.createUser(
     {username: id,
     mspid: 'Org1MSP',
     cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
  });
}).then(function (user){
  var m_user=user;
  handler(m_user);
  return fabric_client.setUserContext(user);
}).then(function (){
  console.log("complete(;)")
}).catch(function (err){
 errhandler(err);
});

}
//enrollcauser
    return cahelper;
});
