"use strict";

// MATH =============================================================================================================================================

var math = function(properties) {
    var self = function() { return };

    for(var prop in properties) { self[prop] = properties[prop] }
    return self;
}({
    //standard Normal Distribution probability density function
    NORM: function(x) {
        return (1/Math.sqrt(2*Math.PI))*Math.pow(Math.E,(-1/2)*Math.pow(x,2));
    },

    //logistic approximation to the cumulative standard Normal Distribution function - thanks to http://http://www.jiem.org/index.php/jiem/article/viewFile/60/27
    CUMNORM: function(z) {
        return Math.pow((1+Math.pow(Math.E,-(0.07056*Math.pow(z,3)+1.5976*z))),-1);
    }
});

// END MATH =========================================================================================================================================

// OBJECTS, ARRAYS AND ELEMENTS =====================================================================================================================

//object functions
var obj = function(properties) {
    var self = function() { return };

    for(var prop in properties) { self[prop] = properties[prop] }
    return self;
}({
    //clear values
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

    //thanks to 'James Coglan' on stackoverflow.com
    size: function(obj) {
        var crd = 0;

        for(var key in obj) { if(obj.hasOwnProperty(key)) { crd++ } }

        return crd;
    },

    //sum of all values
    sum: function(obj) {
        //thanks to 'Sirko' on stackoverflow.com
        return Object.keys(obj).reduce(function(s,key) { return +(s+obj[key]).toFixed(2) }, 0);
    },

    //average of all values
    avg: function(obj) {
        return this.sum(obj)/this.size(obj);
    },

    //performs an operation on all corresponding values of an array of 'm' objects and returns a new object with the result
    corr: function(op, arr) {
        var obj = {};

        for(var m=0; m<arr.length; m++) {
            for(var n in arr[0]) {
                if(m==0) {
                    obj[n] = arr[m][n];
                } else {
                    switch(op) {
                        case "sub":
                            obj[n] -= arr[m][n];
                            break;
                        case "prod":
                            obj[n] *= arr[m][n];
                            break;
                    }
                }
            }
        }

        return obj;
    },

    //thanks to 'levi' on stackoverflow.com
    min: function(obj) {
        return Object.keys(obj).reduce(function(m,n) { return obj[n] < m ? obj[n] : m }, Infinity);
    },

    max: function(obj) {
        return Object.keys(obj).reduce(function(m,n) { return obj[n] > m ? obj[n] : m }, -Infinity);
    },

    //given two sets, define a range of values depending on the signs of the max and min of the merged set
    range: function(obj) {
        var max = this.max(array.merge(obj)),
            min = this.min(array.merge(obj));

        if(Math.sign(max) == 1 && Math.sign(min) == 1) {
            return max;
        } else if(Math.sign(max) == -1 && Math.sign(min) == -1) {
            return Math.abs(min);
        } else {
            return max - min;
        }
    },

    //return all keys of an object whose properties meet a given condition
    filterKeys: function(obj, test) {
        var keys = [];

        for(var key in obj) { if(test(obj[key])) { keys.push(key) } }

        return keys;
    }
});

//array functions
var array = function(properties) {
    var self = function() { return };

    for(var prop in properties) { self[prop] = properties[prop] }
    return self;
}({
    //remove duplicate elements - thanks to 'georg' on stackoverflow.com
    unique: function(arr) {
        return arr.filter(function(ele, index) { return arr.indexOf(ele) == index });
    },

    //merge sums of object values between multiple arrays or objects, return an array of unique sums
    merge: function(arr) {
        var merged = [];

        for(var i=0; i<obj.size(arr); i++) {
            for(var j=0; j<obj.size(arr[i]); j++) {
                merged.push( obj.sum(arr[i][Object.keys(arr[i])[j]]) );
            }
        }

        //remove duplicates
        return this.unique(merged);
    }
});

//HTML element functions
var elem = function(properties) {
    var self = function() { return };

    for(var prop in properties) { self[prop] = properties[prop] }
    return self;
}({
    select: function(str) {
        return document.getElementById(str) || document.querySelector(str);
    },

    //disable or enable an element
    avail: function(ele, bool) {
        this.select(ele).disabled = !bool;
    },

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
            //remove all children - thanks to Gabriel McAdams on stackoverflow.com
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
});

//END OBJECTS, ARRAYS AND ELEMENTS ==================================================================================================================

// NAVIGATION MENU ==================================================================================================================================

var nav = function(properties) {
    var self = function() { return };

    for(var prop in properties) { self[prop] = properties[prop] }
    return self;
}({
    create: function() {
        //main header container
        elem.create({tag: "div", attributes: {id: "header-main"}}, ".body");
        //icon link
        elem.create({tag: "a", attributes: {id: "icon-link", href: "../"}}, "header-main");
        //icon image
        elem.create({tag: "img", attributes: {id: "icon", alt: "Risk Cloud", src: "../images/icon.png"}}, "icon-link");

        var mainMenu = (function() {
            var headings = {
                1: "MODEL",
                2: "INFO",
                3: "LOGIN"
            };

            elem.create({tag: "ul", attributes: {id: "nav-menu"}}, "header-main");

            for(var num in headings) {
                elem.create({tag: "li", attributes: {id: "nav-list-item-"+num, class: "nav-list-item"}}, "nav-menu");
                elem.create({tag: "a",
                             content: headings[num],
                             attributes: { href: "#", class: "nav-list-item-link", onclick: "nav.anim("+num+")" }},
                            "nav-list-item-"+num);
            }
        }());

        var subMenus = (function() {
            var subHeadings = {
                1: { a: {heading: "Black-Scholes-Merton", link: "../html/BSMpage.html"}//,
                   /*b: {heading: "Variance-Gamma", link: "#"}*/ },
                2: { a: {heading: "Github Repository", link: "https://github.com/Ice101781/risk_cloud"} },
                3: { a: {heading: "#", link: "#"} }
            };

            for(var num in subHeadings) {
                elem.create({tag: "div", attributes: {id: "nav-sub-container-"+num, class: "nav-sub-container", "data-open": "false"}}, ".body");
                elem.create({tag: "ul", attributes: {id: "nav-sub-menu-"+num, class: "nav-sub-menu"}}, "nav-sub-container-"+num);

                for(var letter in subHeadings[num]) {
                    elem.create({tag: "li", attributes: {id: "nav-sub-list-item-"+num+letter, class: "nav-sub-list-item"}}, "nav-sub-menu-"+num);
                    elem.create({tag: "a",
                                 content: subHeadings[num][letter].heading,
                                 attributes: { href: subHeadings[num][letter].link, class: "nav-sub-list-item-link"}},
                                "nav-sub-list-item-"+num+letter);
                }
            }
        }());
    },

    anim: function(num) {
        var inc = 0.25,
            hgt = 4;

        var navSubEase = function(type, num) {
            var bool = type == "in" ? "true" : "false";

            elem.ease(type, "nav-sub-container-"+num, inc, hgt);
            elem.select("nav-sub-container-"+num).setAttribute("data-open", bool);
        }

        var closeNavSubs = function(arr) {
            arr.forEach(function(n) { if(elem.select("nav-sub-container-"+n).getAttribute("data-open") == "true") { navSubEase("out", n) } });
        }

        //open or close the sub-menu
        switch(elem.select("nav-sub-container-"+num).getAttribute("data-open")) {
            case "false":
                //close the other sub-menus if they're open
                switch(num) {
                    case 1:
                        closeNavSubs([2,3]);
                        break;
                    case 2:
                        closeNavSubs([1,3]);
                        break;
                    case 3:
                        closeNavSubs([1,2]);
                        break;
                }
                navSubEase("in", num);
                break;
            case "true":
                navSubEase("out", num);
                break;
        }
    }
});

// END NAVIGATION MENU ==============================================================================================================================

// MISC =============================================================================================================================================

function disableKey(key) {
    var block = function(e) { if((e.keyCode || e.charCode) == key) {e.preventDefault()} }

    document.addEventListener('keydown', block);
    //required for certain keys in Firefox; i.e., the spacebar
    document.addEventListener('keyup', block);
}

//error message handling for text form input
function errorMsg(ele,msg) {
    elem.select(ele).style.borderColor = 'red';

    setTimeout(function() {
        alert(msg);
        //reset field value and border color
        elem.select(ele).value = "";
        elem.select(ele).style.borderColor = '#ddffdd';
    });
}

// END MISC =========================================================================================================================================

/* CODE DEPRECATED

//compute integrals numerically using Simpson's rule
INTEGRAL: function(lBnd, rBnd, subs, expr) {
    var a = lBnd,
        b = rBnd,
        n = subs,
        f = expr;

    if(n % 2 == 0) {
        var sum1 = 0,
            sum2 = 0;

        for(var i=1; i<(n/2); i++) { sum1 += f(((((n/2)-i)*a)+(i*b))/(n/2)) }

        for(var j=1; j<(n/2)+1; j++) { sum2 += f((((((n+1)/2)-j)*a)+((j-(1/2))*b))/(n/2)) }

        return ((b-a)/(3*n))*(f(a)+(2*sum1)+(4*sum2)+f(b));
    } else {
        //error handling
        return "The number of sub-intervals, 'n', must be even.";
    }
}

//approximation to the integral definition of the cumulative standard Normal Distribution function
CUSTNORM: function(z, n) {
    //this method is relatively slow; n >= 200 is typically necessary for reasonable accuracy
    switch(b<0) {
        case true:
            return (1/2)-this.INTEGRAL(z, 0, n, this.NORM);
            break;
        case false:
            return (1/2)+this.INTEGRAL(0, z, n, this.NORM);
            break;
    }
}

//return an object comprised of numbered id strings
var idStrings = function(arr) {
    var num = arr[0] != "num-legs-radio" ? trade.legCount : 4,
        obj = {};

    switch(arr.length) {
        case 1:
            for(var n=1; n<num+1; n++) {
                obj[n] = arr[0]+"-"+n;
            }
            break;
        case 2:
            for(var n=1; n<num+1; n++) {
                obj[2*n-1] = arr[0]+"-"+n;
                obj[2*n] = arr[1]+"-"+n;
            }
            break;
    }

    return obj;
}

CODE DEPRECATED */
