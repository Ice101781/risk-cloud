//The Black-Scholes-Merton model for valuing multi-leg European-style options which pay a continuous dividend yield
BSM = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    price: 0,
    
    greeks: {},


    //The Newton-Raphson method for extracting implied volatility from market option prices
    vols: function(S) {

        for(var i=0; i<g.TRADE_LEGS; i++) {

            var type = g.CONTRACT_TYPE[i+1],
                n = g.NUM_CONTRACTS[i+1],
                K = g.STRIKE_PRICE[i+1],
                T = +(g.EXPIRY[i+1]/365).toFixed(6),
                D = g.DIV_YIELD[i+1],
                r = g.RISK_FREE[i+1],
                optPrice = g.OPTION_PRICE[i+1],
                bsmPrice = 0,
                volEst = 0.2;

            while(Math.abs(optPrice-bsmPrice)>0.01) {

                var d1 = (Math.log(S/K)+((r-D+(Math.pow(volEst,2)/2))*T))/(volEst*Math.sqrt(T)),
                    d2 = d1-(volEst*Math.sqrt(T)),
                    bsmVega = S*Math.pow(Math.E,-D*T)*math.NORM(d1)*Math.sqrt(T);

                bsmPrice = type*((S*math.CUSTNORM(type*d1)*Math.pow(Math.E,-D*T))-(K*math.CUSTNORM(type*d2)*Math.pow(Math.E,-r*T)));

                volEst += (optPrice-bsmPrice)/bsmVega;
            }

            //round and store implied volatility
            g.IMPLIED_VOL[i+1] = +volEst.toFixed(6);
        }
    },


    calc: function(t, S) {

        //convert number of days to a rounded fractional year
        var t = +(t/365).toFixed(6);

        for(var i=0; i<g.TRADE_LEGS; i++) {

            var signN = g.LEG_SIGN[i+1]*g.NUM_CONTRACTS[i+1],
                type = g.CONTRACT_TYPE[i+1],
                K = g.STRIKE_PRICE[i+1],
                T = +(g.EXPIRY[i+1]/365).toFixed(6),
                D = g.DIV_YIELD[i+1],
                r = g.RISK_FREE[i+1],
                vol = g.IMPLIED_VOL[i+1],
                d1 = (Math.log(S/K)+((r-D+(Math.pow(vol,2)/2))*(T-t)))/(vol*Math.sqrt(T-t)),
                d2 = d1-(vol*Math.sqrt(T-t));

            //option price
            this.price += signN*type*((S*math.CUSTNORM(type*d1)*Math.pow(Math.E,-D*(T-t)))-(K*math.CUSTNORM(type*d2)*Math.pow(Math.E,-r*(T-t))));

            //option greeks
            this.greeks = obj.size(this.greeks) !== 0 ? this.greeks : {delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0};

                this.greeks.delta += signN*type*Math.pow(Math.E,-D*(T-t))*math.CUSTNORM(type*d1);

                this.greeks.gamma += signN*(Math.pow(Math.E,-D*(T-t))*math.NORM(d1))/(S*vol*Math.sqrt(T-t));

                this.greeks.theta += signN*((S*Math.pow(Math.E,-D*(T-t))*(D*type*math.CUSTNORM(type*d1)))
                                           -(K*Math.pow(Math.E,-r*(T-t))*((r*type*math.CUSTNORM(type*d2))+((vol*math.NORM(d2))/(2*Math.sqrt(T-t))))))/365;

                this.greeks.vega += signN*(S*Math.pow(Math.E,-D*(T-t))*math.NORM(d1)*Math.sqrt(T-t))/100;

                this.greeks.rho += signN*(type*K*(T-t)*Math.pow(Math.E,-r*(T-t))*math.CUSTNORM(type*d2))/100;
        }

        //rounding
        this.price = Math.round(this.price*10000)/10000;
        for(greek in this.greeks) { this.greeks[greek] = Math.round(this.greeks[greek]*1000000)/1000000 }
    },


    //Compute and store profit/loss and greeks data across a range of stock prices and time 
    data: function() {

        //calculate implied volatilities
        BSM.vols(g.STOCK_PRICE);

        var expMin = obj.min(g.EXPIRY),
            volMax = +(obj.max(g.IMPLIED_VOL)*Math.sqrt(expMin/365)).toFixed(6),
            sRange = [],
            num = 500;

        //populate an array containing stock prices in a range of +-(3*volMax), then delete any duplicate prices - DOES NOT GUARANTEE EQUIDISTANT PRICES
        for(i=0; i<num; i++) { sRange.push(+(g.STOCK_PRICE*(1-(3*volMax)*(1-(2*i/num)))).toFixed(2)) }

        sRange = array.unique(sRange);

        //calculate the trade value on the first day of the trade
        BSM.calc(0, g.STOCK_PRICE);

        var origPrice = BSM.price;

        //objects for profit/loss and greeks data
        (function(callback) {

            for(j=0; j<expMin; j++) {

                g.PROFITLOSS_DATA[j] = {};
                g.DELTA_DATA[j] = {};
                g.GAMMA_DATA[j] = {};
                g.THETA_DATA[j] = {};
                g.VEGA_DATA[j] = {};
                g.RHO_DATA[j] = {};

                for(k=0; k<num; k++) {

                    //clear old values and calculate current values
                    obj.reset(BSM);
                    BSM.calc(j, sRange[k]);

                    //store current values
                    g.PROFITLOSS_DATA[j][k] = Math.round((BSM.price-origPrice)*10000)/100;// <--- NEED TO ADD FEES HERE
                    g.DELTA_DATA[j][k] = Math.round(BSM.greeks.delta*10000)/100;
                    g.GAMMA_DATA[j][k] = Math.round(BSM.greeks.gamma*10000)/100;
                    g.THETA_DATA[j][k] = Math.round(BSM.greeks.theta*10000)/100;
                    g.VEGA_DATA[j][k] = Math.round(BSM.greeks.vega*10000)/100;
                    g.RHO_DATA[j][k] = Math.round(BSM.greeks.rho*10000)/100;

                    //on the last day, export the expected range of stock prices over the life of the trade
                    if(j == expMin-1) { g.STOCK_RANGE[k] = sRange[k] }

                    //callback
                    if(typeof callback === 'function') { callback() }

                    //testing
                    //console.log();
                }
            }
        })();

        //clear function values
        obj.reset(BSM);

        //testing
        console.log(g.STOCK_RANGE, g.PROFITLOSS_DATA);
    }
})
