// GLOBAL OBJECT ====================================================================================================================================

var g = {

    //user input
    TRADE_LEGS : 0,
    LONG_SHORT : {},
    CONTRACT_TYPE : {},
    NUM_CONTRACTS : {},
    STRIKE_PRICE : {},
    OPTION_PRICE : {},
    EXPIRY : {},
    DIV_YIELD : {},
    RISK_FREE : {},
    STOCK_PRICE : 0,

    //application output
    STOCKRANGE_LENGTH: 0,
    IMPLIED_VOL : {},
    DELTA : {},
    GAMMA : {},
    THETA : {},
    VEGA : {},
    RHO : {},
    PROFITLOSS_DATA : {},
    DELTA_DATA : {},
    GAMMA_DATA : {},
    THETA_DATA : {},
    VEGA_DATA : {},
    RHO_DATA : {}
};

// END GLOBAL OBJECT ================================================================================================================================


// HEADER ===========================================================================================================================================

//navigation menu
nav = function(properties) {

    var self = function() { return };
      
    for(prop in properties) { self[prop] = properties[prop] }

    return self;   
}({

    create: function() {

        //main header container
        elem.create({tag: "div", attributes: {id: "header-main"}}, ".body");

        //icon
        elem.create({tag: "a", attributes: {id: "icon-link", href: "../html/home.html"}}, "header-main");

        elem.create({tag: "img", attributes: {id: "icon", alt: "Risk Cloud", src: "../images/icon.png"}}, "icon-link");

        //main menu
        (mainMenu = function() {

            var headings = { 

                1: "ANALYZE",

                2: "MODEL",

                3: "info"
            };

            elem.create({tag: "ul", attributes: {id: "nav-menu"}}, "header-main");

            for(num in headings) {

                elem.create({tag: "li", attributes: {id: "nav-list-item-"+num, class: "nav-list-item"}}, "nav-menu");

                elem.create({tag: "a",

                             content: headings[num],

                             attributes: { href: "#", class: "nav-list-item-link", onclick: "nav.anim("+num+")" }},

                            "nav-list-item-"+num);
            }
        })();

        //sub-menus
        (subMenus = function() {

            var subHeadings = {   

                1: { a: {heading: "Skew",                 link: "#"} },

                2: { a: {heading: "Black-Scholes-Merton", link: "../html/BSMpage.html"}//,
                   /*b: {heading: "Variance-Gamma",       link: "#"                   }*/ },

                3: { a: {heading: "FAQ",                  link: "#"},
                     b: {heading: "legal",                link: "#"} }
            };

            for(num in subHeadings) {

                elem.create({tag: "div", attributes: {id: "nav-sub-container-"+num, class: "nav-sub-container", "data-open": "false"}}, ".body");

                elem.create({tag: "ul", attributes: {id: "nav-sub-menu-"+num, class: "nav-sub-menu"}}, "nav-sub-container-"+num);

                for(letter in subHeadings[num]) {

                    elem.create({tag: "li", attributes: {id: "nav-sub-list-item-"+num+letter, class: "nav-sub-list-item"}}, "nav-sub-menu-"+num);

                    elem.create({tag: "a",

                                 content: subHeadings[num][letter].heading,

                                 attributes: { href: subHeadings[num][letter].link, class: "nav-sub-list-item-link"}},
                                                                                      
                                "nav-sub-list-item-"+num+letter);
                }
            }
        })();
    },


    anim: function(idx) {

        //local vars
        var inc = 0.25,
            hgt = 4;

        navSubEase = function(type, num) {

            var bool = type == "in" ? "true" : "false";

            elem.ease(type, "nav-sub-container-"+num, inc, hgt);
            elem.select("nav-sub-container-"+num).setAttribute("data-open", bool);
        }

        closeNavSubs = function(arr) {

            arr.forEach(function(n) { if(elem.select("nav-sub-container-"+n).getAttribute("data-open") == "true") { navSubEase("out", n) } });
        }

        //open or close the sub-menu
        switch(elem.select("nav-sub-container-"+idx).getAttribute("data-open")) {

            case "false":
                //close the other sub-menus if they're open
                switch(idx) {

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
                navSubEase("in", idx);
                break;

            case "true":
                navSubEase("out", idx);
                break;
        }
    }
})

// END HEADER =======================================================================================================================================


// MISC =============================================================================================================================================

//return an object with with numbered id strings
idStrings = function(arr) {

    var idx = arr[0] != "num-legs-radio" ? g.TRADE_LEGS : 4,
        obj = {};

    switch(arr.length) {

        case 1:
            for(i=1; i<idx+1; i++) {

                obj[i] = arr[0]+"-"+i;
            }
            break;

        case 2:
            for(i=1; i<idx+1; i++) {

                obj[2*i-1] = arr[0]+"-"+i;
                obj[2*i]   = arr[1]+"-"+i;
            }
            break;
    }

    return obj;
}


twoButtons = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    create: function(arr, n) {

        //radio form
        elem.create({tag: "form",

                     attributes: {id: arr[0][0]+"-"+arr[1][0]+"-"+"form-"+n, class: "general-group trade-leg-radio-forms"}},

                    "leg-sub-container-1-"+n);

        //radio buttons
        for(j=0; j<2; j++) {

            elem.create({tag: "input",

                         attributes: {type: "radio", id: arr[j][0]+"-"+"radio-"+n, name: arr[0][0]+"-"+arr[1][0]+"-"+"radio-"+n, value: arr[j][1]}},

                        arr[0][0]+"-"+arr[1][0]+"-"+"form-"+n);

            //labels
            elem.create({tag: "label",

                         content: arr[j][0].charAt(0).toUpperCase()+arr[j][0].slice(1),

                         attributes: {"for": arr[j][0]+"-"+"radio-"+n, class: "general-group radio trade-leg-radios"}},

                        arr[0][0]+"-"+arr[1][0]+"-"+"form-"+n);
        }

        //default settings for common trade setups
        var bit;

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
})


numberFields = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;  
}({

    create: function(str, n) {

        switch(str) {

            case "num-contracts":
                var content = "No. of contracts :",
                    attr    = {min:"1", step:"1", value:"1"},
                    subNum  = 2;
                break;

            case "strike-price":
                var content = "Exercise price :",
                    attr    = {min:".25", step:".25", value:"100"},
                    subNum  = 3;
                break;

            case "option-price":
                var content = "Option price :",
                    attr    = {min:".01", step:".01", value:"1.25"},
                    subNum  = 4;
                break;

            case "expiry":
                var content = "Calendar days to expiry :",
                    attr    = {min:"1", step:"1", value:"30"},
                    subNum  = 5;
                break;

            case "div-yield":
                var content = "Dividend yield % :",
                    attr    = {min:"0", step:".01", value:"0"},
                    subNum  = 6;
                break;

            case "risk-free-rate":
                var content = "Risk-free rate % :",
                    attr    = {min:"0", step:".01", value:".25"},
                    subNum  = 7;
                break;
        }

        elem.create({tag: "form",

                     attributes: {id: str+"-form-"+n, class: "general group trade-leg-field-forms "+str+"-form"}},

                    "leg-sub-container-"+subNum+"-"+n);

        //align helper
        elem.create({tag: "div",

                     content: content,

                     attributes: {class: "trade-leg-align-helpers align-helper"}},

                    str+"-form-"+n);

        elem.create({tag: "input",

                     attributes: {type: "number", id: str+"-field-"+n, class: "general-group all-fields small-fields "+str+"-field", min: attr.min, step: attr.step, value: attr.value}},

                    str+"-form-"+n);
    },


    //on first trade leg sub-container click, toggle visibility of remaining sub-containers
    visible: function(ctr, hgt, fld) {

        switch(elem.select(ctr+'-1').getAttribute("data-clicked")) {

            case "true":
                var type  = "out",
                    color = '#cbdafb';

                elem.select(ctr+'-1').setAttribute("data-clicked", "false");
                break;

            case "false":
                var type  = "in",
                    color = '#ffcccc';

                elem.select(ctr+'-1').setAttribute("data-clicked", "true");
                break;
        }

        //ease in or out, set field value to attribute "min" on ease out
        for(i=2; i<g.TRADE_LEGS+1; i++) {

            (function(n) {

                elem.ease(type, ctr+'-'+n, 0.13625, hgt, function() {

                    if(type == "out") {

                        var f = elem.select(fld+'-field-'+n);

                        f.value = f.getAttribute("min");
                    }
                })
            })(i);
        }

        //toggle background color of the first sub-container in the class
        elem.select(ctr+'-1').style.backgroundColor = color;
    }
})


//determine whether text input form conditions are met
inputCheck = function(ele) {

    var obj = {};

    for(i=1; i<g.TRADE_LEGS+1; i++) {

        var val = elem.select(ele+"-"+i).value;

        if(val == "") {

            obj[i] = false;
            return obj;
        }

        switch(ele) {

            case "num-contracts-field":
                switch(false) {

                    case val >= 1 && val == Math.floor(val):
                        obj[i] = false;
                        return obj;

                    default:
                        obj[i] = true;
                        break;
                }
                break;

            case "strike-price-field":
                switch(false) {

                    case val >= 0.25:
                        obj[i] = false;
                        return obj;

                    default:
                        obj[i] = true;
                        break;
                }
                break;

            case "option-price-field":
                switch(false) {

                    case val > 0:
                        obj[i] = false;
                        return obj;

                    default:
                        obj[i] = true;
                        break;
                }
                break;

            case "expiry-field":
                switch(false) {

                    case val >= 1 && val <= 183 && val == Math.floor(val):
                        obj[i] = false;
                        return obj;

                    default:
                        obj[i] = true;
                        break;
                }
                break;

            case "div-yield-field":
                switch(false) {

                    case val >= 0 && val <= 100:
                        obj[i] = false;
                        return obj;

                    default:
                        obj[i] = true;
                        break;
                }
                break;

            case "risk-free-rate-field":
                switch(false) {

                    case val >= 0 && val <= 25:
                        obj[i] = false;
                        return obj;

                    default:
                        obj[i] = true;
                        break;
                }
                break;
        }
    }

    return obj;
}


//some basic error message handling for text form input
errorMsg = function(ele, msg) {

    elem.select(ele).style.borderColor = 'red';
    alert(msg);
    elem.select(ele).style.borderColor = '#ddffdd';
}

// END MISC =========================================================================================================================================
