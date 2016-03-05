//VALIDATE INITIAL PARAMETERS
  validateInitialParams = function() {

    var inputElems = {
                       timeToExpiryCheckbox:  "time-to-expiry-checkbox",
                       dividendYieldCheckbox: "dividend-yield-checkbox",
                       riskFreeRateCheckbox:  "risk-free-rate-checkbox",
                       feesField:             "fees-field",
                       currentPriceField:     "current-price-field",
                       numLegsDropdown:       "num-legs-dropdown",
                       continueButton1:       "continue-button-1",
                     },

        inputConditions = {
                            feesField:         (__select(inputElems.feesField).value != "" && __select(inputElems.feesField).value >= 0),
                            currentPriceField: (__select(inputElems.currentPriceField).value != "" && __select(inputElems.currentPriceField).value > 0),
                          };


    if(inputConditions.currentPriceField && inputConditions.feesField) {

      //CAPTURE INITIAL USER-DEFINED PARAMETERS
        globalParams.fees         = Math.round(__select("fees-field").value*100)/100;
        globalParams.currentPrice = Math.round(__select("current-price-field").value*100)/100;
        globalParams.numLegs      = Math.round(__select("num-legs-dropdown").value*1)/1;

      //DISABLE INPUT ELEMENTS ON 'CONTINUE' CLICK
        elementAvail(inputElems, false);

      //NEW ELEMENTS NEEDED TO SPECIFY ADDITIONAL PARAMETERS
        validateFinalParams();

    } else {

      //SOME INPUT ERROR MESSAGE HANDLING
        if(!inputConditions.feesField) {

          __select(inputElems.feesField).style.borderColor = '#ff0000';
            alert("Please enter a valid number string greater than or equal to 0 for the total commissions and fees per contract.");
          __select(inputElems.feesField).style.borderColor = '#f5f5f5';

          return;
        };

        if(!inputConditions.currentPriceField) {

          __select(inputElems.currentPriceField).style.borderColor = '#ff0000';
            alert("Please enter a valid number string greater than 0 for the current price of the underlying asset.");
          __select(inputElems.currentPriceField).style.borderColor = '#f5f5f5';

          return;
        };
    };
  };


//VALIDATE FINAL PARAMETERS
  validateFinalParams = function() {

    __element({tag: "div", attributes: {id: "more-params-container"}}, "user-params-container");


    for(var i=0; i<globalParams.numLegs; i++) {

      __element({tag: "div", attributes: {id: "leg-"+(i+1), class: "trade-leg"}}, "more-params-container");

        __element({tag: "span", content: "This is a test.", attributes: {}}, "leg-"+(i+1));
    };


    elementAnim.ease("in", "more-params-container", 10, 0.5, 16);

    console.log(globalParams);
  };

