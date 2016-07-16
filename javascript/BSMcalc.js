//The Black-Scholes-Merton model for valuing multi-leg European-style options which pay a continuous dividend yield
BSM = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    //Objects to store theoretical option prices and the 'greeks'
    price: {},

    delta: {},

    gamma: {},

    theta: {},

    vega:  {},

    rho:   {},

    //The Newton-Raphson method to extract implied volatility from market option prices
    newtRaph: function(leg, S) {

        //local variables
        var type     = g.CONTRACT_TYPE[leg],
            n        = g.NUM_CONTRACTS[leg],
            K        = g.STRIKE_PRICE[leg],
            T        = g.EXPIRY[leg]/365,
            D        = g.DIV_YIELD[leg],
            r        = g.RISK_FREE[leg],
            optPrice = g.OPTION_PRICE[leg],
            bsmPrice = 0,
            volEst   = 0.2,
            maxIter  = 15;

        for(var j=0; j<maxIter; j++) {

            //local loop variables
            var d1      = (Math.log(S/K)+((r-D+(Math.pow(volEst,2)/2))*T))/(volEst*Math.sqrt(T)),
                d2      = d1-(volEst*Math.sqrt(T)),
                bsmVega = S*Math.pow(Math.E,-D*T)*math.NORM(d1)*Math.sqrt(T);

            //option price based on current estimate for implied volatility
            bsmPrice = type*((S*math.LOGISTIC(type*d1)*Math.pow(Math.E,-D*T))-(K*math.LOGISTIC(type*d2)*Math.pow(Math.E,-r*T)));

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
        var type     = g.CONTRACT_TYPE[leg],
            n        = g.NUM_CONTRACTS[leg],
            K        = g.STRIKE_PRICE[leg],
            T        = g.EXPIRY[leg]/365,
            D        = g.DIV_YIELD[leg],
            r        = g.RISK_FREE[leg],
            optPrice = g.OPTION_PRICE[leg],
            bsmPrice = 0,
            volLow   = 0.01,
            volHigh  = 2,
            maxIter  = 50;

        for(var j=0; j<maxIter; j++) {

            //local loop variables
            var volMid = (volLow+volHigh)/2,
                d1     = (Math.log(S/K)+((r-D+(Math.pow(volMid,2)/2))*T))/(volMid*Math.sqrt(T)),
                d2     = d1-(volMid*Math.sqrt(T));

            //option price based on current estimate for implied volatility
            bsmPrice = type*((S*math.LOGISTIC(type*d1)*Math.pow(Math.E,-D*T))-(K*math.LOGISTIC(type*d2)*Math.pow(Math.E,-r*T)));

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
            var signN = g.LONG_SHORT[i+1]*g.NUM_CONTRACTS[i+1],
                type  = g.CONTRACT_TYPE[i+1],
                K     = g.STRIKE_PRICE[i+1],
                tau   = (g.EXPIRY[i+1]-t)/365,
                D     = g.DIV_YIELD[i+1],
                r     = g.RISK_FREE[i+1],
                vol   = g.IMPLIED_VOL[i+1],
                d1    = (Math.log(S/K)+((r-D+(Math.pow(vol,2)/2))*tau))/(vol*Math.sqrt(tau)),
                d2    = d1-(vol*Math.sqrt(tau));

            //price
            this.price[i+1] = Math.round((signN*type*((S*math.LOGISTIC(type*d1)*Math.pow(Math.E,-D*tau))-(K*math.LOGISTIC(type*d2)*Math.pow(Math.E,-r*tau))))*10000)/100;

            //greeks
            this.delta[i+1] = Math.round((signN*type*Math.pow(Math.E,-D*tau)*math.LOGISTIC(type*d1))*10000)/100;

            this.gamma[i+1] = Math.round((signN*(Math.pow(Math.E,-D*tau)*math.NORM(d1))/(S*vol*Math.sqrt(tau)))*10000)/100;

            this.theta[i+1] = Math.round((signN*((S*Math.pow(Math.E,-D*tau)*(D*type*math.LOGISTIC(type*d1)))-(K*Math.pow(Math.E,-r*tau)*((r*type*math.LOGISTIC(type*d2))+((vol*math.NORM(d2))/(2*Math.sqrt(tau))))))/365)*10000)/100;

            this.vega[i+1]  = Math.round((signN*(S*Math.pow(Math.E,-D*tau)*math.NORM(d1)*Math.sqrt(tau)))*100)/100;

            this.rho[i+1]   = Math.round((signN*(type*K*tau*Math.pow(Math.E,-r*tau)*math.LOGISTIC(type*d2)))*100)/100;
        }
    },


    //Compute and store profit/loss and greeks data across a range of stock prices and time 
    data: function(callback) {

        //calculate implied volatilities
        for(var i=0; i<g.TRADE_LEGS; i++) { g.IMPLIED_VOL[i+1] = BSM.newtRaph(i+1, g.STOCK_PRICE) || BSM.bisect(i+1, g.STOCK_PRICE) }

        //local variables
        var tradeVol = obj.max(g.IMPLIED_VOL)*Math.sqrt(obj.min(g.EXPIRY)/365),
            sRange   = [],
            num      = 500;

        //populate an array containing stock prices in a range of +-(3*tradeVol)
        for(i=0; i<num+1; i++) { sRange.push(+(g.STOCK_PRICE*(1-(3*tradeVol)*(1-(2*i/num)))).toFixed(2)) } //ROUNDING ISSUE HERE, WORTH TRYING TO FIX?

        //delete any duplicate prices in the stock price array
        sRange = array.unique(sRange);

        //calculate current trade values
        BSM.calc(0, g.STOCK_PRICE);

        //store the current price of the trade
        var origPrice = obj.sum(BSM.price);

        //objects for profit/loss and greeks data
        for(j=0; j<=obj.min(g.EXPIRY); j++) {

            g.PROFITLOSS_DATA[j] = {};
            g.DELTA_DATA[j] = {};
            g.GAMMA_DATA[j] = {};
            g.THETA_DATA[j] = {};
            g.VEGA_DATA[j] = {};
            g.RHO_DATA[j] = {};

            for(k=0; k<num+1; k++) {

                //clear old values
                obj.reset(BSM);

                //calculate new values, handle edge case at expiry when tau = 0
                if(j!=obj.min(g.EXPIRY)) { BSM.calc(j, sRange[k]) } else { BSM.calc((j-1)+(1415/1440), sRange[k]) }

                //store current 'greek' values for the trade summary to the global object
                if(j==0 && k==num/2) { 

                    ['delta','gamma','theta','vega','rho'].forEach(function(greek) { for(n in BSM[greek]) { g[greek.toUpperCase()][n] = BSM[greek][n] } });
                }

                //store values across time and stock price for graphing
                g.PROFITLOSS_DATA[j][sRange[k].toFixed(2)] = +(obj.sum(BSM.price)-origPrice).toFixed(2); //NEED TO ADD FEES HERE
                g.DELTA_DATA[j][sRange[k].toFixed(2)] = +(obj.sum(BSM.delta)).toFixed(2);
                g.GAMMA_DATA[j][sRange[k].toFixed(2)] = +(obj.sum(BSM.gamma)).toFixed(2);
                g.THETA_DATA[j][sRange[k].toFixed(2)] = +(obj.sum(BSM.theta)).toFixed(2);
                g.VEGA_DATA[j][sRange[k].toFixed(2)] = +(obj.sum(BSM.vega)).toFixed(2);
                g.RHO_DATA[j][sRange[k].toFixed(2)] = +(obj.sum(BSM.rho)).toFixed(2);
            }
        }

        //clear values
        obj.reset(BSM);

        //data visualization callback
        if(typeof callback === 'function') { callback() }

        //display the global object in the console
        console.log(g);
    }
})
