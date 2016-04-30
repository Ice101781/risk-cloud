﻿//INITIAL PARAMETERS
initialParams = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    validate: function() {

        //string objects containing element id's
        var numLegsRadio = idStringsObject(["num-legs-radio"], 4),
            feesField = "fees-field",
            continueButton1 = "continue-button-1",

            //evaluate text form input conditions
            feesFieldCond = (select(feesField).value != "" && select(feesField).value >= 0);

        //input validation and error message handling
        switch(false) {

            case feesFieldCond:
                inputErrorMsg(feesField, "Please enter 0 or a positive number for the total commissions and fees.");
                break;

            default:
                //capture initial user-defined parameters
                g.TRADE_LEGS = select("input[name=num-legs-radio]:checked").value/1;
                g.CONTRACT_FEES = (select("fees-field").value/1).toFixed(2)/1;

                //remove initial params and create elements needed to specify final params; transitions
                elementAnim.ease("out", "initial-params-container", 0.25, 12.5);
                elementAnim.fade("out", "initial-params-container", 0.02);
                finalParams.create(elementAnim.fade("in", "final-params-container", 0.02));
        }
    }
})


//FINAL PARAMETERS
finalParams = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    create: function(callback) {

        //create trade leg containers
        for(var i=0; i<g.TRADE_LEGS; i++) {

            element({tag: "div", attributes: {id: "leg-"+(i+1), class: "trade-leg"}}, "trade-legs-params-container");

            //sub-containers and logic
            for(var j=0; j<5; j++) {

                element({tag: "div", attributes: {id: "leg-sub-container-"+(j+1)+"-"+(i+1), class: "leg-sub-container"}}, "leg-"+(i+1));

                //hide leg-sub-containers 2 through 4 when g.TRADE_LEGS is greater than 1
                if(j>0 && j<4) {
                        
                    switch(i>0) {

                        case true:
                            select("leg-sub-container-"+(j+1)+"-"+(i+1)).style.height = 0;
                            break;

                        case false:                                
                            if(g.TRADE_LEGS>1) {
                                select("leg-sub-container-"+(j+1)+"-1").setAttribute("data-clicked", "false");
                                select("leg-sub-container-"+(j+1)+"-1").style.backgroundColor = '#cbdafb';
                            }
                            break;
                    }
                }
            }

            //children for each trade leg container
            (function(index) {

                //buy-sell radios
                twoButtons.create([["buy","1"],["sell","-1"]], "(index % 2 == 0)", "leg-sub-container-1-", index);
                //call-put radios
                twoButtons.create([["call","1"],["put","-1"]], "(index < 2)", "leg-sub-container-1-", index);
                //number of contracts fields
                numberFields.create("num-contracts", "no. of contracts :", {min:"1", step:"1", value:"1"}, "leg-sub-container-1-", index);
                //strike prices
                numberFields.create("strike-price", "exercise price :", {min:".01", step:".01", value:"100"}, "leg-sub-container-1-", index);
                //calendar times to expiry
                numberFields.create("expiry", "calendar days to expiry :", {min:"0", step:"1", value:"30"}, "leg-sub-container-2-", index);
                //dividend % fields
                numberFields.create("div-yield", "dividend yield % :", {min:"0", step:".01", value:"0"}, "leg-sub-container-3-", index);
                //risk-free rates
                numberFields.create("risk-free-rate", "risk-free rate % :", {min:"0", step:".01", value:"0.25"}, "leg-sub-container-4-", index);
                //option prices
                numberFields.create("option-price", "option price :", {min:".01", step:".01", value:"1.25"}, "leg-sub-container-5-", index);
            })(i);
        }

        //adaptive sizing and positioning for final-params-container and two of its children
        (function() {

            var parent = select("final-params-container").style,
                child1 = select("trade-legs-params-container").style;
                child2 = select("return-button-1").style;

            switch(g.TRADE_LEGS) {

                case 1:
                    parent.width = 47 + 'vw';
                    parent.marginLeft = 22.5 + 'vw';
                    child1.marginLeft = 11.25 + 'vw';
                    child2.marginLeft = 1.925 + 'vw';
                    break;

                case 2:
                    parent.width = 47 + 'vw';
                    parent.marginLeft = 22.5 + 'vw';
                    child1.marginLeft = 0 + 'vw';
                    child2.marginLeft = 1.925 + 'vw';
                    break;

                case 3:
                    parent.width = 70 + 'vw';
                    parent.marginLeft = 11 + 'vw';
                    child1.marginLeft = 0.2625 + 'vw';
                    child2.marginLeft = 13.5 + 'vw';
                    break;

                case 4:
                    parent.width = 92 + 'vw';
                    parent.marginLeft = 0 + 'vw';
                    child1.marginLeft = 0 + 'vw';
                    child2.marginLeft = 24.5 + 'vw';
                    break;
            }
        })();

        //some more logic needed to apply certain trade parameters to all legs on multi-leg trades
        if(g.TRADE_LEGS>1) {

            //on click, toggle visibility of some sub-containers 
            select("leg-sub-container-2-1").addEventListener("click",
                                            expVis = function() {numberFields.visible("leg-sub-container-2", 2.5, 'expiry')});

            select("leg-sub-container-3-1").addEventListener("click",
                                            divVis = function() {numberFields.visible("leg-sub-container-3", 2.5, 'div-yield')});

            select("leg-sub-container-4-1").addEventListener("click",
                                            rfrVis = function() {numberFields.visible("leg-sub-container-4", 2.5, 'risk-free-rate')});

            //prevent a field element click from triggering a sub-container event
            select("expiry-field-1").addEventListener("click", function(e) {e.stopPropagation()});
            select("div-yield-field-1").addEventListener("click", function(e) {e.stopPropagation()});
            select("risk-free-rate-field-1").addEventListener("click", function(e) {e.stopPropagation()});
        }

        //transition animation callback
        if(typeof callback === 'function') { callback() }
    },

    destroy: function() {

        //clear global params
        reset(g);

        //destroy trade legs; transitions
        elementAnim.fade("out", "final-params-container", 0.02, function() {

            removeChildren('trade-legs-params-container');
            select("current-price-field").value = 100.25;
        });

        elementAnim.ease("in", "initial-params-container", 0.25, 12.5);
        elementAnim.fade("in", "initial-params-container", 0.02);
    },

    validate: function() {

        //id strings
        var buySellRadios = idStringsObject(["buy-radio", "sell-radio"], g.TRADE_LEGS),
            callPutRadios = idStringsObject(["call-radio", "put-radio"], g.TRADE_LEGS),
            numContractsFields = idStringsObject(["num-contracts-field"], g.TRADE_LEGS),
            strikePriceFields = idStringsObject(["strike-price-field"], g.TRADE_LEGS),
            expiryFields = idStringsObject(["expiry-field"], g.TRADE_LEGS),
            divYieldFields = idStringsObject(["div-yield-field"], g.TRADE_LEGS),
            riskFreeFields = idStringsObject(["risk-free-rate-field"], g.TRADE_LEGS),
            optionPriceFields = idStringsObject(["option-price-field"], g.TRADE_LEGS),
            stockPriceField = "current-price-field",
            returnButton1 = "return-button-1",
            calculateButton1 = "calculate-button-1",

            //evaluate text form input conditions
            numContractsFieldsCond = classInputCheck("num-contracts-field", g.TRADE_LEGS, ['>= 1', '== Math.floor(select(elem+"-"+(i+1)).value)']),
            strikePriceFieldsCond = classInputCheck("strike-price-field", g.TRADE_LEGS, ['> 0']),
            expiryFieldsCond = classInputCheck("expiry-field", g.TRADE_LEGS, ['>= 0', '<= 183', '== Math.floor(select(elem+"-"+(i+1)).value)']),
            divYieldFieldsCond = classInputCheck("div-yield-field", g.TRADE_LEGS, ['>= 0', '<= 100']),
            riskFreeFieldsCond = classInputCheck("risk-free-rate-field", g.TRADE_LEGS, ['>= 0', '<= 25']),
            optionPriceFieldsCond = classInputCheck("option-price-field", g.TRADE_LEGS, ['> 0']),
            stockPriceFieldCond = (select(stockPriceField).value != "" && select(stockPriceField).value > 0);


        //input validation and error message handling
        switch(false) {

            case numContractsFieldsCond[lastKey(numContractsFieldsCond)]:
                inputErrorMsg("num-contracts-field-"+lastKey(numContractsFieldsCond),
                              "Please enter a whole number greater than or equal to 1 for the number of contracts in this trade leg.");
                break;

            case strikePriceFieldsCond[lastKey(strikePriceFieldsCond)]:
                inputErrorMsg("strike-price-field-"+lastKey(strikePriceFieldsCond),
                              "Please enter a number greater than 0 for the strike price in this trade leg.");
                break;

            case expiryFieldsCond[lastKey(expiryFieldsCond)]:
                inputErrorMsg("expiry-field-"+lastKey(expiryFieldsCond),
                              "Please enter a whole number greater than or equal to 0, and less than or equal to 183, for the number "+
                              "of calendar days to expiry in this trade leg.");
                break;

            case divYieldFieldsCond[lastKey(divYieldFieldsCond)]:
                inputErrorMsg("div-yield-field-"+lastKey(divYieldFieldsCond),
                              "Please enter a number greater than or equal to 0, and less than or equal to 100, for the dividend yield "+
                              "percentage in this trade leg.");
                break;

            case riskFreeFieldsCond[lastKey(riskFreeFieldsCond)]:
                inputErrorMsg("risk-free-rate-field-"+lastKey(riskFreeFieldsCond),
                              "Please enter a number greater than or equal to 0, and less than or equal to 25, for the risk-free rate "+
                              "percentage in this trade leg.");
                break;

            case optionPriceFieldsCond[lastKey(optionPriceFieldsCond)]:
                inputErrorMsg("option-price-field-"+lastKey(optionPriceFieldsCond),
                              "Please enter a number greater than 0 for the option price in this trade leg.");
                break;

            case stockPriceFieldCond:
                inputErrorMsg(stockPriceField, "Please enter a number greater than 0 for the current price of the underlying asset.");
                break;

            default:
                //remove event listeners from sub-containers in the first trade leg
                if(g.TRADE_LEGS>1) {

                    select("leg-sub-container-2-1").removeEventListener("click", expVis);
                    select("leg-sub-container-3-1").removeEventListener("click", divVis);
                    select("leg-sub-container-4-1").removeEventListener("click", rfrVis);
                }

                //capture user-defined final parameters
                for(var i=0; i<g.TRADE_LEGS; i++) {

                    g.LEG_SIGN[(i+1)] = select("input[name=buy-sell-radio-"+(i+1)+"]:checked").value/1;
                    g.CONTRACT_TYPE[(i+1)] = select("input[name=call-put-radio-"+(i+1)+"]:checked").value/1;
                    g.NUM_CONTRACTS[(i+1)] = select("num-contracts-field-"+(i+1)).value/1;
                    g.STRIKE_PRICE[(i+1)] = +(select("strike-price-field-"+(i+1)).value/1).toFixed(2);
                    g.OPTION_PRICE[(i+1)] = +(select("option-price-field-"+(i+1)).value/1).toFixed(3);

                    if(select('leg-sub-container-2-1').getAttribute("data-clicked") == "false") {

                        g.EXPIRY[(i+1)] = (i == 0) ? +select("expiry-field-"+(i+1)).value : g.EXPIRY[1];
                    } else {
                        g.EXPIRY[(i+1)] = +select("expiry-field-"+(i+1)).value;
                    }


                    if(select('leg-sub-container-3-1').getAttribute("data-clicked") == "false") {

                        g.DIV_YIELD[(i+1)] = (i == 0) ? +(select("div-yield-field-"+(i+1)).value/100).toFixed(4) : g.DIV_YIELD[1];
                    } else {
                        g.DIV_YIELD[(i+1)] = +(select("div-yield-field-"+(i+1)).value/100).toFixed(4);
                    }


                    if(select('leg-sub-container-4-1').getAttribute("data-clicked") == "false") {

                        g.RISK_FREE[(i+1)] = (i == 0) ? +(select("risk-free-rate-field-"+(i+1)).value/100).toFixed(4) : g.RISK_FREE[1];
                    } else {
                        g.RISK_FREE[(i+1)] = +(select("risk-free-rate-field-"+(i+1)).value/100).toFixed(4);
                    }
                }

                g.STOCK_PRICE = +(select("current-price-field").value/1).toFixed(2);
        }

        //transitions
        elementAnim.ease("out", "final-params-container", 0.5, 32);
        elementAnim.fade("out", "final-params-container", 0.02, elementAnim.fade("in", "output-container", 0.02));

        //calculate and display output
        //BSM.data();

        //testing and debug
        //console.log();
    }
})


