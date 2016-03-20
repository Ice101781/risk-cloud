//VALIDATE INITIAL PARAMETERS
validateInitialParams = function() {

    //string objects containing element id's
    var feesField = "fees-field",
        numLegsRadios = idStringsObject(["num-legs-radio"], 4),
        continueButton1 = "continue-button-1";

    //evaluate text form input conditions
    var feesFieldCond = (select(feesField).value != "" && select(feesField).value >= 0);

    //input validation
    if(feesFieldCond) {

        //capture initial user-defined parameters
        CONTRACT_FEES = Math.round(select("fees-field").value*100)/100;
        TRADE_LEGS = Math.round(select("input[name=num-legs-radio]:checked").value);

        //disable initial input elements
        elementAvail({feesField, numLegsRadios, continueButton1}, false);

        //create elements needed to specify final parameters
        createFinalParams(
            elementAnim.transition(
                        {idString: "initial-params-container", increment: 0.125, height: 6.125},
                        {idString: "final-params-container", increment: 0.2, height: 33}
        ));
    } else {

        inputErrorMsg(feesField, "Please enter 0 or a positive number for the total commissions and fees.");
    }
}


//CREATE FINAL PARAMETERS
createFinalParams = function(callback) {

    //create trade leg containers
    for(var i=0; i<TRADE_LEGS; i++) {

        element({tag: "div", attributes: {id: "leg-"+(i+1), class: "trade-leg"}}, "trade-legs-params-container");

        //sub-containers for animations
        for(var j=0; j<5; j++) {

            element({tag: "div", attributes: {id: "leg-sub-container-"+(j+1)+"-"+(i+1), class: "leg-sub-container"}}, "leg-"+(i+1));

            //hide certain sub-containers according to default params checkbox settings
            if(i>0 && j>0 && j<4) { select("leg-sub-container-"+(j+1)+"-"+(i+1)).style.height = 0 }

            //highlight backgrounds in the first trade leg for default params checkbox settings
            if(i==1 && j>0) { select("leg-sub-container-"+(j+1)+"-1").style.backgroundColor = "#ffdddd" }
        }
    }

    //buy-sell radios
    twoWayRadios( [["buy","1"],["sell","-1"]], "(i % 2 == 0)", "leg-sub-container-1-" );
    //call-put radios
    twoWayRadios( [["call","1"],["put","-1"]], "(i < 2)", "leg-sub-container-1-" );
    //number of contracts fields
    textNumFields("num-contracts", "no. of contracts :", {min:"1", step:"1", value:"1"}, "leg-sub-container-1-");
    //strike prices
    textNumFields("strike-price", "exercise price :", {min:".01", step:".01", value:"100"}, "leg-sub-container-1-");

    //calendar times to expiry
    textNumFields("expiry", "calendar days to expiry :", {min:"0", step:"1", value:"30"}, "leg-sub-container-2-");

    //dividend % fields
    textNumFields("div-yield", "dividend yield % :", {min:"0", step:".01", value:"0"}, "leg-sub-container-3-");

    //risk-free rates
    textNumFields("risk-free-rate", "risk-free rate % :", {min:"0", step:".01", value:"0.25"}, "leg-sub-container-4-");


    //transition animation callback
    if(typeof callback === 'function') { callback() }
}


//VALIDATE FINAL PARAMETERS
validateFinalParams = function() {
  
    //id strings
    var expiryBox = "time-to-expiry-checkbox",
        divYieldBox = "dividend-yield-checkbox",
        riskFreeBox = "risk-free-rate-checkbox",
        buySellRadios = idStringsObject(["buy-radio", "sell-radio"], TRADE_LEGS),
        callPutRadios = idStringsObject(["call-radio", "put-radio"], TRADE_LEGS),
        numContractsFields = idStringsObject(["num-contracts-field"], TRADE_LEGS),
        strikePriceFields = idStringsObject(["strike-price-field"], TRADE_LEGS),
        expiryFields = idStringsObject(["expiry-field"], TRADE_LEGS),
        divYieldFields = idStringsObject(["div-yield-field"], TRADE_LEGS),
        riskFreeFields = idStringsObject(["risk-free-rate-field"], TRADE_LEGS),
        stockPriceField = "current-price-field";

    //evaluate text form input conditions
    var numContractsFieldsCond = classInputCheck("num-contracts-field", TRADE_LEGS, ['>= 1', '== Math.floor(select(elem+"-"+(i+1)).value)']),
        strikePriceFieldsCond = classInputCheck("strike-price-field", TRADE_LEGS, ['> 0']),
        expiryFieldsCond = classInputCheck("expiry-field", TRADE_LEGS, ['>= 0', '<= 1000', '== Math.floor(select(elem+"-"+(i+1)).value)']),
        divYieldFieldsCond = classInputCheck("div-yield-field", TRADE_LEGS, ['>= 0', '<= 100']),
        riskFreeFieldsCond = classInputCheck("risk-free-rate-field", TRADE_LEGS, ['>= 0', '<= 25']),
        stockPriceFieldCond = (select(stockPriceField).value != "" && select(stockPriceField).value > 0);

    //input validation
    if(numContractsFieldsCond[Object.size(numContractsFieldsCond)] &&
       strikePriceFields[Object.size(strikePriceFieldsCond)] &&
       expiryFieldsCond[Object.size(expiryFieldsCond)] &&
       divYieldFieldsCond[Object.size(divYieldFieldsCond)] &&
       riskFreeFieldsCond[Object.size(riskFreeFieldsCond)] &&
       stockPriceFieldCond) {

        //capture user-defined final parameters
        for(var i=0; i<TRADE_LEGS; i++) {

            LEG_SIGN[(i+1)] = Math.round(select("input[name=buy-sell-radio-"+(i+1)+"]:checked").value);
            CONTRACT_TYPE[(i+1)] = Math.round(select("input[name=call-put-radio-"+(i+1)+"]:checked").value);
            NUM_CONTRACTS[(i+1)] = Math.round(select("num-contracts-field-"+(i+1)).value);
            STRIKE_PRICE[(i+1)] = Math.round(select("strike-price-field-"+(i+1)).value*100)/100;
            EXPIRY[(i+1)] = Math.round(select("expiry-field-"+(i+1)).value)/365;
            DIV_YIELD[(i+1)] = Math.round(select("div-yield-field-"+(i+1)).value*100)/10000;
            RISK_FREE[(i+1)] = Math.round(select("risk-free-rate-field-"+(i+1)).value*100)/10000;
        }

        STOCK_PRICE = Math.round(select("current-price-field").value*100)/100;

        //disable final input elements
        elementAvail({expiryBox, divYieldBox, riskFreeBox, buySellRadios, callPutRadios, numContractsFields, strikePriceFields,
                      expiryFields, divYieldFields, riskFreeFields, stockPriceField}, false);

        //calculate and display output
        //some function here...
        //console.log();
    } else {

        //some input error message handling
        switch(false) {

            case numContractsFieldsCond[Object.size(numContractsFieldsCond)]:
                inputErrorMsg("num-contracts-field-"+Object.size(numContractsFieldsCond),
                              "Please enter a whole number greater than or equal to 1 for the number of contracts in this trade leg.");
                break;

            case strikePriceFieldsCond[Object.size(strikePriceFieldsCond)]:
                inputErrorMsg("strike-price-field-"+Object.size(strikePriceFieldsCond),
                              "Please enter a number greater than 0 for the strike price in this trade leg.");
                break;

            case expiryFieldsCond[Object.size(expiryFieldsCond)]:
                inputErrorMsg("expiry-field-"+Object.size(expiryFieldsCond),
                              "Please enter a whole number greater than or equal to 0, and less than or equal to 1000, for the number "+
                              "of calendar days to expiry in this trade leg.");
                break;

            case divYieldFieldsCond[Object.size(divYieldFieldsCond)]:
                inputErrorMsg("div-yield-field-"+Object.size(divYieldFieldsCond),
                              "Please enter a number greater than or equal to 0, and less than or equal to 100, for the dividend yield "+
                              "percentage in this trade leg.");
                break;

            case riskFreeFieldsCond[Object.size(riskFreeFieldsCond)]:
                inputErrorMsg("risk-free-rate-field-"+Object.size(riskFreeFieldsCond),
                              "Please enter a number greater than or equal to 0, and less than or equal to 25, for the risk-free rate "+
                              "percentage in this trade leg.");
                break;

            case stockPriceFieldCond:
                inputErrorMsg(stockPriceField, "Please enter a number greater than 0 for the current price of the underlying asset.");
                break;
        }
    }
}
