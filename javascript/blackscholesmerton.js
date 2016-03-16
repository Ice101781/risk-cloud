//VALIDATE INITIAL PARAMETERS
validateInitialParams = function() {

  var 
  initialInputs = {

    feesField:             "fees-field",
    timeToExpiryCheckbox:  "time-to-expiry-checkbox",
    dividendYieldCheckbox: "dividend-yield-checkbox",
    riskFreeRateCheckbox:  "risk-free-rate-checkbox",
    numLegsRadios:         stringPopulate(4, ["num-legs-radio"]),
    continueButton1:       "continue-button-1",
  },

  initialConditions = {

    feesField: (__select(initialInputs.feesField).value != "" && __select(initialInputs.feesField).value >= 0),
  };


  if(initialConditions.feesField) {

    //CAPTURE INITIAL USER-DEFINED PARAMETERS
      globalParams.contractFees = Math.round(__select("fees-field").value*100)/100;
      globalParams.tradeLegs    = Math.round(__select("input[name=num-legs-radio]:checked").value*1)/1;

    //DISABLE INITIAL INPUT ELEMENTS
      elementAvail(initialInputs, false);

    //DYNAMICALLY CREATE ELEMENTS NEEDED TO SPECIFY ADDITIONAL PARAMETERS
      createFinalParams();

  } else {

    inputErrorMsg(initialInputs.feesField, "Please enter 0 or a positive number for the total commissions and fees.");
  };
};


//CREATE FINAL PARAMETERS
createFinalParams = function() {

  //CREATE USER-SPECIFIED NUMBER OF TRADE LEG CONTAINERS, ADD CHILD FORM ELEMENTS
    for(var i=0; i<globalParams.tradeLegs; i++) {

      __element({tag: "div", attributes: {id: "leg-"+(i+1), class: "trade-leg"}}, "trade-legs-params-container");

      //formatting sub-containers
        __element({tag: "div", attributes: {id: "leg-sub-container-"+"1-"+(i+1), class: "leg-sub-container"}}, "leg-"+(i+1));
    };

      //BUY-SELL RADIOS
        twoWayRadios( [["buy","1"],["sell","-1"]], "(i % 2 == 0)", "leg-sub-container-1-" );
      //CALL-PUT RADIOS
        twoWayRadios( [["call","1"],["put","-1"]], "(i < 2)", "leg-sub-container-1-" );
      //NUMBER OF CONTRACTS FIELDS
        textNumFields("num-contracts", "No. of contracts :", "leg-sub-container-1-");


  //TRANSITION
    elementAnim.ease("out", "initial-params-container", 3.75, 0.09, 9, function() {elementAnim.ease("in", "final-params-container", 8, 0.25, 24)} );
};


//VALIDATE FINAL PARAMETERS
validateFinalParams = function() {
    
  var
  finalInputs = {

    buySellRadios:      stringPopulate(globalParams.tradeLegs, ["buy-radio", "sell-radio"]),
    numContractsFields: stringPopulate(globalParams.tradeLegs, ["num-contracts-field"]),
    callPutRadios:      stringPopulate(globalParams.tradeLegs, ["call-radio", "put-radio"]),
    currentPriceField:  "current-price-field",
  },

  finalConditions = {

    numContractsField: classInputCheck(globalParams.tradeLegs, "num-contracts-field", ['!= ""', '>= 1', '== Math.floor(__select(elem+"-"+(i+1)).value)']),
    currentPriceField: (__select(finalInputs.currentPriceField).value != "" && __select(finalInputs.currentPriceField).value > 0),
  };


  if(    finalConditions.numContractsField[Object.size(finalConditions.numContractsField)]
      && finalConditions.currentPriceField ) {

    //CAPTURE FINAL USER-DEFINED PARAMETERS
      for(var i=0; i<globalParams.tradeLegs; i++) {
    
        globalParams.legSigns[(i+1)]     = Math.round(__select("input[name=buy-sell-radio-"+(i+1)+"]:checked").value*1)/1;
        globalParams.numContracts[(i+1)] = Math.round(__select("num-contracts-field-"+(i+1)).value*1)/1;
        globalParams.contractType[(i+1)] = Math.round(__select("input[name=call-put-radio-"+(i+1)+"]:checked").value*1)/1;
      };
      
        globalParams.currentPrice        = Math.round(__select("current-price-field").value*100)/100;

    //DISABLE FINAL INPUT ELEMENTS
      elementAvail(finalInputs, false);

    //CALCULATE AND DISPLAY OUTPUT
      //some function here...      
    
  } else {

    //SOME INPUT ERROR MESSAGE HANDLING
      if(!finalConditions.numContractsField[Object.size(finalConditions.numContractsField)]) {

        inputErrorMsg("num-contracts-field-"+Object.size(finalConditions.numContractsField),
                      "Please enter a whole number greater than or equal to 1 for the number of contracts in this trade leg.");
      };

      if(!finalConditions.currentPriceField) {

        inputErrorMsg(finalInputs.currentPriceField, "Please enter a number greater than 0 for the current price of the underlying asset.");
      };
  };
};
