
 package main

 import (
	 "fmt"
  	// "time"
	 // "reflect"
	// "bytes"
	//  "encoding/json"
	//  "strconv"
	 "github.com/hyperledger/fabric/core/chaincode/shim"
	 "github.com/hyperledger/fabric/protos/peer"
 )
 

 
 	/********************************************************
	 상태값
	 Succcess - 운전자와 화물 의뢰자 간 계약이 채결이 된 상태
	 FAIL - 화물 계약이 취소 및 파토?
     Yet - 운전자와 화물 의뢰자 간 계약이 채결이 되기 전 상태
	 COMPLETE - 화물 이송이 끝나고 계약이 완료됨
	**********************************************************/
 const (
	 NOT_USED string = "NotUsed"
	 USED string = "Used"
 )

 const (
	FULL string = "Full"
	HALF string = "Half"
)
 
 // SmartContract implements a simple chaincode to manage an asset
 type SmartContract struct {
 }

 	/********************************************************
	  화물 계약
	  화물계약은 CARGO + YYYYMMDD 형식이 키이다
 	  
	  TxId - 트랜젝션 ID, 화물 계약이 등록될 시 생성
	   Weight - 화물 무게
	   Distance - 거리
	   Money - 의뢰 금액
		Date - 의뢰 일
		Registrant - 화물 의뢰자
		Driver - 화물 운송업자
		Status - 계약 상태
	**********************************************************/
type BloodCard struct {
	ObjectType string `json:"docType"`
	// Key string `json:"Key"`
	Owner string `json:"Owner"`
	Date string `json:"Date"`
	BloodType string `json:"BloodType"`
	Used string `json:"Used"`
	Org string `json:"Org"`
 }

//  type marble struct {
// 	ObjectType string `json:"docType"` //docType is used to distinguish the various types of objects in state database
// 	Name       string `json:"name"`    //the fieldtags are needed to keep case from bouncing around
// 	Color      string `json:"color"`
// 	Size       int    `json:"size"`
// 	Owner      string `json:"owner"`
// }

 var logger = shim.NewLogger("bloodcard_cc0")
 
 // Init is called during chaincode instantiation to initialize any
 // data. Note that chaincode upgrade also calls this function to reset
 // or to migrate data.
 func (t *SmartContract) Init(stub shim.ChaincodeStubInterface) peer.Response {
	 logger.Info("########### bloodcard_cc0 Init ###########")

	 return shim.Success(nil)
 }
 
 // Invoke is called per transaction on the chaincode. Each transaction is
 // either a 'get' or a 'set' on the asset created by Init function. The Set
 // method may create a new asset by specifying a new key-value pair.
 func (t *SmartContract) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	 logger.Info("########### bloodcard_cc0 Invoke ###########")
	 // Extract the function and args from the transaction proposal
	 fn, args := stub.GetFunctionAndParameters()
 
	 logger.Info(stub.GetTxID())
	 logger.Info(stub.GetChannelID())
 

	 switch method := fn; method {
		 case "initLedger":
			 return t.initLedger(stub)
		case "createNewCard":
			return t.createNewCard(stub, args)
		 case "useCard":
			 return t.useCard(stub, args)
		case "donateCard":
			return t.donateCard(stub, args)
		case "getHistory":
			return t.getHistory(stub, args)
		case "queryCardBySomething":
			return t.queryCardBySomething(stub, args)
		case "queryCardAll":
			return t.queryCardAll(stub, args)
		// case "queryCardByDate":
		// 	return t.queryCardByDate(stub, args)
		// case "queryCardByOwner":
		// 	return t.queryCardByOwner(stub, args)
		 default :
		 	  fmt.Println("invoke did not find func: " + fn) //error
		      return shim.Success([]byte(nil))
	 }

 }


 	/********************************************************
	 체인코드 실행 시 실행되는 초기 데이터 셋
	 docker-compose에 정의됨
	 blood에 관련된 데이터 셋 정의
	**********************************************************/
 func (t *SmartContract) initLedger(stub shim.ChaincodeStubInterface) peer.Response {

	// Key string `json:"Key"`
	// Owner string `json:"Owner"`
	// Date string `json:"Date"`
	// BloodType string `json:BloodType`
	// Used string `json:"Used"`
	// Org string `json:Org`
	// today := time.Date(
    //     2018, 8, 16, 0, 0, 0, 0, time.UTC)
    
	// todayYMD := today.Format("2006-01-02")
	// cards := []BloodCard{
	// 	BloodCard{Key : "Key1", Owner : "Id1",  Date: todayYMD, BloodType: HALF, Used: USED, Org: "seoul"},
	// 	BloodCard{Key : "Key2", Owner : "Id2", Date: todayYMD, BloodType: FULL, Used: NOT_USED, Org: "seoul"},
	// 	BloodCard{Key : "Key3", Owner : "Id3", Date: todayYMD, BloodType: HALF,Used: NOT_USED, Org: "seoul"},
	// 	BloodCard{Key : "Key4", Owner : "Id4",  Date: todayYMD, BloodType: HALF, Used: USED, Org: "seoul1"},
	// 	BloodCard{Key : "Key5", Owner : "Id5", Date: todayYMD, BloodType: FULL, Used: NOT_USED, Org: "seoul1"},
	// 	BloodCard{Key : "Key6", Owner : "Id6", Date: todayYMD, BloodType: HALF,Used: NOT_USED, Org: "seoul1"},
	// }
	//  cardsAsBytes, _ := json.Marshal(cards)

	//  stub.PutState("CARD_"+"TEST_HASH" , cardsAsBytes)
	

	return shim.Success(nil)
 }
 


 // main function starts up the chaincode in the container during instantiate
 func main() {
	 if err := shim.Start(new(SmartContract)); err != nil {
		 fmt.Printf("Error starting SmartContract chaincode: %s", err)
	 }
 }
 