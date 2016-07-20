// GLOBAL OBJECT ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var g = {

    //user input
    TRADE_LEGS : 0,
    CONTRACT_FEES : 0,
    STOCK_PRICE : 0,
    LONG_SHORT : {},
    CONTRACT_TYPE : {},
    NUM_CONTRACTS : {},
    STRIKE_PRICE : {},
    EXPIRY : {},
    DIV_YIELD : {},
    RISK_FREE : {},
    OPTION_PRICE : {},

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

// END GLOBAL OBJECT ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// HEADER ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//nav menu
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

        //navigation menu
        //main
        (mainMenu = function() {

            var headings = { 1: "models", 2: "info" };

            elem.create({tag: "ul", attributes: {id: "nav-menu"}}, "header-main");

            for(num in headings) {

                elem.create({tag: "li", attributes: {id: "nav-list-item-"+num, class: "nav-list-item"}}, "nav-menu");

                elem.create({tag: "a", content: headings[num], attributes: {
                                                                   href: "#",
                                                                   class: "nav-list-item-link",
                                                                   onclick: "nav.anim("+num+")"
                                                               }},
                                                               "nav-list-item-"+num);
            }
        })();

        //sub-menus
        (subMenus = function() {

            var subHeadings = {   

                1: { a: {heading: "Black-Scholes-Merton", link: "../html/BSMpage.html"}, 
                   /*b: {heading: "Variance-Gamma",   link: "#"}*/ },

                2: { a: {heading: "about", link: "#"},
                     b: {heading: "more", link: "#"} }
            };

            for(num in subHeadings) {

                elem.create({tag: "div", attributes: {id: "nav-sub-container-"+num, class: "nav-sub-container", "data-open": "false"}}, ".body");

                elem.create({tag: "ul", attributes: {id: "nav-sub-menu-"+num, class: "nav-sub-menu"}}, "nav-sub-container-"+num);

                for(letter in subHeadings[num]) {

                    elem.create({tag: "li", attributes: {id: "nav-sub-list-item-"+num+letter, class: "nav-sub-list-item"}}, "nav-sub-menu-"+num);

                    elem.create({tag: "a", content: subHeadings[num][letter].heading, attributes: {
                                                                                          href: subHeadings[num][letter].link, 
                                                                                          class: "nav-sub-list-item-link"
                                                                                      }},
                                                                                      "nav-sub-list-item-"+num+letter);
                }
            }
        })();
    },


    anim: function(index) {

        //local parameters
        var otherIndex = (index == "1") ? "2" : "1",
            inc = 0.25,
            maxHeight  = 4.5;

        //close the other sub-menu if it's open
        if(elem.select("nav-sub-container-"+otherIndex).getAttribute("data-open") == "true") {

            elem.ease("out", "nav-sub-container-"+otherIndex, inc, maxHeight);
            elem.select("nav-sub-container-"+otherIndex).setAttribute("data-open", "false");
        }

        //open or close the relevant sub-menu
        switch(elem.select("nav-sub-container-"+index).getAttribute("data-open")) {

            case "false":
                elem.ease("in", "nav-sub-container-"+index, inc, maxHeight);
                elem.select("nav-sub-container-"+index).setAttribute("data-open", "true");
                break;

            case "true":
                elem.ease("out", "nav-sub-container-"+index, inc, maxHeight);
                elem.select("nav-sub-container-"+index).setAttribute("data-open", "false");
                break;
        }
    }
})

// END HEADER ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// MISC /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Return an object with with numbered id strings; current support for arrays with up to 2 id string types
idStringsObject = function(stringArray, indexMax) {

    var obj = {};

    switch(stringArray.length) {

        case 1:
            for(var i=1; i<indexMax+1; i++) { obj[i] = stringArray[0]+"-"+i }
            break;

        case 2:
            for(var i=1; i<indexMax+1; i++) {

                obj[2*i-1] = stringArray[0]+"-"+i;
                obj[2*i]   = stringArray[1]+"-"+i;
            }
            break;
    }

    return obj;
}


//A class of forms for radios with two buttons; on create, the default button may be selected based on a string condition
twoButtons = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;  
}({

    create: function(buttonArray, appendId, n) {

        elem.create({tag: "form", attributes: {
                                      id:    buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"form-"+n,
                                      class: buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"form"
                                  }},
                                  appendId+n);

        //radio buttons
        for(var j=0; j<2; j++) {

            elem.create({tag: "input", attributes: {
                                           type: "radio",
                                           id: buttonArray[j][0]+"-"+"radio-"+n,
                                           name: buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"radio-"+n,
                                           value: buttonArray[j][1]
                                       }},
                                       buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"form-"+n);

            elem.create({tag: "label", content: buttonArray[j][0].charAt(0).toUpperCase()+buttonArray[j][0].slice(1), 

                                       attributes: {
                                           "for": buttonArray[j][0]+"-"+"radio-"+n, 
                                           class: "radio "+buttonArray[0][0]+"-"+buttonArray[1][0]
                                       }},
                                       buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"form-"+n);
        }

        //some default settings to save time during common trade setups
        switch(buttonArray[0][0]) {

            case "buy":
                if(n == 1 || n == 4) { var bit = 0 } else { var bit = 1 }
                break;

            case "call":
                if(n < 3) { var bit = 1 } else { var bit = 0 }
                break;
        }

        elem.select(buttonArray[bit][0]+"-"+"radio-"+n).setAttribute("checked", "");
    }
})


//A class of forms for text-number fields
numberFields = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;  
}({

    create: function(idString, content, attr, appendId, n) {
    
        elem.create({tag: "form", content: content, attributes: {id: idString+"-form-"+n, class: idString+"-form"}}, appendId+n);

        elem.create({tag: "input", attributes: {
                                       type: "number",
                                       id: idString+"-field-"+n,
                                       class: idString+"-field",
                                       min: attr.min,
                                       step: attr.step,
                                       value: attr.value
                                   }},
                                   idString+"-form-"+n);
    },


    //on first container click, toggle visibility of remaining field containers
    visible: function(container, maxHeight, field) {

        switch(elem.select(container+'-1').getAttribute("data-clicked")) {

            case "true":
                var type  = "out",
                    color = '#cbdafb';

                elem.select(container+'-1').setAttribute("data-clicked", "false");
                break;

            case "false":
                var type  = "in",
                    color = '#ffcccc';

                elem.select(container+'-1').setAttribute("data-clicked", "true");
                break;
        }

        //ease in or out, set field value to attribute "min" on ease out
        for(i=2; i<g.TRADE_LEGS+1; i++) {

            (function(n) {

                elem.ease(type, container+'-'+n, 0.13625, maxHeight, function() {

                    if(type == "out") {

                        var f = elem.select(field+'-field-'+n);

                        f.value = f.getAttribute("min");
                    }
                })
            })(i);
        }

        //toggle background color of the first container in the class
        elem.select(container+'-1').style.backgroundColor = color;
    }
})


//Determine whether text input form conditions are met for a class of elements; return an object with boolean values
classInputCheck = function(element, indexMax) {

    var obj = {};

    for(i=1; i<indexMax+1; i++) {

        var val = elem.select(element+"-"+i).value;

        if(val == "") {

            obj[i] = false;
            return obj;
        }

        switch(element) {

            case "num-contracts-field":
                switch(false) {

                    case val >= 1:
                        obj[i] = false;
                        return obj;

                    case val == Math.floor(val):
                        obj[i] = false;
                        return obj;

                    default:
                        obj[i] = true;
                        break;
                }
                break;

            case "strike-price-field":
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

                    case val >= 1 && val <= 183:
                        obj[i] = false;
                        return obj;

                    case val == Math.floor(val):
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
        }
    }

    return obj;
}


//Some basic error message handling for text form input
inputErrorMsg = function(element, msg) {

    elem.select(element).style.borderColor = '#ff0000';
    alert(msg);
    elem.select(element).style.borderColor = '#d8d8d8';
}

// END MISC /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
