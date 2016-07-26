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

    //Extract implied volatility from an option price
    impVol: function(leg, S, method) {

        //local variables
        var type     = g.CONTRACT_TYPE[leg],
            n        = g.NUM_CONTRACTS[leg],
            K        = g.STRIKE_PRICE[leg],
            T        = g.EXPIRY[leg]/365,
            D        = g.DIV_YIELD[leg],
            r        = g.RISK_FREE[leg],
            optPrice = g.OPTION_PRICE[leg],
            bsmPrice = 0;

        switch(method) {

            //The Newton-Raphson method
            case 'Newton-Raphson':

                //case-specific local vars
                var volEst   = 0.2,
                    maxIter  = 15;

                for(j=0; j<maxIter; j++) {

                    //local loop variables
                    var d1      = (Math.log(S/K)+((r-D+(Math.pow(volEst,2)/2))*T))/(volEst*Math.sqrt(T)),
                        d2      = d1-(volEst*Math.sqrt(T)),
                        bsmVega = S*Math.pow(Math.E,-D*T)*math.NORM(d1)*Math.sqrt(T);

                    //option price based on current estimate for implied volatility
                    bsmPrice = type*((S*math.LOGISTIC(type*d1)*Math.pow(Math.E,-D*T))-(K*math.LOGISTIC(type*d2)*Math.pow(Math.E,-r*T)));

                    //return a value if threshold condition is met
                    if(Math.abs(optPrice-bsmPrice) <= Math.pow(10,-2)) { return volEst }

                    //next estimate for implied volatility
                    volEst += (optPrice-bsmPrice)/bsmVega;
                }

                if(j==maxIter) { return false }


            //The Bisection method
            case 'Bisection':

                //console message
                console.log('The Newton-Raphson method did not converge for leg '+leg+'. Now implementing the Bisection method...');

                //case-specific local vars
                var volLow   = 0.01,
                    volHigh  = 2,
                    maxIter  = 50;

                for(j=0; j<maxIter; j++) {

                    //local loop variables
                    var volEst = (volLow+volHigh)/2,
                        d1     = (Math.log(S/K)+((r-D+(Math.pow(volEst,2)/2))*T))/(volEst*Math.sqrt(T)),
                        d2     = d1-(volEst*Math.sqrt(T));

                    //option price based on current estimate for implied volatility
                    bsmPrice = type*((S*math.LOGISTIC(type*d1)*Math.pow(Math.E,-D*T))-(K*math.LOGISTIC(type*d2)*Math.pow(Math.E,-r*T)));

                    //next estimate for implied volatility
                    switch(Math.sign(optPrice-bsmPrice)) {

                        case 1:
                            volLow  = volEst;
                            break;

                        case -1:
                            volHigh = volEst;
                            break;
                    }

                    //return a value if threshold condition is met
                    if(Math.abs(volLow-volHigh) <= Math.pow(10,-6)) { return volEst }
                }
        }
    },


    //Determine a single IV which will be used to build the stock price space
    sRangeVol: function() {

        //local vars
        var eKeys      = [],
            kDists     = {},
            kDistsKeys = [],
            vols       = {};

        eKeys = obj.filterKeys(g.EXPIRY, function(time) { return time == obj.min(g.EXPIRY) }); //keys of nearest expirys

        for(i=0; i<eKeys.length; i++) { kDists[eKeys[i]] = Math.abs(g.STRIKE_PRICE[eKeys[i]]-g.STOCK_PRICE) } //distances from strikes to the stock price

        kDistsKeys = obj.filterKeys(kDists, function(dist) { return dist == obj.min(kDists) }); //keys of strikes 'nearest-to-the-money'

        for(j=0; j<kDistsKeys.length; j++) { vols[kDistsKeys[j]] = g.IMPLIED_VOL[kDistsKeys[j]] } //IV's of the options at the desired strikes

        //return a simple average of the IV's adjusted for the nearest trade horizon
        return obj.avg(vols)*Math.sqrt(obj.min(g.EXPIRY)/365);
    },


    //Option price and greeks for the overall trade relative to a given time and stock price
    calc: function(t, S) {

        for(i=1; i<g.TRADE_LEGS+1; i++) {

            //local variables
            var signN = g.LONG_SHORT[i]*g.NUM_CONTRACTS[i],
                type  = g.CONTRACT_TYPE[i],
                K     = g.STRIKE_PRICE[i],
                tau   = (g.EXPIRY[i]-t)/365,
                D     = g.DIV_YIELD[i],
                r     = g.RISK_FREE[i],
                vol   = g.IMPLIED_VOL[i],
                d1    = (Math.log(S/K)+((r-D+(Math.pow(vol,2)/2))*tau))/(vol*Math.sqrt(tau)),
                d2    = d1-(vol*Math.sqrt(tau));

            //price
            this.price[i] = Math.round((signN*type*((S*math.LOGISTIC(type*d1)*Math.pow(Math.E,-D*tau))-(K*math.LOGISTIC(type*d2)*Math.pow(Math.E,-r*tau))))*10000)/100;

            //greeks
            this.delta[i] = Math.round((signN*type*Math.pow(Math.E,-D*tau)*math.LOGISTIC(type*d1))*10000)/100;

            this.gamma[i] = Math.round((signN*(Math.pow(Math.E,-D*tau)*math.NORM(d1))/(S*vol*Math.sqrt(tau)))*10000)/100;

            this.theta[i] = Math.round((signN*((S*Math.pow(Math.E,-D*tau)*(D*type*math.LOGISTIC(type*d1)))-(K*Math.pow(Math.E,-r*tau)*((r*type*math.LOGISTIC(type*d2))+((vol*math.NORM(d2))/(2*Math.sqrt(tau))))))/365)*10000)/100;

            this.vega[i]  = Math.round((signN*(S*Math.pow(Math.E,-D*tau)*math.NORM(d1)*Math.sqrt(tau)))*100)/100;

            this.rho[i]   = Math.round((signN*(type*K*tau*Math.pow(Math.E,-r*tau)*math.LOGISTIC(type*d2)))*100)/100;
        }
    },


    //Compute and store profit/loss and greeks data across a range of stock prices and time 
    data: function(callback) {

        //local variables
        var num    = 500,
            sRange = [],
            vol;

        //calculate and store the IV's of each leg to the global object
        for(i=1; i<g.TRADE_LEGS+1; i++) { g.IMPLIED_VOL[i] = BSM.impVol(i, g.STOCK_PRICE, 'Newton-Raphson') || BSM.impVol(i, g.STOCK_PRICE, 'Bisection') }

        //stock price space IV
        vol = BSM.sRangeVol();

        //create the stock price space using a range of -3 to +3 vols
        for(i=0; i<num+1; i++) { sRange.push(+(g.STOCK_PRICE*(1-(3*vol)*(1-(2*i/num)))).toFixed(2)) } //ROUNDING ISSUE HERE, WORTH TRYING TO FIX?

        //delete any duplicate prices in the stock price array
        sRange = array.unique(sRange);
        //store the new array's length to the global object
        g.STOCKRANGE_LENGTH = sRange.length;

        //calculate current trade values
        BSM.calc(0, g.STOCK_PRICE);

        //store the current price of the trade
        var origPrice = obj.sum(BSM.price);

        //objects for profit/loss and greeks data
        for(j=0; j<=obj.min(g.EXPIRY); j++) {

            g.PROFITLOSS_DATA[j] = {};
            g.DELTA_DATA[j]      = {};
            g.GAMMA_DATA[j]      = {};
            g.THETA_DATA[j]      = {};
            g.VEGA_DATA[j]       = {};
            g.RHO_DATA[j]        = {};

            for(k=0; k<g.STOCKRANGE_LENGTH; k++) {

                //clear old values
                obj.reset(BSM);

                //calculate new values with some basic handling for the edge case at expiry, tau = 0
                if(j!=obj.min(g.EXPIRY)) { BSM.calc(j, sRange[k]) } else { BSM.calc((j-1)+(720/1440), sRange[k]) }

                //store current 'greek' values (for use in the trade summary table) to the global object
                if(j==0 && k==num/2) {

                    ['delta','gamma','theta','vega','rho'].forEach(function(greek) { for(n in BSM[greek]) { g[greek.toUpperCase()][n] = BSM[greek][n] } });
                }

                //store values across time and stock price for graphing
                g.PROFITLOSS_DATA[j][sRange[k].toFixed(2)] = +(obj.sum(BSM.price)-origPrice).toFixed(2); //NEED TO ADD FEES HERE
                g.DELTA_DATA     [j][sRange[k].toFixed(2)] = +(obj.sum(BSM.delta)).toFixed(2);
                g.GAMMA_DATA     [j][sRange[k].toFixed(2)] = +(obj.sum(BSM.gamma)).toFixed(2);
                g.THETA_DATA     [j][sRange[k].toFixed(2)] = +(obj.sum(BSM.theta)).toFixed(2);
                g.VEGA_DATA      [j][sRange[k].toFixed(2)] = +(obj.sum(BSM.vega)).toFixed(2);
                g.RHO_DATA       [j][sRange[k].toFixed(2)] = +(obj.sum(BSM.rho)).toFixed(2);
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
