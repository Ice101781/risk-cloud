"use strict";

//the Black-Scholes framework for valuing European-style options
function BlackScholesTrade() {
    //*** private variables
    var self = this,
        e,S,F,K,v,r,D,T,d1,d2,
        mod,
        models = {
            //classic options
            BSM: {
                d1: function() {
                    if(S == K && T == 0) { return Infinity } else {
                        return (Math.log(S/K)+(r-D+(Math.pow(v,2)/2))*T)/(v*Math.sqrt(T));
                    }
                },
                price: function() {
                    return e*((S*math.CUMNORM(e*d1)*Math.pow(Math.E,-D*T))-(K*math.CUMNORM(e*d2)*Math.pow(Math.E,-r*T)));
                },
                delta: function() {
                    return e*Math.pow(Math.E,-D*T)*math.CUMNORM(e*d1);
                },
                gamma: function() {
                    if(T == 0) { return 0 } else {
                        return (Math.pow(Math.E,-D*T)*math.NORM(d1))/(S*v*Math.sqrt(T));
                    }
                },
                theta: function() {
                    if(T == 0) { return 0 } else {
                        return (S*Math.pow(Math.E,-D*T)*(e*D*math.CUMNORM(e*d1)-(v*math.NORM(d1)/(2*Math.sqrt(T))))-K*Math.pow(Math.E,-r*T)*e*r*math.CUMNORM(e*d2))/365;
                    }
                },
                vega: function() {
                    return (S*Math.pow(Math.E,-D*T)*math.NORM(d1)*Math.sqrt(T))/100;
                },
                rho: function() {
                    return (e*K*Math.pow(Math.E,-r*T)*math.CUMNORM(e*d2)*T)/100;
                },
                //interpreted here as the sensitivity of vega to moves in the underlying index
                vanna: function() {
                    if(T == 0) { return 0 } else {
                        return ((S*Math.pow(Math.E,-D*T)*math.NORM(d1)*Math.sqrt(T))/100)/S*(1-(d1/(v*Math.sqrt(T))));
                    }
                },
                vomma: function() {
                    if(T == 0) { return 0 } else {
                        return (S*Math.pow(Math.E,-D*T)*math.NORM(d1)*Math.sqrt(T)*d1*d2/v)/100;
                    }
                },
                charm: function() {
                    if(T == 0) { return 0 } else {
                        return (Math.pow(Math.E,-D*T)*(e*D*math.CUMNORM(e*d1)-math.NORM(d1)*(2*(r-D)*T-d2*v*Math.sqrt(T))/(2*T*v*Math.sqrt(T))))/365;
                    }
                },
                veta: function() {
                    if(T == 0) { return 0 } else {
                        return (S*Math.pow(Math.E,-D*T)*math.NORM(d1)*Math.sqrt(T)*(D-(d1*d2+1)/(2*T)+(d1*(r-D))/(v*Math.sqrt(T))))/(100*365);
                    }
                }
            },

            //futures options
            Black: {
                d1: function() {
                    if(F == K && T == 0) { return Infinity } else {
                        return (Math.log(F/K)+(Math.pow(v,2)/2)*T)/(v*Math.sqrt(T));
                    }
                },
                price: function() {
                    return e*Math.pow(Math.E,-r*T)*(F*math.CUMNORM(e*d1)-K*math.CUMNORM(e*d2));
                },
                delta: function() {
                    return e*Math.pow(Math.E,-r*T)*math.CUMNORM(e*d1);
                },
                gamma: function() {
                    if(T == 0) { return 0 } else {
                        return (Math.pow(Math.E,-r*T)*math.NORM(d1))/(F*v*Math.sqrt(T));
                    }
                },
                theta: function() {
                    if(T == 0) { return 0 } else {
                        return (Math.pow(Math.E,-r*T)*(F*(e*r*math.CUMNORM(e*d1)-(v*math.NORM(d1)/(2*Math.sqrt(T))))-K*e*r*math.CUMNORM(e*d2)))/365;
                    }
                },
                vega: function() {
                    return (F*Math.pow(Math.E,-r*T)*math.NORM(d1)*Math.sqrt(T))/100;
                },
                rho: function() {
                    return (e*K*Math.pow(Math.E,-r*T)*math.CUMNORM(e*d2)*T)/100;
                },
                //interpreted here as the sensitivity of delta to moves in volatility
                vanna: function() {
                    if(T == 0) { return 0 } else {
                        return (Math.pow(-Math.E,-r*T)*math.NORM(d1)*(d2/v))/100;
                    }
                },
                vomma: function() {
                    if(T == 0) { return 0 } else {
                        return (F*Math.pow(Math.E,-r*T)*math.NORM(d1)*Math.sqrt(T)*d1*d2/v)/100;
                    }
                },
                charm: function() {
                    if(T == 0) { return 0 } else {
                        return (Math.pow(Math.E,-r*T)*(e*r*math.CUMNORM(e*d1)+math.NORM(d1)*d2/(2*T)))/365;
                    }
                },
                veta: function() {
                    if(T == 0) { return 0 } else {
                        return (F*Math.pow(Math.E,-r*T)*math.NORM(d1)*Math.sqrt(T)*(r-(d1*d2+1)/(2*T)))/(100*365);
                    }
                }
            }
        };

    //*** private methods
    function setModel() {
        if(self.assetType === "Stock") {
            mod = models.BSM;
            S = self.assetPrice;
        } else {
            mod = models.Black;
            F = self.assetPrice;
        }
    }

    function storeIVs() {
        //back-out the implied volatility from an option's market price using either of two methods
        function extractIV(num, method) {
            var mktP = self.optionPrices[num],
                bsmP;

            e = self.contractTypes[num];
            K = self.strikePrices[num];
            r = self.rates[num];
            D = self.yields[num];
            T = self.expirys[num]/365;

            switch(method) {
                case 'Newton-Raphson':
                    v = 0.2;

                    for(var j=0; j<15; j++) {
                        d1 = mod.d1();
                        d2 = d1-v*Math.sqrt(T);

                        //option price based on current estimate for implied volatility
                        bsmP = mod.price();

                        //return a value if threshold condition is met, otherwise compute the next estimate
                        if(Math.abs(mktP-bsmP) <= Math.pow(10,-2)) { return v } else { v += (mktP-bsmP)/(mod.vega()*100) }
                    }

                    return false;

                case 'Bisection':
                    //status update
                    console.log('The Newton-Raphson method did not converge for leg '+num+'. Now implementing the Bisection method...');

                    var low = 0.01,
                        hgh = 2;

                    for(var j=0; j<50; j++) {
                        v = (low+hgh)/2;
                        d1 = mod.d1();
                        d2 = d1-v*Math.sqrt(T);

                        //option price based on current estimate for implied volatility
                        bsmP = mod.price();

                        //return a value if threshold condition is met, otherwise compute the next estimate
                        if(Math.abs(low-hgh) <= Math.pow(10,-10)) { return v } else {
                            switch(Math.sign(mktP-bsmP)) {
                                case 1:
                                    low = v;
                                    break;
                                case -1:
                                    hgh = v;
                                    break;
                            }
                        }
                    }
            }
        }

        for(var n=1; n<self.legCount+1; n++) { self.impliedVols[n] = extractIV(n,'Newton-Raphson') || extractIV(n,'Bisection') }
    }

    function storeTradeData(callback) {
        function createPriceSpace() {
            //determine a standard deviation for use in generating the range of underlying prices in the space
            function assignStandardDeviation() {
                var strikeDists = {},
                    impliedVols = {};

                //store nearest expiry
                self.expiryMin = obj.min(self.expirys);

                //filter for keys of nearest expirys
                var timeKeys = obj.filterKeys(self.expirys, function(T) {
                    return T == self.expiryMin;
                });

                //store distances from filtered strikes to the asset price
                for(var k=0; k<timeKeys.length; k++) {
                    strikeDists[timeKeys[k]] = Math.abs(self.strikePrices[timeKeys[k]]-self.assetPrice);
                }

                //find keys of filtered strikes closest to the money
                var strikeKeys = obj.filterKeys(strikeDists, function(d) {
                    return d == obj.min(strikeDists);
                });

                //store implied volatilities of options at the filtered strikes
                for(var k=0; k<strikeKeys.length; k++) {
                    impliedVols[strikeKeys[k]] = self.impliedVols[strikeKeys[k]];
                }

                //price space standard deviation is the avg of the filtered implied volatilities, adjusted for the nearest trade horizon
                self.standardDeviation = obj.avg(impliedVols)*Math.sqrt(self.expiryMin/365);
            }

            assignStandardDeviation();

            //populate the price array using a range of -3 to +3 standard deviations, which is theoretically 99.73% of possible outcomes
            for(var p=0; p<501; p++) {
                self.priceSpace.push(+(self.assetPrice*(1-(3*self.standardDeviation)*(1-(2*p/500)))).toFixed(2));
            }

            //remove any duplicates from the array
            self.priceSpace = array.unique(self.priceSpace);
        }

        function calculateTempData(t,p) {
            function calc(n) {
                //update model price
                if(self.assetType === "Stock") { S = p } else { F = p }

                e = self.contractTypes[n];
                K = self.strikePrices[n];
                v = self.impliedVols[n];
                r = self.rates[n];
                D = self.yields[n];
                T = (self.expirys[n]-t)/365;
                d1 = mod.d1();
                d2 = d1-v*Math.sqrt(T);

                //price
                self.temp.price[n] = mod.price();
                //greeks
                for(var greek in self.temp.greeks) { self.temp.greeks[greek][n] = mod[greek]() }
            }

            for(var n=1; n<self.legCount+1; n++) { calc(n) }
        }

        function clearTempData() {
            //price
            self.temp.price = {};
            //greeks
            for(var greek in self.temp.greeks) { self.temp.greeks[greek] = {} }
        }

        function storeSurfaceData() {
            //record values spanning the price space at time t
            function getPriceSpaceData(t) {
                for(var p=0; p<self.priceSpace.length; p++) {
                    //calculate new values
                    calculateTempData(t,self.priceSpace[p]);

                    //store new P&L
                    self.data.profit[t][self.priceSpace[p].toFixed(2)] = obj.corr("prod",[self.legMultipliers,obj.corr("sub",[self.temp.price,self.optionPrices])]);
                    //store new greeks
                    for(var greek in self.data.greeks) { self.data.greeks[greek][t][self.priceSpace[p].toFixed(2)] = obj.corr("prod",[self.legMultipliers,self.temp.greeks[greek]]) }

                    //clear old values
                    clearTempData();
                }
            }

            //record values spanning the time space
            function getTimeSpaceData(t,n) {
                for(var t=t; t<=n; t++) {
                    //assign objects to store data at time t
                    self.data.profit[t] = {};
                    for(var greek in self.data.greeks) { self.data.greeks[greek][t] = {} }

                    //all price space data for the current day
                    getPriceSpaceData(t);
                }
            }

            getTimeSpaceData(0,self.expiryMin-1);
            getTimeSpaceData(self.expiryMin-0.5,self.expiryMin-0.5);
            getTimeSpaceData(self.expiryMin,self.expiryMin);
        }

        function main() {
            self.tradeInitialized = true;
            setModel();
            storeIVs();
            createPriceSpace();
            storeSurfaceData();
        }

        main();
        //data visualization callback
        callback();
    }

    //*** instance API
    self.tradeModel = "Black-Scholes";
    self.tradeInitialized = false;
    //user input
    self.assetType = null;
    self.contractMultiplier = null;
    self.legCount = null;
    self.contractSigns = {};
    self.contractTypes = {};
    self.contractCounts = {};
    self.strikePrices = {};
    self.optionPrices = {};
    self.expirys = {};
    self.yields = {};
    self.rates = {};
    self.assetPrice = null;
    //application output
    self.legMultipliers = {};
    self.impliedVols = {};
    self.expiryMin = null;
    self.standardDeviation = null;
    self.priceSpace = [];
    self.temp = { price: {}, greeks: { delta: {}, gamma: {}, theta: {}, vega: {}, rho: {}, vanna: {}, vomma: {}, charm: {}, veta: {} } };
    self.data = { profit: {}, greeks: { delta: {}, gamma: {}, theta: {}, vega: {}, rho: {}, vanna: {}, vomma: {}, charm: {}, veta: {} } };

    if(typeof(self.initialize) !== "function") {
        BlackScholesTrade.prototype.initialize = function(callback) {
            if(!self.tradeInitialized) { storeTradeData(callback) } else { console.log("A trade has already been initialized.") }
        }
    }
}
