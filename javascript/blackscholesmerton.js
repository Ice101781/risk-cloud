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
      globalParams.tradeLegs    = Math.round(__select("input[name=num-legs-radio]:checked").value);

    //DISABLE INITIAL INPUT ELEMENTS
      elementAvail(initialInputs, false);

    //DYNAMICALLY CREATE ELEMENTS NEEDED TO SPECIFY ADDITIONAL PARAMETERS
      createFinalParams(
        elementAnim.transition({id: "initial-params-container", increment: 0.12, height: 9}, {id: "final-params-container", increment: 0.2, height: 28})
      );

  } else {

    inputErrorMsg(initialInputs.feesField, "Please enter 0 or a positive number for the total commissions and fees.");
  };
};


//CREATE FINAL PARAMETERS
createFinalParams = function(callback) {

  //CREATE USER-SPECIFIED NUMBER OF TRADE LEG CONTAINERS, ADD CHILD FORM ELEMENTS
    for(var i=0; i<globalParams.tradeLegs; i++) {

      __element({tag: "div", attributes: {id: "leg-"+(i+1), class: "trade-leg"}}, "trade-legs-params-container");

      //formatting sub-containers
        for(var j=0; j<3; j++) {__element({tag: "div", attributes: {id: "leg-sub-container-"+(j+1)+"-"+(i+1), class: "leg-sub-container"}}, "leg-"+(i+1))};
    };

    //BUY-SELL RADIOS
      twoWayRadios( [["buy","1"],["sell","-1"]], "(i % 2 == 0)", "leg-sub-container-1-" );
    //CALL-PUT RADIOS
      twoWayRadios( [["call","1"],["put","-1"]], "(i < 2)", "leg-sub-container-1-" );
    //NUMBER OF CONTRACTS FIELDS
      textNumFields("num-contracts", "no. of contracts :", {min:"1", step:"1", value:"1"}, "leg-sub-container-1-");

    //RISK-FREE RATES
      textNumFields("risk-free-rate", "risk-free rate % :", {min:"0", step:".01", value:"0.25"}, "leg-sub-container-2-");
    //DIVIDEND % FIELDS
      textNumFields("div-yield", "dividend yield % :", {min:"0", step:".01", value:"0"}, "leg-sub-container-2-");

    //CALENDAR TIME TO EXPIRY
      textNumFields("expiry", "calendar days to expiry :", {min:"0", step:"1", value:"30"}, "leg-sub-container-3-");


  //TRANSITION CALLBACK
    if(typeof callback === 'function') { callback() };
};


//VALIDATE FINAL PARAMETERS
validateFinalParams = function() {
    
  var
  finalInputs = {

    buySellRadios:      stringPopulate(globalParams.tradeLegs, ["buy-radio", "sell-radio"]),
    callPutRadios:      stringPopulate(globalParams.tradeLegs, ["call-radio", "put-radio"]),
    numContractsFields: stringPopulate(globalParams.tradeLegs, ["num-contracts-field"]),
    riskFreeRateFields: stringPopulate(globalParams.tradeLegs, ["risk-free-rate-field"]),
    divYieldFields:     stringPopulate(globalParams.tradeLegs, ["div-yield-field"]),
    expiryFields:       stringPopulate(globalParams.tradeLegs, ["expiry-field"]),
    currentPriceField:  "current-price-field",
  },

  finalConditions = {

    numContractsFields: classInputCheck(globalParams.tradeLegs, "num-contracts-field",  ['>= 1', '== Math.floor(__select(elem+"-"+(i+1)).value)']),
    riskFreeRateFields: classInputCheck(globalParams.tradeLegs, "risk-free-rate-field", ['>= 0', '<= 25']),
    divYieldFields:     classInputCheck(globalParams.tradeLegs, "div-yield-field",      ['>= 0', '<= 100']),
    expiryFields:       classInputCheck(globalParams.tradeLegs, "expiry-field",         ['>= 0', '<= 1000', '== Math.floor(__select(elem+"-"+(i+1)).value)']),
    currentPriceField:  (__select(finalInputs.currentPriceField).value != "" && __select(finalInputs.currentPriceField).value > 0),
  };

  //INPUT VALIDATION
  if(finalConditions.numContractsFields[Object.size(finalConditions.numContractsFields)] &&
     finalConditions.riskFreeRateFields[Object.size(finalConditions.riskFreeRateFields)] &&
     finalConditions.divYieldFields[Object.size(finalConditions.divYieldFields)]         &&
     finalConditions.expiryFields[Object.size(finalConditions.expiryFields)]             &&
     finalConditions.currentPriceField
    ) {

    //CAPTURE FINAL USER-DEFINED PARAMETERS
      for(var i=0; i<globalParams.tradeLegs; i++) {
    
        globalParams.legSigns[(i+1)]     = Math.round(__select("input[name=buy-sell-radio-"+(i+1)+"]:checked").value);
        globalParams.contractType[(i+1)] = Math.round(__select("input[name=call-put-radio-"+(i+1)+"]:checked").value);
        globalParams.numContracts[(i+1)] = Math.round(__select("num-contracts-field-"+(i+1)).value);
        globalParams.riskFreeRate[(i+1)] = Math.round(__select("risk-free-rate-field-"+(i+1)).value*100)/10000;
        globalParams.divYield[(i+1)]     = Math.round(__select("div-yield-field-"+(i+1)).value*100)/10000;
        globalParams.expiry[(i+1)]       = Math.round(__select("expiry-field-"+(i+1)).value)/365;
      };
      
        globalParams.currentPrice        = Math.round(__select("current-price-field").value*100)/100;

      console.log(globalParams, finalConditions);

    //DISABLE FINAL INPUT ELEMENTS
      elementAvail(finalInputs, false);

    //CALCULATE AND DISPLAY OUTPUT
      //some function here...      
    
  } else {

    //SOME INPUT ERROR MESSAGE HANDLING
    switch(false) {

      case finalConditions.numContractsFields[Object.size(finalConditions.numContractsFields)]:
        inputErrorMsg("num-contracts-field-"+Object.size(finalConditions.numContractsFields),
          "Please enter a whole number greater than or equal to 1 for the number of contracts in this trade leg.");
        break;

      case finalConditions.riskFreeRateFields[Object.size(finalConditions.riskFreeRateFields)]:
        inputErrorMsg("risk-free-rate-field-"+Object.size(finalConditions.riskFreeRateFields),
          "Please enter a number greater than or equal to 0, and less than or equal to 25, for the risk-free rate percentage in this trade leg.");
        break;

      case finalConditions.divYieldFields[Object.size(finalConditions.divYieldFields)]:
        inputErrorMsg("div-yield-field-"+Object.size(finalConditions.divYieldFields),
          "Please enter a number greater than or equal to 0, and less than or equal to 100, for the dividend yield percentage in this trade leg.");
        break;

      case finalConditions.expiryFields[Object.size(finalConditions.expiryFields)]:
        inputErrorMsg("expiry-field-"+Object.size(finalConditions.expiryFields),
          "Please enter a whole number greater than or equal to 0, and less than or equal to 1000, for the number of calendar days to expiry "+
          "in this trade leg.");
        break;

      case finalConditions.currentPriceField:
        inputErrorMsg(finalInputs.currentPriceField,
          "Please enter a number greater than 0 for the current price of the underlying asset.");
        break;
    };
  };
};
