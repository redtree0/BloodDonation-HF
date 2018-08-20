
var Fabric_Client = require('fabric-client');

var fabric_client = new Fabric_Client();

var path          = require('path');
var os            = require('os');
var store_path = path.join(__dirname, '.hfc-key-store');
// var store_path = path.join(os.homedir(), '.hfc-key-store');

var member_user = null;  
var tx_id = null;

module.exports = (function(){

    const ROOT_DOMAIN = 'grpc://192.168.0.57';
    var helper = {};
    // console.log('Store path:'+store_path);
    var channel = fabric_client.newChannel('mychannel');
    var peer = fabric_client.newPeer(ROOT_DOMAIN+ ':7051');
    channel.addPeer(peer);
    var order = fabric_client.newOrderer(ROOT_DOMAIN+ ':7050')
    channel.addOrderer(order);

    helper.getChaincodeRequest = function(chaincodeId, txId, fnc, chainId, args){
        function IsTypeString(value){
            if(value && (typeof value == "string")){
                return true;
            }else{
                console.error("type not match STRING");
                return false;
            }
        }
        function IsTypeArray(value){
            if(value.constructor === Array){
                return true;
            }else{
                console.error("type not match ARRAY");
                return false;
            }
        }
        if(IsTypeString(chaincodeId) && IsTypeString(fnc) && IsTypeString(chainId)  && IsTypeArray(args)){
            return {
                'chaincodeId': chaincodeId,
                'txId': txId,
                'fcn': fnc,
                'chainId': chainId,
                'args': args
            };
        }else {
            return {};
        }
      
    }

    helper.common = function(user, request, isOnlyQuery){
         
        return helper.getUserContext(user).then((user_from_store) => {
           
            return helper.sendTransaction(user_from_store, request, isOnlyQuery);

        });
    }

    helper.query = function(user, request, userHandler){
        let userid = user;
        let isOnlyQuery = true;
        helper.common(userid, request, isOnlyQuery).then((query_responses) => {
            userHandler(query_responses);
        }).catch((err) => {
            console.error('Failed to query successfully :: ' + err);
        });
    }


    helper.getUserContext = function(user){
        /// return promise
        return Fabric_Client.newDefaultKeyValueStore({ path: store_path})
        .then((state_store) => {

            fabric_client.setStateStore(state_store);
		    var crypto_suite = Fabric_Client.newCryptoSuite();

            var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		    crypto_suite.setCryptoKeyStore(crypto_store);
		    fabric_client.setCryptoSuite(crypto_suite);

            return fabric_client.getUserContext(user, true);
            
        }).catch((err) => {
            console.error('helper getUserContext ->' + err);
        });
    }

    helper.sendTransaction = function(user_from_store, request, isOnlyQuery){
       
        isUserEnrolled(user_from_store);

        console.log("transaction Requert ->>");
        console.log(request); 
        if(isOnlyQuery){
            return channel.queryByChaincode(request);
        }else{
            tx_id = fabric_client.newTransactionID();
            request.txId = tx_id;
            
            return channel.sendTransactionProposal(request);
        }
      
        function isUserEnrolled(){
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded user1 from persistence');
                member_user = user_from_store;
            } else {
                throw new Error('Failed to get user1.... run registerUser.js');
            }
        }

        
    }
   
    helper.transaction = function(user,request, userHandler){
        // var tx_id = null;

        let userid = user;
        let isOnlyQuery = false;
        helper.common(userid, request, isOnlyQuery).then((results) => {
            var proposalResponses = results[0];
            var proposal = results[1];
            let isProposalGood = false;

            if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
                    isProposalGood = true;
                    console.log('Transaction proposal was good');
            } else {
                console.error('Transaction proposal was bad');
            }

            if(isProposalGood){
                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal
                };
          
                return txHandler(request, tx_id, channel, fabric_client);
            }else{
                console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
            }
            
        }).then((results) => {
            return userHandler(results, tx_id);
        }).catch((err) => {
            console.error('Failed to query successfully :: ' + err);
        });

        function txHandler(request, tx_id, channel, fabric_client){
	
			// set the transaction listener and set a timeout of 30 sec
			// if the transaction did not get committed within the timeout period,
			// report a TIMEOUT status
			var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
			var promises = [];
			
			// console.log(request);
			console.log(channel);
			var sendPromise = channel.sendTransaction(request);
			// sendPromise.catch((e)=>{
			// 	console.log(e);
			// })
			promises.push(sendPromise); //we want the send transaction first, so that we know where to check status
			
			// get an eventhub once the fabric client has a user assigned. The user
			// is required bacause the event registration must be signed
			let event_hub = fabric_client.newEventHub();
			event_hub.setPeerAddr(ROOT_DOMAIN+ ':7053');

			// using resolve the promise so that result status may be processed
			// under the then clause rather than having the catch clause process
			// the status
			let txPromise = new Promise((resolve, reject) => {
				let handle = setTimeout(() => {
					event_hub.disconnect();
					resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
				}, 3000);

				event_hub.connect();

				event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
					// this is the callback for transaction event status
					// first some clean up of event listener
					clearTimeout(handle);
					event_hub.unregisterTxEvent(transaction_id_string);
					event_hub.disconnect();

					// now let the application know what happened
					var return_status = {event_status : code, tx_id : transaction_id_string};
					if (code !== 'VALID') {
						console.error('The transaction was invalid, code = ' + code);
						resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
					} else {
						console.log('The transaction has been committed on peer ' + event_hub._ep._endpoint.addr);
						resolve(return_status);
					}
				}, (err) => {
					//this is the callback if something goes wrong with the event registration or processing
					reject(new Error('There was a problem with the eventhub ::'+err));
				});
			});
			promises.push(txPromise);
			console.log(promises);
			return Promise.all(promises);
		
	    }
    }

    return helper;
});
