// INITIAL PARAMETERS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

initialParams = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    validate: function() {

        //string objects containing element id's
        var numLegsRadio    = idStringsObject(["num-legs-radio"], 4),
            feesField       = "fees-field",
            continueButton1 = "continue-button-1",

            //evaluate text form input conditions
            feesFieldCond = (elem.select(feesField).value != "" && elem.select(feesField).value >= 0);

        //input validation and error message handling
        switch(false) {

            case feesFieldCond:
                inputErrorMsg(feesField, "Please enter 0 or a positive number for the total commissions and fees.");
                break;

            default:
                //capture initial user-defined parameters
                g.TRADE_LEGS    = +elem.select("input[name=num-legs-radio]:checked").value;
                g.CONTRACT_FEES = +elem.select("fees-field").value;

                //remove initial params and create elements needed to specify final params; transitions
                finalParams.create(function() {

                    elem.ease("out", "initial-params-container", 0.25, 13);
                    elem.fade("out", "initial-params-container", 0.02);
                    elem.fade("in", "final-params-container", 0.02);
                });
                break;
        }
    }
})

// END INITIAL PARAMETERS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// FINAL PARAMETERS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

finalParams = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    create: function(callback) {

        //adaptive sizing and positioning
        (function() {

            var parent = elem.select("final-params-container").style,
                child1 = elem.select("trade-legs-params-container").style;
                child2 = elem.select("return-button-1").style;

            switch(g.TRADE_LEGS) {

                case 1:
                    parent.width = 47 + 'vw';
                    parent.marginLeft = 22.5 + 'vw';
                    child1.marginLeft = 12.25 + 'vw';
                    child2.marginLeft = 1.475 + 'vw';
                    break;

                case 2:
                    parent.width = 47 + 'vw';
                    parent.marginLeft = 22.5 + 'vw';
                    child1.marginLeft = 1 + 'vw';
                    child2.marginLeft = 1.475 + 'vw';
                    break;

                case 3:
                    parent.width = 70 + 'vw';
                    parent.marginLeft = 11 + 'vw';
                    child1.marginLeft = 1.2625 + 'vw';
                    child2.marginLeft = 13.05 + 'vw';
                    break;

                case 4:
                    parent.width = 92 + 'vw';
                    parent.marginLeft = 0 + 'vw';
                    child1.marginLeft = 1 + 'vw';
                    child2.marginLeft = 24.05 + 'vw';
                    break;
            }
        })();

        //create trade legs
        for(i=1; i<g.TRADE_LEGS+1; i++) {

            elem.create({tag: "div", attributes: {id: "leg-"+i, class: "general-group trade-leg"}}, "trade-legs-params-container");

            //sub-containers and logic
            for(j=1; j<8; j++) {

                elem.create({tag: "div", attributes: {id: "leg-sub-container-"+j+"-"+i, class: "general-group leg-sub-container"}}, "leg-"+i);

                //create some space between three groupings of sub-containers
                if(j==1 || j==4) { elem.select("leg-sub-container-"+j+"-"+i).style.marginBottom = 1.75 + "vw" }

                //hide sub-containers 2 through 4 when g.TRADE_LEGS is greater than 1
                if(j>4 && j<8) {
                        
                    switch(i>1) {

                        case true:
                            elem.select("leg-sub-container-"+j+"-"+i).style.height = 0;
                            break;

                        case false:
                            if(g.TRADE_LEGS>1) {
                                elem.select("leg-sub-container-"+j+"-1").setAttribute("data-clicked", "false");
                                elem.select("leg-sub-container-"+j+"-1").style.backgroundColor = '#cbdafb';
                            }
                            break;
                    }
                }
            }

            //make sub-containers 1 larger and darker
            elem.select("leg-sub-container-1-"+i).style.height = 6.25 + "vw";
            elem.select("leg-sub-container-1-"+i).style.backgroundColor = '#777777';

            //sub-container input radios and text fields
            (function(n) {

                //buy-sell & call-put radios
                [ [["buy","1"],["sell","-1"]], [["call","1"],["put","-1"]] ].forEach(function(array) {

                    twoButtons.create(array, n);
                });

                //text fields
                ["num-contracts", "strike-price", "option-price", "expiry", "div-yield", "risk-free-rate"].forEach(function(element) {

                    numberFields.create(element, n)
                });

            })(i);
        }

        //some more logic needed to apply certain trade parameters to all legs on multi-leg trades
        if(g.TRADE_LEGS>1) {

            //on click, toggle visibility of some sub-containers
            elem.select("leg-sub-container-5-1").addEventListener("click", expVis = function() {numberFields.visible("leg-sub-container-5", 2.725, 'expiry')});
            elem.select("leg-sub-container-6-1").addEventListener("click", divVis = function() {numberFields.visible("leg-sub-container-6", 2.725, 'div-yield')});
            elem.select("leg-sub-container-7-1").addEventListener("click", rfrVis = function() {numberFields.visible("leg-sub-container-7", 2.725, 'risk-free-rate')});

            //prevent a field element click from triggering a sub-container event
            ["expiry-field-1", "div-yield-field-1", "risk-free-rate-field-1"].forEach(function(element) { elem.select(element).addEventListener("click", function(e) { e.stopPropagation() }) });
        }

        //transition animation callback
        if(typeof callback === 'function') { callback() }
    },


    destroy: function() {

        //clear global params
        obj.reset(g);

        //transitions
        elem.fade("out", "final-params-container", 0.02, function() {

            //destroy trade info
            elem.destroyChildren('trade-legs-params-container');

            //reset stock price field value
            elem.select("current-price-field").value = 100.25;
        });

        elem.ease("in", "initial-params-container", 0.25, 13);
        elem.fade("in", "initial-params-container", 0.02);
    },


    validate: function() {

        //id strings
        var buySellRadios      = idStringsObject(["buy-radio", "sell-radio"], g.TRADE_LEGS),
            callPutRadios      = idStringsObject(["call-radio", "put-radio"], g.TRADE_LEGS),
            numContractsFields = idStringsObject(["num-contracts-field"], g.TRADE_LEGS),
            strikePriceFields  = idStringsObject(["strike-price-field"], g.TRADE_LEGS),
            optionPriceFields  = idStringsObject(["option-price-field"], g.TRADE_LEGS),
            expiryFields       = idStringsObject(["expiry-field"], g.TRADE_LEGS),
            divYieldFields     = idStringsObject(["div-yield-field"], g.TRADE_LEGS),
            riskFreeFields     = idStringsObject(["risk-free-rate-field"], g.TRADE_LEGS),
            returnButton1      = "return-button-1",
            stockPriceField    = "current-price-field",
            calculateButton1   = "calculate-button-1",

            //evaluate text form input conditions
            numContractsFieldsCond = classInputCheck("num-contracts-field", g.TRADE_LEGS),
            strikePriceFieldsCond  = classInputCheck("strike-price-field", g.TRADE_LEGS),
            optionPriceFieldsCond  = classInputCheck("option-price-field", g.TRADE_LEGS),
            expiryFieldsCond       = classInputCheck("expiry-field", g.TRADE_LEGS),
            divYieldFieldsCond     = classInputCheck("div-yield-field", g.TRADE_LEGS),
            riskFreeFieldsCond     = classInputCheck("risk-free-rate-field", g.TRADE_LEGS),
            stockPriceFieldCond    = (elem.select(stockPriceField).value != "" && elem.select(stockPriceField).value > 0);

        //input validation and error message handling
        switch(false) {

            case numContractsFieldsCond[obj.size(numContractsFieldsCond)]:
                inputErrorMsg("num-contracts-field-"+obj.size(numContractsFieldsCond), "Please enter a whole number greater than or equal to 1 for the number of contracts in this trade leg.");
                break;

            case strikePriceFieldsCond[obj.size(strikePriceFieldsCond)]:
                inputErrorMsg("strike-price-field-"+obj.size(strikePriceFieldsCond), "Please enter a number greater than 0 for the strike price in this trade leg.");
                break;

            case optionPriceFieldsCond[obj.size(optionPriceFieldsCond)]:
                inputErrorMsg("option-price-field-"+obj.size(optionPriceFieldsCond), "Please enter a number greater than 0 for the option price in this trade leg.");
                break;

            case expiryFieldsCond[obj.size(expiryFieldsCond)]:
                inputErrorMsg("expiry-field-"+obj.size(expiryFieldsCond), "Please enter a whole number greater than or equal to 1, and less than or equal to 183, for the number of calendar days to expiry in this trade leg.");
                break;

            case divYieldFieldsCond[obj.size(divYieldFieldsCond)]:
                inputErrorMsg("div-yield-field-"+obj.size(divYieldFieldsCond), "Please enter a number greater than or equal to 0, and less than or equal to 100, for the dividend yield percentage in this trade leg.");
                break;

            case riskFreeFieldsCond[obj.size(riskFreeFieldsCond)]:
                inputErrorMsg("risk-free-rate-field-"+obj.size(riskFreeFieldsCond), "Please enter a number greater than or equal to 0, and less than or equal to 25, for the risk-free rate percentage in this trade leg.");
                break;

            case stockPriceFieldCond:
                inputErrorMsg(stockPriceField, "Please enter a number greater than 0 for the current price of the underlying stock.");
                break;

            default:
                //capture the user-defined current price of the underlying stock
                g.STOCK_PRICE = +elem.select("current-price-field").value;

                //capture remaining final parameters, write some info to elements of the trade summary table
                for(i=1; i<g.TRADE_LEGS+1; i++) {

                    g.LONG_SHORT[i]    = +elem.select("input[name=buy-sell-radio-"+i+"]:checked").value;
                    g.CONTRACT_TYPE[i] = +elem.select("input[name=call-put-radio-"+i+"]:checked").value;
                    g.NUM_CONTRACTS[i] = +elem.select("num-contracts-field-"+i).value;
                    g.STRIKE_PRICE[i]  = +elem.select("strike-price-field-"+i).value;
                    g.OPTION_PRICE[i]  = +elem.select("option-price-field-"+i).value;

                    //on multi-leg trades, take the value of certain parameters in the first trade leg unless the user specifies otherwise
                    if(elem.select('leg-sub-container-4-1').getAttribute("data-clicked") == "false") {

                        g.EXPIRY[i] = (i==1) ? +elem.select("expiry-field-"+i).value : g.EXPIRY[1];
                    } else {
                        g.EXPIRY[i] = +elem.select("expiry-field-"+i).value;
                    }


                    if(elem.select('leg-sub-container-5-1').getAttribute("data-clicked") == "false") {

                        g.DIV_YIELD[i] = (i==1) ? elem.select("div-yield-field-"+i).value/100 : g.DIV_YIELD[1];
                    } else {
                        g.DIV_YIELD[i] = elem.select("div-yield-field-"+i).value/100;
                    }


                    if(elem.select('leg-sub-container-6-1').getAttribute("data-clicked") == "false") {

                        g.RISK_FREE[i] = (i==1) ? elem.select("risk-free-rate-field-"+i).value/100 : g.RISK_FREE[1];
                    } else {
                        g.RISK_FREE[i] = elem.select("risk-free-rate-field-"+i).value/100;
                    }


                    //write trade summary and option price info to elements of the trade summary table
                    (function(n) {

                        //local vars
                        var element  = "leg-"+n+"-",
                            buy_sell = g.LONG_SHORT[n]    == 1 ? "BUY &nbsp&nbsp" : "SELL &nbsp&nbsp",
                            color    = g.LONG_SHORT[n]    == 1 ? "rgb(0,175,0)"   : "rgb(200,0,0)",
                            call_put = g.CONTRACT_TYPE[n] == 1 ? "&nbsp CALL"     : "&nbsp PUT",
                            expiry   = " &nbsp&nbsp" + g.EXPIRY[n] + " DTE";

                        //trade summary
                        elem.select(element+"summary").innerHTML = buy_sell + g.NUM_CONTRACTS[n] + " x " + g.STRIKE_PRICE[n] + call_put + expiry;
                        elem.select(element+"summary").style.color = color;
                        elem.select(element+"summary").style.borderRightColor = "rgb(0,0,0)";

                        //option price
                        elem.select(element+"price").innerHTML = "$" + g.OPTION_PRICE[n].toFixed(2);
                        elem.select(element+"price").style.color = color;
                    })(i);
                }

                //write option price total to its trade summary table element
                (function() {

                    var price = 0;

                    for(i=1; i<g.TRADE_LEGS+1; i++) { price += g.LONG_SHORT[i]*g.NUM_CONTRACTS[i]*g.OPTION_PRICE[i].toFixed(2) }

                    elem.select("price-total").innerHTML = "$" + Math.abs(price).toFixed(2);
                    elem.select("price-total").style.color = Math.sign(price) == 1 ? "rgb(0,150,0)" : "rgb(175,0,0)";
                })();

                //add nearest expiry value to the 'output-time-field' and set this value as the field's maximum
                elem.select("output-time-field").value = obj.min(g.EXPIRY);
                elem.select("output-time-field").setAttribute("max", obj.min(g.EXPIRY));

                //transitions, calculate and display output
                elem.ease("out", "final-params-container", 0.5, 35);
                elem.fade("out", "final-params-container", 0.02);
                elem.fade("in", "output-container", 0.015, function() { setTimeout(function() { BSM.data(visuals.init) }, 350) });
                break;
        }
    }
})

// END FINAL PARAMETERS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
