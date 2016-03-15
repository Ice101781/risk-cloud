//VALIDATE INITIAL PARAMETERS
validateInitialParams = function() {

  var initialInputs = {

                    feesField: "fees-field",

         timeToExpiryCheckbox: "time-to-expiry-checkbox", 
        dividendYieldCheckbox: "dividend-yield-checkbox", 
         riskFreeRateCheckbox: "risk-free-rate-checkbox",

                numLegsRadios: Object.stringPopulate(4, ["num-legs-radio-"]),

              continueButton1: "continue-button-1",
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
    for(var i=0; i<globalParams.tradeLegs; i++) {__element({tag: "div", attributes: {id: "leg-"+(i+1), class: "trade-leg"}}, "trade-legs-params-container")};

      //BUY-SELL RADIOS
        twoWayRadio( [["buy","1"],["sell","-1"]], "(i % 2 == 0)" );

      //CALL-PUT RADIOS
        twoWayRadio( [["call","1"],["put","-1"]], "(i < 2)" );

      //NUMBER OF CONTRACTS FIELDS
        for(var i=0; i<globalParams.tradeLegs; i++) {
            
          __element({tag: "form", content: "No. of contracts :", attributes: {id: "num-contracts-form-"+(i+1), class: "num-contracts-form"}}, "leg-"+(i+1));

          __element({tag: "input", attributes: {
                                     type:  "number",
                                     id:    "num-contracts-field-"+(i+1),
                                     class: "num-contracts-field",
                                     min:   "1",
                                     step:  "1",
                                     value: "1",
                                   }},
                                   "num-contracts-form-"+(i+1));
        };


  //EASE ANIMATIONS
    elementAnim.ease("in", "final-params-container", 5, 0.25, 22.5, function() { elementAnim.ease("out", "initial-params-container", 2.5, 0.1, 9) });
};


//VALIDATE FINAL PARAMETERS
validateFinalParams = function() {
    
    var finalInputs = {

               buySellRadios: Object.stringPopulate(globalParams.tradeLegs, ["buy-radio-", "sell-radio-"]),

          numContractsFields: Object.stringPopulate(globalParams.tradeLegs, ["num-contracts-field-"]),

               callPutRadios: Object.stringPopulate(globalParams.tradeLegs, ["call-radio-", "put-radio-"]),

           currentPriceField: "current-price-field",
        },

        finalConditions = {

           numContractsField: (function() {

                                var numContractsField = {};

                                for(var i=0; i<globalParams.tradeLegs; i++) {

                                  numContractsField[(i+1)] = (
                                      __select("num-contracts-field-"+(i+1)).value != "" 
                                    &&__select("num-contracts-field-"+(i+1)).value >= 1
                                    &&__select("num-contracts-field-"+(i+1)).value == Math.floor(__select("num-contracts-field-"+(i+1)).value)
                                  );

                                  if(!numContractsField[(i+1)]) { return numContractsField };
                                };

                                return numContractsField;
                              })(),

           currentPriceField: (__select(finalInputs.currentPriceField).value != "" && __select(finalInputs.currentPriceField).value > 0),
        };


    if( finalConditions.numContractsField[Object.size(finalConditions.numContractsField)] &&
        finalConditions.currentPriceField ) {

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
