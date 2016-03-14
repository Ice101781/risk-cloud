//VALIDATE INITIAL PARAMETERS
validateInitialParams = function() {

    var initialInputs = {

          feesField: "fees-field",

          timeToExpiryCheckbox: "time-to-expiry-checkbox", dividendYieldCheckbox: "dividend-yield-checkbox", riskFreeRateCheckbox: "risk-free-rate-checkbox",

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

      //SOME INPUT ERROR MESSAGE HANDLING
        if(!initialConditions.feesField) {

          __select(initialInputs.feesField).style.borderColor = '#ff0000';
            alert("Please enter a valid number string greater than or equal to 0 for the total commissions and fees per contract.");
          __select(initialInputs.feesField).style.borderColor = '#d8d8d8';
          return;
        };
    };
};


//CREATE FINAL PARAMETERS
createFinalParams = function() {

    //CREATE A CONTAINER FOR THE FINAL PARAMETERS
      __element({tag: "div", attributes: {id: "final-params-container"}}, "user-params-container");


      //CREATE A CONTAINER FOR THE TRADE LEGS
        __element({tag: "div", attributes: {id: "trade-legs-params-container"}}, "final-params-container");


      //CREATE USER-SPECIFIED NUMBER OF TRADE LEG CONTAINERS, ADD CHILD FORM ELEMENTS
        for(var i=0; i<globalParams.tradeLegs; i++) {

          __element({tag: "div", attributes: {id: "leg-"+(i+1), class: "trade-leg"}}, "trade-legs-params-container");
         
          //BUY/SELL RADIO
            __element({tag: "form", attributes: {id: "buy-sell-form-"+(i+1), class: "buy-sell-form"}}, "leg-"+(i+1));

              //BUY
              __element({tag: "input", attributes: {
                                         type:  "radio",
                                         id:    "buy-radio-"+(i+1),
                                         name:  "buy-sell-radio-"+(i+1),
                                         value: "1",
                                       }},
                                       "buy-sell-form-"+(i+1));

                __element({tag: "label", content: "Buy", attributes: {"for": "buy-radio-"+(i+1), class: "radio buy-sell"}}, "buy-sell-form-"+(i+1));

              //SELL
              __element({tag: "input", attributes: {
                                         type:  "radio",
                                         id:    "sell-radio-"+(i+1),
                                         name:  "buy-sell-radio-"+(i+1),
                                         value: "-1",
                                       }},
                                       "buy-sell-form-"+(i+1));

                __element({tag: "label", content: "Sell", attributes: {"for": "sell-radio-"+(i+1), class: "radio buy-sell"}}, "buy-sell-form-"+(i+1));

            //SOME DEFAULT SETTINGS SO COMMON OPTION SPREADS LIKE 'VERTICALS' TAKE LESS TIME TO SET UP 
            if(i % 2 != 0) { __select("buy-radio-"+(i+1)).setAttribute("checked", "") } else { __select("sell-radio-"+(i+1)).setAttribute("checked", "") };


          //NUMBER OF CONTRACTS FIELD
            __element({tag: "form", attributes: {id: "num-contracts-form-"+(i+1), class: "num-contracts-form"}}, "leg-"+(i+1));

              __element({tag: "input", attributes: {
                                         type:  "number",
                                         id:    "num-contracts-field-"+(i+1),
                                         class: "num-contracts-field",
                                         min:   "1",
                                         step:  "1",
                                         value: "1",
                                       }},
                                       "num-contracts-form-"+(i+1));


          //CALL/PUT RADIO
            __element({tag: "form", attributes: {id: "call-put-form-"+(i+1), class: "call-put-form"}}, "leg-"+(i+1));

              //CALL
              __element({tag: "input", attributes: {
                                         type:  "radio",
                                         id:    "call-radio-"+(i+1),
                                         name:  "call-put-radio-"+(i+1),
                                         value: "1",
                                       }},
                                       "call-put-form-"+(i+1));

                __element({tag: "label", content: "Call", attributes: {"for": "call-radio-"+(i+1), class: "radio call-put"}}, "call-put-form-"+(i+1));

              //PUT
              __element({tag: "input", attributes: {
                                         type:  "radio",
                                         id:    "put-radio-"+(i+1),
                                         name:  "call-put-radio-"+(i+1),
                                         value: "-1",
                                       }},
                                       "call-put-form-"+(i+1));

                __element({tag: "label", content: "Put", attributes: {"for": "put-radio-"+(i+1), class: "radio call-put"}}, "call-put-form-"+(i+1));

            //SOME MORE DEFAULT SETTINGS TO SAVE TIME DURING TRADE SET-UP 
            if(i < 2) { __select("call-radio-"+(i+1)).setAttribute("checked", "") } else { __select("put-radio-"+(i+1)).setAttribute("checked", "") };
        };


      //CREATE A CONTAINER FOR THE CURRENT PRICE OF THE UNDERLYING ASSET
        __element({tag: "form", attributes: {id: "current-price-form"}}, "final-params-container");

          __element({tag: "div", content: "Current price of the underlying asset :", attributes: {class: "align-helper"}}, "current-price-form");

          __element({tag: "input", attributes: {
                                     type:        "number",
                                     id:          "current-price-field",
                                     min:         ".01",
                                     step:        ".01",
                                     value:       "100",
                                     placeholder: "Ex:  432.10",
                                     onblur:      "this.placeholder='Ex:  5432.10'",
                                     onfocus:     "this.placeholder=''"
                                   }},
                                   "current-price-form");


    //EASE ANIMATIONS
      elementAnim.ease("in", "final-params-container", 10, 0.25, 22.5, function() { elementAnim.ease("out", "initial-params-container", 5, 0.1, 9) });



    //TO BE PLACED INSIDE THE 'VALIDATE FINAL PARAMS' FUNCTION

    var finalInputs = {

          buySellRadios: Object.stringPopulate(globalParams.tradeLegs, ["buy-radio-", "sell-radio-"]),

          numContractsFields: Object.stringPopulate(globalParams.tradeLegs, ["num-contracts-field-"]),

          callPutRadios: Object.stringPopulate(globalParams.tradeLegs, ["call-radio-", "put-radio-"]),

          currentPriceField: "current-price-field",
        },

        finalConditions = {

          numContractsField:    (function() {

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

          currentPriceField:    (__select(finalInputs.currentPriceField).value != "" && __select(finalInputs.currentPriceField).value > 0),
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

          __select("num-contracts-field-"+Object.size(finalConditions.numContractsField)).style.borderColor = '#ff0000';
            alert("Please enter a valid whole number string greater than 1 for the number of contracts in this trade leg.");
          __select("num-contracts-field-"+Object.size(finalConditions.numContractsField)).style.borderColor = '#d8d8d8';
          return;
        };

        if(!finalConditions.currentPriceField) {

          __select(finalInputs.currentPriceField).style.borderColor = '#ff0000';
            alert("Please enter a valid number string greater than 0 for the current price of the underlying asset.");
          __select(finalInputs.currentPriceField).style.borderColor = '#d8d8d8';
          return;
        };
    };

    //debug
      console.log(globalParams, finalInputs, finalConditions);

    //END
};
