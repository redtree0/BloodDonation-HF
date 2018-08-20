
 package main

 import (
	 "fmt"
	 "strings"
 	// "time"
	 
     "bytes"
	 "encoding/json"
	//  "strconv"
	 "github.com/hyperledger/fabric/core/chaincode/shim"
	 "github.com/hyperledger/fabric/protos/peer"
 )

//  const (
// 	NOT_USED string = "NotUsed"
// 	USED string = "Used"
// )
const STUB = "CARD_"
 	/********************************************************
	 args[0] - 날짜 YYYYMMDD
	 특정 화물 계약을 조회하는 메소트
	**********************************************************/
//peer chaincode query -n cargo-app -c '{"Args":["queryCargo", "CARGOS20180606"]}' -C mychannel
 func (s *SmartContract) queryCard(stub shim.ChaincodeStubInterface, args []string) peer.Response {
 
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}


	cardsAsBytes, _ := stub.GetState(STUB + args[0])
	// cargoAsBytes, _ := stub.GetState(args[0])
	if cardsAsBytes == nil {
		return shim.Error("Could not locate card")
	}
	return shim.Success(cardsAsBytes)
}
 

 	/********************************************************
	 args[0] - "all"
	 화물 계약을 전체 조회하는 메소트
	**********************************************************/
//peer chaincode query -n cargo-app -c '{"Args":["queryAllCargo"]}' -C mychannel
// peer chaincode query -n cargo-app -c '{"Args":["queryAllCargo", "all"]}' -C mychannel
 func  (t *SmartContract) queryCardAll(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	// if len(args) < 2 {
	// 	return shim.Error("Incorrect number of arguments. Expecting 2")
	// }

	startKey := STUB + "0"
	endKey := STUB + "99999999"
	// startKey := args[0]
	// endKey := args[1]

	resultsIterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getMarblesByRange queryResult:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())

 }
 

 	/********************************************************
	 args[0] - key 날짜 YYYYMMDD
	 args[1] - 이전 txId
	 args[2] - 상태값 Success, Complete, Yet, Fail
	 화물 계약을 등록하는 메소드
	**********************************************************/
	// peer chaincode invoke -C mychannel -n blood-app -c '{"Args":["createNewCard","4", "test1", "2018-08-19", "Full", "sesoul"]}'
 func (t *SmartContract) createNewCard(stub shim.ChaincodeStubInterface, args []string) peer.Response {
 
	 if len(args) != 5 {
		 return shim.Error("Incorrect number of arguments. Expecting 8")
	 }

	key := STUB+args[0]
	// ==== Check if marble already exists ====
	cardAsbytes, err := stub.GetState(key)
	if err != nil {
		return shim.Error("Failed to get marble: " + err.Error())
	} else if cardAsbytes != nil {
		fmt.Println("This marble already exists: " + key)
		return shim.Error("This marble already exists: " + key)
	}


	objectType := "card"
	owner := args[1]
	date := args[2]
	bloodType := args[3]
	used := NOT_USED
	org := args[4]
	// var cargo = CargoContract{TxId : stub.GetTxID(), Weight: w, Distance: d, Money: m, 
	// 	Date: args[4], Registrant : args[5], Driver : args[6], Status : args[7] }
	var card = 	BloodCard{ObjectType : objectType, Owner: owner, Date:  date, BloodType: bloodType, Used: used, Org: org}
	// var card = 	BloodCard{Key : stub.GetTxID(), Owner : args[1], Date: args[2], BloodType: args[2],Used: NOT_USED, Org: args[3]}
	// var cards []BloodCard 	
	// _ = json.Unmarshal( cardAsbytes, &cards )
	// cards = append( cards, card )
  
	// Encode as JSON
	// Put back on the block
	cardJSONasbytes, _ := json.Marshal( card )
	_ = stub.PutState( key, cardJSONasbytes )

	indexName := "owner~date~bloodtype"
	ownerDateBloodtypeIndexKey, err := stub.CreateCompositeKey(indexName, []string{card.Owner, card.Date, card.BloodType })
	if err != nil {
		return shim.Error(err.Error())
	}
	//  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
	//  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
	value := []byte{0x00}
	stub.PutState(ownerDateBloodtypeIndexKey, value)

	return shim.Success(nil)
 }
 
 	/********************************************************
	 args[0] - key 날짜 YYYYMMDD
	 args[1] - 이전 txId
	 args[2] - 상태값 Success, Complete, Yet, Fail
	 화물 계약 상태를 변경하는 메소드
	**********************************************************/
 func (t *SmartContract) useCard(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	 if len(args) != 1 {
		 return shim.Error("Incorrect number of arguments. Expecting 1")
	 }
 

	 key := args[0]
	 cardAsbytes, err := stub.GetState(key)
  
	 if err != nil {
		return shim.Error( "Unable to get card." )
	 }
   
	 var card BloodCard
   
	 // From JSON to data structure
	 _ = json.Unmarshal( cardAsbytes, &card )
	 card.Used = USED;

   
	//  // Look for match
	//  for a := 0; a < len( cards ); a++ {
	//    // Match
	//    if cards[a].Key == args[1] {
	// 		cards[a].Used = USED;
	// 		cards[a].Key =  stub.GetTxID()
	// 	 break
	//    }
	//  }
   
	 // Encode as JSON
	 // Put back on the block
	 inputbytes, err := json.Marshal( card )
	 _ = stub.PutState(key, inputbytes )
	 //fmt.Printf("Query Response:%s\n", bytes)
	 return shim.Success(nil)
 }
 

 func (t *SmartContract) donateCard(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

   key := args[0]
   cardAsbytes, _ := stub.GetState(key)

   if cardAsbytes == nil {
	   return shim.Error("Could not locate card")
   }

   var card BloodCard
   
   // From JSON to data structure
   _ = json.Unmarshal( cardAsbytes, &card )
   card.Owner = args[1];
	// // Look for match
	// var donateCard BloodCard
	// // card := nil
    // // for a := 0; a < len( cards ); a++ {
	// // 	// Match
	// //   	if cards[a].Key == args[1] {
	// // 		// cards[a].Key = stub.GetTxID()
	// // 		donateCard = cards[a]
	// // 		cards = append(cards[:a], cards[a+1:]...)
	// //  	 	break
	// // 	}
	// // }
	
	// bytes, _ := json.Marshal( cards )
	// _ = stub.PutState( key, bytes )

	// ///
	// otherKey := STUB+ args[2]
	// otherCardAsbytes, _ := stub.GetState(otherKey)
	// var otherCards []BloodCard
	// // if(len(other_cards) == 0 ){

	// // }else{
	// 	_ = json.Unmarshal( otherCardAsbytes, &otherCards )
	// 	otherCards = append( otherCards, donateCard )
	// }
	// var cards []BloodCard 	

 
   // Encode as JSON
   // Put back on the block
   inputbytes, _ := json.Marshal( card )
   _ = stub.PutState( key, inputbytes )
   return shim.Success(nil)
}



func (t *SmartContract) getHistory(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	type AuditHistory struct {
		TxId    string   `json:"txId"`
		Value   BloodCard   `json:"value"`
	}
	var history []AuditHistory;
	var card BloodCard

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	// key := STUB+args[0]
	// cardAsbytes, _ := stub.GetState(key)
	// stub.GetHistoryForKey(key)
	key := args[0]
	fmt.Printf("- start getHistoryForMarble: %s\n", key)

	// Get History
	resultsIterator, err := stub.GetHistoryForKey(key)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		historyData, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		var tx AuditHistory
		tx.TxId = historyData.TxId                     //copy transaction id over
		json.Unmarshal(historyData.Value, &card)     //un stringify it aka JSON.parse()
		if historyData.Value == nil {                  //marble has been deleted
			var emptyCard BloodCard
			tx.Value = emptyCard                 //copy nil marble
		} else {
			json.Unmarshal(historyData.Value, &card) //un stringify it aka JSON.parse()
			tx.Value = card                      //copy marble over
		}
		history = append(history, tx)              //add this tx to the list
	}
	fmt.Printf("- getHistoryForMarble returning:\n%s", history)

	//change to array of bytes
	historyAsBytes, _ := json.Marshal(history)     //convert to array of bytes
	return shim.Success(historyAsBytes)

	
}

func (t *SmartContract) queryCardBySomething(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) < 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	selector := strings.ToLower(args[0])
	val := args[1]
	fmt.Printf("-selector:\n%s val :\n%s", selector,val)
	var queryString string
	if selector == "owner"{
		queryString = fmt.Sprintf("{\"selector\":{\"docType\":\"card\",\"Owner\":\"%s\"}}", val)
	}else if selector == "date"{
		queryString = fmt.Sprintf("{\"selector\":{\"docType\":\"card\",\"Date\":\"%s\"}}", val)
	}else if selector == "bloodtype"{
		queryString = fmt.Sprintf("{\"selector\":{\"docType\":\"card\",\"BloodType\":\"%s\"}}", val)
	}else{
		err_msg :=fmt.Sprintf("-selector:\n%s val :\n%s", selector,val)
		return shim.Error(err_msg)
	}
	

	queryResults, err := getQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}



func getQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

	fmt.Printf("- getQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryRecords
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

	return buffer.Bytes(), nil
}
