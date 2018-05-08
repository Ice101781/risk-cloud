"use strict";

// INITIAL PARAMETERS ===============================================================================================================================

var initialParams = function(properties) {
    var self = function() { return };

    for(var prop in properties) { self[prop] = properties[prop] }
    return self;
}({
    validate: function() {
        //disable continue button
        elem.avail("continue-button-1", false);

        //capture parameters
        trade.assetType = elem.select("input[name=asset-type-radio]:checked").value;
        trade.contractMultiplier = +elem.select("input[name=contract-mult-radio]:checked").value;
        trade.legCount = +elem.select("input[name=num-legs-radio]:checked").value;

        //transitions
        finalParams.create(function() {
            elem.ease("out", "initial-params-container", 0.5, 30);
            elem.fade("out", "initial-params-container", 0.03);
            elem.fade("in", "final-params-container", 0.01);
        });
    }
});

// END INITIAL PARAMETERS ===========================================================================================================================

// FINAL PARAMETERS =================================================================================================================================

var finalParams = function(properties) {
    var self = function() { return };

    for(var prop in properties) { self[prop] = properties[prop] }
    return self;
}({
    create: function(callback) {
        var createTradeLegs = (function() {
            var fields = ["num-contracts","strike-price","option-price","expiry","div-yield","risk-free-rate"];

            //returns a radio form with two options
            function twoButtons(arr, n) {
                var bit;

                //form
                elem.create({tag: "form",
                             attributes: {id: arr[0][0]+"-"+arr[1][0]+"-"+"form-"+n, class: "general-group trade-leg-radio-forms"}},
                            "leg-sub-container-1-"+n);

                //buttons
                for(var b=0; b<2; b++) {
                    elem.create({tag: "input",
                                 attributes: {type: "radio", id: arr[b][0]+"-"+"radio-"+n, name: arr[0][0]+"-"+arr[1][0]+"-"+"radio-"+n, value: arr[b][1]}},
                                arr[0][0]+"-"+arr[1][0]+"-"+"form-"+n);
                    elem.create({tag: "label",
                                 content: arr[b][0].charAt(0).toUpperCase()+arr[b][0].slice(1),
                                 attributes: {"for": arr[b][0]+"-"+"radio-"+n, class: "general-group radio trade-leg-radios"}},
                                arr[0][0]+"-"+arr[1][0]+"-"+"form-"+n);
                }

                //default settings
                switch(arr[0][0]) {
                    case "buy":
                        if(n == 1 || n == 4) { bit = 0 } else { bit = 1 }
                        break;
                    case "call":
                        if(n < 3) { bit = 1 } else { bit = 0 }
                        break;
                }

                elem.select(arr[bit][0]+"-"+"radio-"+n).setAttribute("checked", "");
            }

            //form fields for numeric input
            var numberFields = function(properties) {
                var self = function() { return };

                for(var prop in properties) { self[prop] = properties[prop] }
                return self;
            }({
                create: function(str, n) {
                    switch(str) {
                        case fields[0]:
                            var content = "No. of contracts :",
                                attr = {min:"1", step:"1", value:"1"},
                                subNum = 2;
                            break;
                        case fields[1]:
                            var content = "Exercise price :",
                                attr = {min:".25", step:".25", value:"100.00"},
                                subNum = 3;
                            break;
                        case fields[2]:
                            var content = "Option price :",
                                attr = {min:".01", step:".01", value:"1.25"},
                                subNum = 4;
                            break;
                        case fields[3]:
                            var content = "Calendar days to expiry :",
                                attr = {min:"1", step:"1", value:"30"},
                                subNum = 5;
                            break;
                        case fields[4]:
                            var content = "Dividend yield % :",
                                attr = {min:"0.00", step:".05", value:"0.00"},
                                subNum = 6;
                            break;
                        case fields[5]:
                            var content = "Risk-free rate % :",
                                attr = {min:"0.00", step:".05", value:"0.00"},
                                subNum = 7;
                            break;
                    }

                    //form
                    elem.create({tag: "form",
                                 attributes: {id: str+"-form-"+n, class: "general group trade-leg-field-forms "+str+"-form"}},
                                "leg-sub-container-"+subNum+"-"+n);
                    //align helper
                    elem.create({tag: "div",
                                 content: content,
                                 attributes: {class: "trade-leg-align-helpers align-helper"}},
                                str+"-form-"+n);
                    //field
                    elem.create({tag: "input",
                                 attributes: {type: "number", id: str+"-field-"+n, class: "general-group all-fields small-fields "+str+"-field", min: attr.min, step: attr.step, value: attr.value}},
                                str+"-form-"+n);
                },

                //on first trade leg sub-container click, toggle visibility of remaining sub-containers
                visible: function(ctr, mht, fld) {
                    switch(elem.select(ctr+'-1').getAttribute("data-clicked")) {
                        case "true":
                            var type = "out",
                                color = '#cbdafb';
                            elem.select(ctr+'-1').setAttribute("data-clicked", "false");
                            break;
                        case "false":
                            var type = "in",
                                color = '#ffcccc';
                            elem.select(ctr+'-1').setAttribute("data-clicked", "true");
                            break;
                    }

                    //ease in or out, set field value to attribute "min" on ease out
                    for(var n=2; n<trade.legCount+1; n++) {
                        (function(l) {
                            elem.ease(type, ctr+'-'+l, 0.13625, mht, function() {
                                if(type == "out") {
                                    var f = elem.select(fld+'-field-'+l);
                                    f.value = f.getAttribute("min");
                                }
                            });
                        })(n);
                    }

                    //toggle background color of the first sub-container in the class
                    elem.select(ctr+'-1').style.backgroundColor = color;
                }
            });

            for(var n=1; n<trade.legCount+1; n++) {
                //trade leg div
                elem.create({tag: "div", attributes: {id: "leg-"+n, class: "general-group trade-leg"}}, "trade-legs-params-container");

                //sub-containers and logic
                for(var m=1; m<8; m++) {
                    elem.create({tag: "div", attributes: {id: "leg-sub-container-"+m+"-"+n, class: "general-group leg-sub-container"}}, "leg-"+n);

                    //add some space between certain sub-containers
                    if(m==1 || m==4) { elem.select("leg-sub-container-"+m+"-"+n).style.marginBottom = 1.75 + "vw" }

                    //hide sub-containers 2 through 4 when the number of trade legs is greater than 1
                    if(m>4 && m<8) {
                        switch(n>1) {
                            case true:
                                elem.select("leg-sub-container-"+m+"-"+n).style.height = 0;
                                break;
                            case false:
                                if(trade.legCount>1) {
                                    elem.select("leg-sub-container-"+m+"-1").setAttribute("data-clicked", "false");
                                    elem.select("leg-sub-container-"+m+"-1").style.backgroundColor = '#cbdafb';
                                }
                                break;
                        }
                    }
                }

                //make the first sub-container of each trade leg larger and darker
                elem.select("leg-sub-container-1-"+n).style.height = 6.25 + "vw";
                elem.select("leg-sub-container-1-"+n).style.backgroundColor = '#888888';

                //forms
                var addSubContainerForms = (function(l) {
                    var radios = [ [ ["buy","1"],["sell","-1"] ], [ ["call","1"],["put","-1"] ] ];

                    radios.forEach(function(arr) { twoButtons(arr,l) });
                    fields.forEach(function(ele) { numberFields.create(ele,l) });
                }(n));
            }

            //more logic needed to apply certain trade parameters to all legs on multi-leg trades
            var addSubContainerListeners = (function() {
                if(trade.legCount>1) {
                    for(var f=3; f<fields.length; f++) {
                        //toggle visibility of select sub-containers
                        elem.select("leg-sub-container-"+(f+2)+"-1").addEventListener("click", (function(i) {
                            return function() { numberFields.visible("leg-sub-container-"+(i+2), 2.725, fields[i])}
                        }(f)));
                        //prevent a field click from triggering a sub-container event
                        elem.select(fields[f]+"-field-1").addEventListener("click", function(e) { e.stopPropagation() });
                    }
                }
            }());

            //hide dividend yield for futures options trades
            if(trade.assetType === "Futures") {
                elem.select("leg-sub-container-6-1").style.height = 0;
            }
        }());

        //apply adaptive sizing, bordering
        var dynamicStyles = (function() {
            var bdr = '1px solid #ffffff';

            switch(trade.legCount) {
                case 1:
                    elem.select("trade-legs-params-container").style.width = 45 + 'vw';
                    elem.select("leg-1").style.borderLeft  = bdr;
                    elem.select("leg-1").style.borderRight = bdr;
                    break;
                case 2:
                    elem.select("trade-legs-params-container").style.width = 45 + 'vw';
                    elem.select("leg-1").style.borderRight = bdr;
                    break;
                case 3:
                    elem.select("trade-legs-params-container").style.width = 68 + 'vw';
                    for(var n=1; n<trade.legCount; n++) { elem.select("leg-"+n).style.borderRight = bdr }
                    break;
                case 4:
                    elem.select("trade-legs-params-container").style.width = 90 + 'vw';
                    for(var n=1; n<trade.legCount; n++) { elem.select("leg-"+n).style.borderRight = bdr }
                    break;
            }
        }());

        //transition animation callback
        callback();
    },

    validate: function() {
        //store inputs
        function captureParams() {
            for(var n=1; n<trade.legCount+1; n++) {
                trade.contractSigns[n] = +elem.select("input[name=buy-sell-radio-"+n+"]:checked").value;
                trade.contractTypes[n] = +elem.select("input[name=call-put-radio-"+n+"]:checked").value;
                trade.contractCounts[n] = +elem.select("num-contracts-field-"+n).value;
                trade.strikePrices[n] = +elem.select("strike-price-field-"+n).value;
                trade.optionPrices[n] = Math.round(+elem.select("option-price-field-"+n).value*100)/100;

                //on multi-leg trades, take the value of certain parameters in the first trade leg unless otherwise specified
                if(elem.select('leg-sub-container-5-1').getAttribute("data-clicked") == "false") {
                    trade.expirys[n] = (n==1) ? +elem.select("expiry-field-"+n).value : trade.expirys[1];
                } else {
                    trade.expirys[n] = +elem.select("expiry-field-"+n).value;
                }

                if(elem.select('leg-sub-container-6-1').getAttribute("data-clicked") == "false") {
                    trade.yields[n] = (n==1) ? elem.select("div-yield-field-"+n).value/100 : trade.yields[1];
                } else {
                    trade.yields[n] = elem.select("div-yield-field-"+n).value/100;
                }

                if(elem.select('leg-sub-container-7-1').getAttribute("data-clicked") == "false") {
                    trade.rates[n] = (n==1) ? elem.select("risk-free-rate-field-"+n).value/100 : trade.rates[1];
                } else {
                    trade.rates[n] = elem.select("risk-free-rate-field-"+n).value/100;
                }

                trade.legMultipliers[n] = trade.contractMultiplier*trade.contractSigns[n]*trade.contractCounts[n];
            }

            trade.assetPrice = Math.round(+elem.select("current-price-field").value*100)/100;
        }

        //write to the trade table
        function printTableData() {
            var p = trade.priceSpace[(trade.priceSpace.length-1)/2].toFixed(2),
                tCost = trade.contractMultiplier/100*obj.sum(obj.corr("prod",[trade.contractSigns,trade.contractCounts,trade.optionPrices]));

            for(var n=1; n<trade.legCount+1; n++) {
                var ele = "leg-"+n+"-",
                    buy_sell = trade.contractSigns[n] == 1 ? "BUY &nbsp" : "SELL &nbsp",
                    color = trade.contractSigns[n] == 1 ? "rgb(0,175,0)" : "rgb(200,0,0)",
                    call_put = trade.contractTypes[n] == 1 ? " CALL " : " PUT ";

                //summary
                elem.select(ele+"summary").innerHTML = buy_sell + trade.contractCounts[n] + "&nbsp x &nbsp" + trade.strikePrices[n] + "&nbsp" + call_put + "&nbsp @ &nbsp" + trade.optionPrices[n].toFixed(2) + "&nbsp&nbsp w/ &nbsp&nbsp" + trade.expirys[n] + " DTE";
                elem.select(ele+"summary").style.color = color;
                elem.select(ele+"summary").style.borderRightColor = "rgb(0,0,0)";

                //option prices
                elem.select(ele+"price").innerHTML = "$" + (trade.contractMultiplier/100*trade.contractCounts[n]*trade.optionPrices[n]).toFixed(2);
                elem.select(ele+"price").style.color = color;

                //IVs
                elem.select(ele+"iv").innerHTML = (trade.impliedVols[n]*100).toFixed(2) + "%";
                elem.select(ele+"iv").style.color = trade.contractSigns[n] == 1 ? "rgb(0,175,0)" : "rgb(200,0,0)";
                elem.select(ele+"iv").style.borderRightColor = "rgb(0,0,0)";

                //greeks
                for(var greek in trade.data.greeks) {
                    if(greek !== "vanna") { elem.select(ele+greek).innerHTML = trade.data.greeks[greek][0][p][n].toFixed(2) } else { break }
                }
            }

            //total cost of the trade per share
            elem.select("price-total").innerHTML = "$" + Math.abs(tCost).toFixed(2);
            elem.select("price-total").style.color = Math.sign(tCost) == 1 ? "rgb(0,150,0)" : "rgb(175,0,0)";

            //totals for the greeks
            for(var greek in trade.data.greeks) {
                if(greek !== "vanna") { elem.select(greek+"-total").innerHTML = obj.sum(trade.data.greeks[greek][0][p]).toFixed(2) } else { break }
            }
        }

        //add nearest expiry value to the 'output-time-field' and set this value as the field's maximum
        function setTimeField() {
            elem.select("output-time-field").value = trade.expiryMin;
            elem.select("output-time-field").setAttribute("max", trade.expiryMin);
        }

        //determine whether text input form conditions are satisfied
        function inputCheck(ele) {
            var obj = {};

            for(var n=1; n<trade.legCount+1; n++) {
                var val = elem.select(ele+"-"+n).value;

                if(val == "") {
                    obj[n] = false;
                    return obj;
                }

                switch(ele) {
                    case "num-contracts-field":
                        switch(false) {
                            case val >= 1 && val == Math.floor(val):
                                obj[n] = false;
                                return obj;
                            default:
                                obj[n] = true;
                                break;
                        }
                        break;
                    case "strike-price-field":
                        switch(false) {
                            case val >= 1:
                                obj[n] = false;
                                return obj;
                            default:
                                obj[n] = true;
                                break;
                        }
                        break;
                    case "option-price-field":
                        switch(false) {
                            case val > 0:
                                obj[n] = false;
                                return obj;
                            default:
                                obj[n] = true;
                                break;
                        }
                        break;
                    case "expiry-field":
                        switch(false) {
                            case val >= 1 && val <= 183 && val == Math.floor(val):
                                obj[n] = false;
                                return obj;
                            default:
                                obj[n] = true;
                                break;
                        }
                        break;
                    case "div-yield-field":
                        switch(false) {
                            case val >= 0 && val <= 100:
                                obj[n] = false;
                                return obj;
                            default:
                                obj[n] = true;
                                break;
                        }
                        break;
                    case "risk-free-rate-field":
                        switch(false) {
                            case val >= 0 && val <= 25:
                                obj[n] = false;
                                return obj;
                            default:
                                obj[n] = true;
                                break;
                        }
                        break;
                }
            }

            return obj;
        }

        //input validation
        var textFormChecks = (function() {
            var numContractsCheck = inputCheck("num-contracts-field"),
                strikePricesCheck = inputCheck("strike-price-field"),
                optionPricesCheck = inputCheck("option-price-field"),
                expirysCheck = inputCheck("expiry-field"),
                yieldsCheck = inputCheck("div-yield-field"),
                ratesCheck = inputCheck("risk-free-rate-field"),
                assetPriceCheck = (elem.select("current-price-field").value != "" && elem.select("current-price-field").value >= 1);

            switch(false) {
                case numContractsCheck[obj.size(numContractsCheck)]:
                    errorMsg("num-contracts-field-"+obj.size(numContractsCheck),
                        "Please enter a whole number greater than or equal to 1 for the number of contracts in this trade leg.");
                    break;
                case strikePricesCheck[obj.size(strikePricesCheck)]:
                    errorMsg("strike-price-field-"+obj.size(strikePricesCheck),
                        "Please enter a number greater than or equal to 1 for the strike price in this trade leg.");
                    break;
                case optionPricesCheck[obj.size(optionPricesCheck)]:
                    errorMsg("option-price-field-"+obj.size(optionPricesCheck),
                        "Please enter a number greater than 0 for the option price in this trade leg.");
                    break;
                case expirysCheck[obj.size(expirysCheck)]:
                    errorMsg("expiry-field-"+obj.size(expirysCheck),
                        "Please enter a whole number greater than or equal to 1, and less than or equal to 183, for the number of calendar days to expiry in this trade leg.");
                    break;
                case yieldsCheck[obj.size(yieldsCheck)]:
                    errorMsg("div-yield-field-"+obj.size(yieldsCheck),
                        "Please enter a number greater than or equal to 0, and less than or equal to 100, for the dividend yield percentage in this trade leg.");
                    break;
                case ratesCheck[obj.size(ratesCheck)]:
                    errorMsg("risk-free-rate-field-"+obj.size(ratesCheck),
                        "Please enter a number greater than or equal to 0, and less than or equal to 25, for the risk-free rate percentage in this trade leg.");
                    break;
                case assetPriceCheck:
                    errorMsg("current-price-field",
                        "Please enter a number greater than or equal to 1 for the current level of the underlying.");
                    break;
                default:
                    //store trade parameters
                    captureParams();
                    //transitions
                    elem.ease("out", "final-params-container", 0.5, 38);
                    elem.fade("out", "final-params-container", 0.03);
                    elem.fade("in", "output-container", 0.01, function() {
                        //status update
                        console.log('now calculating...');

                        //calculate and visualize
                        setTimeout(function() {
                            trade.initialize(function() {
                                //DOM manipulation, status updates
                                elem.destroyChildren("output-view-container",["BSM-calc-text"]);
                                console.log('finished calculations.');
                                elem.create({tag: "div", content: 'Pushing data to three.js...', attributes: {id: "BSM-push-text", class: "load-text"}}, "output-view-container");
                                console.log('pushing vertices to point cloud geometries...');

                                printTableData();
                                setTimeField();
                                setTimeout(function() {
                                    graphics.initialize();
                                });
                            });
                        });
                    });
                    break;
            }
        }());
    },

    destroy: function() {
        //clear properties from the instance object
        trade.assetType = null;
        trade.contractMultiplier = null;
        trade.legCount = null;

        //transitions
        elem.fade("out", "final-params-container", 0.03, function() {
            //enable continue button
            elem.avail("continue-button-1", true);
        });
        elem.ease("in", "initial-params-container", 0.5, 30);
        elem.fade("in", "initial-params-container", 0.01, function() {
            //destroy trade legs
            elem.destroyChildren('trade-legs-params-container');
            //reset underlying price field
            elem.select("current-price-field").value = "100.25";
        });
    }
});

// END FINAL PARAMETERS =============================================================================================================================

// OUTPUT ===========================================================================================================================================

var output = function(properties) {
    var self = function() { return };

    for(var prop in properties) { self[prop] = properties[prop] }
    return self;
}({
    destroy: function() {
        //disable output data buttons and output time elements
        var disableOutputElems = (function(bool) {
            for(var b=1; b<=10; b++) { elem.avail("output-data-radio-"+b, !bool) }
            ["output-time-field", "output-time-button"].forEach(function(ele) { elem.avail(ele, !bool) });
        }(true));

        var resetOutputDataTracker = (function() {
            elem.destroyChildren("output-data-tracker");
            elem.select("output-data-tracker").style.backgroundColor = '#888888';
        }());

        //reset data value to 'Profit and Loss' default
        elem.select("input[name=output-data-radio]").checked = "1";

        //reset 'output-view-container'
        graphics.removeClouds();
        elem.destroyChildren("output-view-container");
        graphics.graphicsInitialized = false;

        //clear values from the table
        var clearTableValues = (function() {
            for(var n=1; n<trade.legCount+1; n++) {
                var ele = "leg-"+n+"-";

                //clear trade summary, option price and IV from each row, reset colors
                ["summary", "price", "iv"].forEach(function(column) {
                    elem.select(ele+column).innerHTML = "- - -";
                    elem.select(ele+column).style.color = "black";
                });

                //clear greeks from each row
                for(var greek in trade.data.greeks) {
                    if(greek !== "vanna") { elem.select(ele+greek).innerHTML = "- - -" } else { break }
                }
            }

            //clear option price total, reset color
            elem.select("price-total").innerHTML = "- - -";
            elem.select("price-total").style.color = "black";

            //clear greeks totals
            for(var greek in trade.data.greeks) {
                if(greek !== "vanna") { elem.select(greek+"-total").innerHTML = "- - -" } else { break }
            }
        }());

        //reset 'output-time-field' and its maximum
        var resetTimeField = (function() {
            elem.select("output-time-field").value = "";
            elem.select("output-time-field").setAttribute("max", 183);
        }());

        //clear properties from instance object
        trade.data = { profit: {}, greeks: { delta: {}, gamma: {}, theta: {}, vega: {}, rho: {}, vanna: {}, vomma: {}, charm: {}, veta: {} } };
        trade.temp = { price: {}, greeks: { delta: {}, gamma: {}, theta: {}, vega: {}, rho: {}, vanna: {}, vomma: {}, charm: {}, veta: {} } };
        trade.priceSpace = [];
        trade.standardDeviation = null;
        trade.expiryMin = null;
        trade.impliedVols = {};
        trade.legMultipliers = {};
        trade.assetPrice = null;
        trade.rates = {};
        trade.yields = {};
        trade.expirys = {};
        trade.optionPrices = {};
        trade.strikePrices = {};
        trade.contractCounts = {};
        trade.contractTypes = {};
        trade.contractSigns = {};
        trade.tradeInitialized = false;

        //transitions
        elem.fade("out", "output-container", 0.02);
        elem.fade("in", "final-params-container", 0.01);
        elem.ease("in", "final-params-container", 0.5, 38, function() {
            //reset load graphics
            elem.create({tag: "img", attributes: {id: "BSM-load-icon", class: "load-icon", src: '../images/icon3.png'}}, "output-data-tracker");
            elem.create({tag: "div", content: 'Calculating...', attributes: {id: "BSM-calc-text", class: "load-text"}}, "output-view-container");
        });
    }
});

// END OUTPUT =======================================================================================================================================
