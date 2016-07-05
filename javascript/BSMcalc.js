//The Black-Scholes-Merton model for valuing multi-leg European-style options which pay a continuous dividend yield
BSM = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    price: 0,

    greeks: {},

    //The Newton-Raphson method to extract implied volatility from market option prices
    newtRaph: function(leg, S) {

        //local variables
        var type = g.CONTRACT_TYPE[leg],
            n = g.NUM_CONTRACTS[leg],
            K = g.STRIKE_PRICE[leg],
            T = g.EXPIRY[leg]/365,
            D = g.DIV_YIELD[leg],
            r = g.RISK_FREE[leg],
            optPrice = g.OPTION_PRICE[leg],
            bsmPrice = 0,
            volEst = 0.2,
            maxIter = 15;

        for(var j=0; j<maxIter; j++) {

            //local loop variables
            var d1 = (Math.log(S/K)+((r-D+(Math.pow(volEst,2)/2))*T))/(volEst*Math.sqrt(T)),
                d2 = d1-(volEst*Math.sqrt(T)),
                bsmVega = S*Math.pow(Math.E,-D*T)*math.NORM(d1)*Math.sqrt(T);

            //option price based on current estimate for implied volatility
            bsmPrice = type*((S*math.CUSTNORM(type*d1)*Math.pow(Math.E,-D*T))-(K*math.CUSTNORM(type*d2)*Math.pow(Math.E,-r*T)));

            //check if error is within threshold
            if(Math.abs(optPrice-bsmPrice)<=0.01) { return +volEst.toFixed(6) }

            //next estimate for implied volatility
            volEst += (optPrice-bsmPrice)/bsmVega;
        }

        if(j==maxIter) { return false }
    },


    //The Bisection method to extract implied volatility from market option prices
    bisect: function(leg, S) {

        //console message
        console.log('The Newton-Raphson method did not converge for leg '+leg+'. Now implementing the Bisection method...');

        //local variables
        var type = g.CONTRACT_TYPE[leg],
            n = g.NUM_CONTRACTS[leg],
            K = g.STRIKE_PRICE[leg],
            T = g.EXPIRY[leg]/365,
            D = g.DIV_YIELD[leg],
            r = g.RISK_FREE[leg],
            optPrice = g.OPTION_PRICE[leg],
            bsmPrice = 0,
            volLow = 0.01,
            volHigh = 2;
            maxIter = 50;

        for(var j=0; j<maxIter; j++) {

            //local loop variables
            var volMid = (volLow+volHigh)/2,
                d1 = (Math.log(S/K)+((r-D+(Math.pow(volMid,2)/2))*T))/(volMid*Math.sqrt(T)),
                d2 = d1-(volMid*Math.sqrt(T));
            
            //option price based on current estimate for implied volatility
            bsmPrice = type*((S*math.CUSTNORM(type*d1)*Math.pow(Math.E,-D*T))-(K*math.CUSTNORM(type*d2)*Math.pow(Math.E,-r*T)));

            //next estimate for implied volatility
            switch(Math.sign(optPrice-bsmPrice)) {

                case 1:
                    volLow = volMid;
                    break;

                case -1:
                    volHigh = volMid;
                    break;
            }

            //check if error is within threshold
            if(Math.abs(volLow-volHigh)<=0.000001) { return +volMid.toFixed(6) }
        }
    },


    //Option price and greeks for the overall trade relative to a given time and stock price
    calc: function(t, S) {

        for(var i=0; i<g.TRADE_LEGS; i++) {

            //local variables
            var signN = g.LEG_SIGN[i+1]*g.NUM_CONTRACTS[i+1],
                type = g.CONTRACT_TYPE[i+1],
                K = g.STRIKE_PRICE[i+1],
                tau = (g.EXPIRY[i+1]-t)/365,
                D = g.DIV_YIELD[i+1],
                r = g.RISK_FREE[i+1],
                vol = g.IMPLIED_VOL[i+1],
                d1 = (Math.log(S/K)+((r-D+(Math.pow(vol,2)/2))*tau))/(vol*Math.sqrt(tau)),
                d2 = d1-(vol*Math.sqrt(tau));

            //price
            this.price += signN*type*((S*math.CUSTNORM(type*d1)*Math.pow(Math.E,-D*tau))-(K*math.CUSTNORM(type*d2)*Math.pow(Math.E,-r*tau)));

            //greeks
            this.greeks = obj.size(this.greeks) !== 0 ? this.greeks : {delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0};

                this.greeks.delta += signN*type*Math.pow(Math.E,-D*tau)*math.CUSTNORM(type*d1);

                this.greeks.gamma += signN*(Math.pow(Math.E,-D*tau)*math.NORM(d1))/(S*vol*Math.sqrt(tau));

                this.greeks.theta += signN*((S*Math.pow(Math.E,-D*tau)*(D*type*math.CUSTNORM(type*d1)))
                                           -(K*Math.pow(Math.E,-r*tau)*((r*type*math.CUSTNORM(type*d2))+((vol*math.NORM(d2))/(2*Math.sqrt(tau))))))/365;

                this.greeks.vega += signN*(S*Math.pow(Math.E,-D*tau)*math.NORM(d1)*Math.sqrt(tau))/100;

                this.greeks.rho += signN*(type*K*tau*Math.pow(Math.E,-r*tau)*math.CUSTNORM(type*d2))/100;
        }

        //rounding
        this.price = Math.round(this.price*10000)/10000;
        for(greek in this.greeks) { this.greeks[greek] = Math.round(this.greeks[greek]*1000000)/1000000 }
    },


    //Compute and store profit/loss and greeks data across a range of stock prices and time 
    data: function(callback) {

        //calculate implied volatilities
        for(var i=0; i<g.TRADE_LEGS; i++) { g.IMPLIED_VOL[i+1] = BSM.newtRaph(i+1, g.STOCK_PRICE) || BSM.bisect(i+1, g.STOCK_PRICE) }

        //local variables
        var expMin = obj.min(g.EXPIRY),
            volMax = obj.max(g.IMPLIED_VOL)*Math.sqrt(expMin/365),
            sRange = [],
            num = 500;

        //populate an array containing stock prices in a range of +-(3*volMax)
        for(i=0; i<num; i++) { sRange.push(+(g.STOCK_PRICE*(1-(3*volMax)*(1-(2*i/(num-1))))).toFixed(2)) } //MINOR ROUNDING ISSUE HERE - WORTH TRYING TO FIX?

        //delete any duplicate prices in the stock price array
        sRange = array.unique(sRange);

        //calculate current trade values
        BSM.calc(0, g.STOCK_PRICE);

        //store the price of the trade at the time of transaction
        var origPrice = BSM.price;

        //objects for profit/loss and greeks data
        for(j=0; j<=expMin; j++) {

            g.PROFITLOSS_DATA[j] = {};
            g.DELTA_DATA[j] = {};
            g.GAMMA_DATA[j] = {};
            g.THETA_DATA[j] = {};
            g.VEGA_DATA[j] = {};
            g.RHO_DATA[j] = {};

            for(k=0; k<num; k++) {

                //clear old values
                obj.reset(BSM);

                //calculate new values with some basic handling for the edge case at expiry
                if(j!=expMin) { BSM.calc(j, sRange[k]) } else { BSM.calc(j*.99, sRange[k]) }

                //store current values
                g.PROFITLOSS_DATA[j][sRange[k].toFixed(2)] = Math.round((BSM.price-origPrice)*10000)/100;// <--- NEED TO ADD FEES HERE
                g.DELTA_DATA[j][sRange[k].toFixed(2)] = Math.round(BSM.greeks.delta*10000)/100;
                g.GAMMA_DATA[j][sRange[k].toFixed(2)] = Math.round(BSM.greeks.gamma*10000)/100;
                g.THETA_DATA[j][sRange[k].toFixed(2)] = Math.round(BSM.greeks.theta*10000)/100;
                g.VEGA_DATA[j][sRange[k].toFixed(2)] = Math.round(BSM.greeks.vega*10000)/100;
                g.RHO_DATA[j][sRange[k].toFixed(2)] = Math.round(BSM.greeks.rho*10000)/100;

                //testing
                //console.log();
            }
        }

        //clear values
        obj.reset(BSM);

        //data visualization callback
        if(typeof callback === 'function') { callback() }

        //testing
        console.log(g);
    }
})
