"use strict";

// OBJECTS, ARRAYS AND ELEMENTS =====================================================================================================================

//object functions
var obj = function(properties) {

    var self = function() { return };

    for(var prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    //reset parameter values in an object
    reset: function(obj) {

        for(var ele in obj) {

            switch(typeof obj[ele]) {

                case 'number':
                    obj[ele] = 0;
                    break;

                case 'object':
                    obj[ele] = {};
                    break;
            }
        }
    },


    //object size - thanks to 'James Coglan' on stackoverflow.com for this
    size: function(obj) {

        var crd = 0;

        for(var key in obj) { if(obj.hasOwnProperty(key)) { crd++ } }

        return crd;
    },


    //object values sum
    sum: function(obj) {

        //thanks to 'Sirko' on stackoverflow.com for this
        return Object.keys(obj).reduce(function(s,key) { return s + obj[key] }, 0);
    },


    //object values average
    avg: function(obj) {

        return this.sum(obj)/this.size(obj);
    },


    //object min and max - thanks to 'levi' on stackoverflow.com for this
    min: function(obj) {

        return Object.keys(obj).reduce(function(m,n) { return obj[n] < m ? obj[n] : m }, Infinity);
    },

    max: function(obj) {
        
        return Object.keys(obj).reduce(function(m,n) { return obj[n] > m ? obj[n] : m }, -Infinity);
    },


    //given two sets, define a range of values depending on the signs of the max and min of the merged set
    range: function(obj) {

        //local vars
        var max = this.max(array.merge(obj)),
            min = this.min(array.merge(obj));

        if(Math.sign(max) == 1 && Math.sign(min) == 1) {

            return max;

        } else if(Math.sign(max) == -1 && Math.sign(min) == -1) {

            return Math.abs(min);

        } else { return max - min }
    },


    //return all keys of an object whose properties meet a given condition
    filterKeys: function(obj, test) {

        var keys = [];

        for(var key in obj) { if(test(obj[key])) { keys.push(key) } }

        return keys;
    }
})


//array functions
var array = function(properties) {

    var self = function() { return };

    for(var prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    //remove duplicate elements from an array - thanks to 'georg' on stackoverflow.com for this 
    unique: function(arr) {

        return arr.filter(function(ele, index) { return arr.indexOf(ele) == index });
    },


    //merge all elements of arrays OR properties of objects; return an array
    merge: function(arr) {

        var merged = [];

        for(var i=0; i<obj.size(arr); i++) {

            for(var j=0; j<obj.size(arr[i]); j++) { merged.push( arr[i][Object.keys(arr[i])[j]] ) }
        }

        //remove duplicate elements
        return this.unique(merged);
    }
})


//HTML element functions
var elem = function(properties) {

    var self = function() { return };

    for(var prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    //selection
    select: function(str) {

        return document.getElementById(str) || document.querySelector(str);
    },


    //disable or enable an element
    avail: function(ele, bool) {

        this.select(ele).disabled = !bool;
    },


    //creation
    create: function(obj, par) {

        //create a new document element
        var ele = document.createElement(obj.tag);

        //add empty string as content if none is provided
        if(typeof obj.content === 'undefined') { obj.content = "" }

        ele.appendChild(document.createTextNode(obj.content));

        //add attributes
        for(var attr in obj.attributes) { ele.setAttribute(attr, obj.attributes[attr]) }

        //append the new element to a parent element
        this.select(par).appendChild(ele);

        return ele;
    },


    //remove children from an element of the DOM
    destroyChildren: function(par, chd) {

        var parent   = this.select(par),
            children = typeof chd !== 'undefined' ? chd : 'none specified';

        switch(children) {

            //remove all children - thanks to Gabriel McAdams on stackoverflow.com for this
            case 'none specified':
                while(parent.firstChild) { parent.removeChild(parent.firstChild) }
                break;

            //remove specified children
            default:
                for(var i=0; i<children.length; i++) { parent.removeChild(this.select(children[i])) }
                break;
        }
    },


    //transition animations
    ease: function(type, str, inc, mht, callback) {

        var ele = this.select(str).style,
            hgt = 0,
            tmr = setInterval(render, (1000/50)); //50 fps

        function render() {

            hgt = (mht-hgt > 0) ? hgt + inc : mht;

            if(hgt == mht) {

                clearInterval(tmr);

                if(typeof callback === 'function') { callback() }

            } else {

                hgt += inc;

                if(type == "in") { ele.height = hgt + 'vw' } else if(type == "out") { ele.height = mht - hgt + 'vw' }
            }
        }
    },

    fade: function(type, str, inc, callback) {

        var ele = this.select(str).style,
            opc = 0,
            tmr = setInterval(render, (1000/50)); //50 fps

        function render() {

            opc = (1-opc > 0) ? opc + inc : 1;

            if(opc == 1) {

                clearInterval(tmr);

                if(typeof callback === 'function') { callback() }

            } else {

                opc += inc;

                if(type == "in") { ele.opacity = opc } else if(type == "out") { ele.opacity = 1 - opc }
            }
        }
    }
})

//END OBJECTS, ARRAYS AND ELEMENTS ==================================================================================================================


// MATH =============================================================================================================================================

var math = function(properties) {
    
    var self = function() { return };

    for(var prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    //compute integrals numerically using Simpson's rule
    INTEGRAL: function(lBnd, rBnd, subs, expr) { // <--- THIS FUNCTION NOT CURRENTLY IN USE

        var a = lBnd,
            b = rBnd,
            n = subs,
            f = expr;

        if(n % 2 == 0) {

            var sum1 = 0,
                sum2 = 0;

            for(var i=1; i<(n/2);   i++) { sum1 += f(((((n/2)-i)*a)+(i*b))/(n/2)) }

            for(var i=1; i<(n/2)+1; i++) { sum2 += f((((((n+1)/2)-i)*a)+((i-(1/2))*b))/(n/2)) }

            return ((b-a)/(3*n))*(f(a)+(2*sum1)+(4*sum2)+f(b));

        } else {

            //some basic error handling
            return "The number of sub-intervals, 'n', must be even.";
        }
    },


    //standard Normal Distribution PDF
    NORM: function(x) {

        return (1/Math.sqrt(2*Math.PI))*Math.pow(Math.E,(-1/2)*Math.pow(x,2));
    },


    //cumulative standard Normal Distribution functions
    CUSTNORM: function(z, n) { // <--- THIS FUNCTION NOT CURRENTLY IN USE

        //this method is far slower than the logistic approximation below; n >= 200 is necessary for reasonable accuracy in most trade setups
        switch(b<0) {

            case true:
                return (1/2)-this.INTEGRAL(z, 0, n, this.NORM);
                break;

            case false:
                return (1/2)+this.INTEGRAL(0, z, n, this.NORM);
                break;
        }
    },

    //logistic approximation - thanks to http://http://www.jiem.org/index.php/jiem/article/viewFile/60/27 for this
    LOGISTIC: function(z) {

        return Math.pow((1+Math.pow(Math.E,-(0.07056*Math.pow(z,3)+1.5976*z))),-1);
    }
})

// END MATH =========================================================================================================================================


// MISC =============================================================================================================================================

//disable certain keys
var disableKey = function(key) {

    var block = function(e) { if((e.keyCode || e.charCode) == key) {e.preventDefault()} }

    document.addEventListener('keydown', block);

    //required for certain keys in Firefox; i.e., the spacebar
    document.addEventListener('keyup', block);
}

// END MISC =========================================================================================================================================
