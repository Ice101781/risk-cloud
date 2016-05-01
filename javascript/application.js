//GLOBAL OBJECT//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var g = {

    //user-defined parameters
    TRADE_LEGS : 0,
    CONTRACT_FEES : 0,
    STOCK_PRICE : 0,
    LEG_SIGN : {},
    CONTRACT_TYPE : {},
    NUM_CONTRACTS : {},
    STRIKE_PRICE : {},
    EXPIRY : {},
    DIV_YIELD : {},
    RISK_FREE : {},
    OPTION_PRICE : {},

    //application output
    IMPLIED_VOL : {},
    STOCK_RANGE : {},
    PROFITLOSS_DATA : {},
    DELTA_DATA : {},
    GAMMA_DATA : {},
    THETA_DATA : {},
    VEGA_DATA : {},
    RHO_DATA : {}
};

//END GLOBAL OBJECT//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//HEADER/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//nav menu
nav = function(properties) {

    var self = function() { return };
      
    for(prop in properties) { self[prop] = properties[prop] }

    return self;   
}({

    create: function() {

        //main header container
        element({tag: "div", attributes: {id: "header-main"}}, ".body");

        //icon
        element({tag: "a", attributes: {id: "icon-link", href: "../html/home.html"}}, "header-main");

        element({tag: "img", attributes: {id: "icon", alt: "Risk Cloud", src: "../images/icon.png"}}, "icon-link");

        //navigation menu
        //main
        (mainMenu = function() {

            var headings = { 1: "models", 2: "info" };

            element({tag: "ul", attributes: {id: "nav-menu"}}, "header-main");

            for(num in headings) {

                element({tag: "li", attributes: {id: "nav-list-item-"+num, class: "nav-list-item"}}, "nav-menu");

                element({tag: "a", content: headings[num], attributes: {
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

                element({tag: "div", attributes: {id: "nav-sub-container-"+num, class: "nav-sub-container", "data-open": "false"}}, ".body");

                element({tag: "ul", attributes: {id: "nav-sub-menu-"+num, class: "nav-sub-menu"}}, "nav-sub-container-"+num);

                for(letter in subHeadings[num]) {

                    element({tag: "li", attributes: {id: "nav-sub-list-item-"+num+letter, class: "nav-sub-list-item"}}, "nav-sub-menu-"+num);

                    element({tag: "a", content: subHeadings[num][letter].heading, attributes: {
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
        if(select("nav-sub-container-"+otherIndex).getAttribute("data-open") == "true") {

            elementAnim.ease("out", "nav-sub-container-"+otherIndex, inc, maxHeight);
            select("nav-sub-container-"+otherIndex).setAttribute("data-open", "false");
        }

        //open or close the relevant sub-menu
        switch(select("nav-sub-container-"+index).getAttribute("data-open")) {

            case "false":
                elementAnim.ease("in", "nav-sub-container-"+index, inc, maxHeight);
                select("nav-sub-container-"+index).setAttribute("data-open", "true");
                break;

            case "true":
                elementAnim.ease("out", "nav-sub-container-"+index, inc, maxHeight);
                select("nav-sub-container-"+index).setAttribute("data-open", "false");
                break;
        }
    }
})

//END HEADER/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//HELPERS////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Reset pre-defined parameter values in an object
reset = function(obj) {

    for(elem in obj) {

        switch(typeof obj[elem]) {

            case 'number':
                obj[elem] = 0;
                break;

            case 'object':
                obj[elem] = {};
                break;

            default:
                break;
        }
    }
}


//Object size - thanks to 'James Coglan' on stackoverflow.com for this
lastKey = function(obj) {

    var size = 0;

    for(key in obj) { if(obj.hasOwnProperty(key)) {size++} }

    return size;
}


//Object min and max - thanks to 'levi' on stackoverflow.com for this
objExtrema = function(extremum, obj) {

    switch(extremum) {

        case 'min':
            return min = Object.keys(obj).reduce(function(m,n) {return obj[n] < m ? obj[n] : m}, Infinity);
            break;

        case 'max':
            return max = Object.keys(obj).reduce(function(m,n) {return obj[n] > m ? obj[n] : m}, -Infinity);
            break;
    }
}


//Remove duplicate elements from an array - thanks to 'georg' on stackoverflow.com for this 
uniqArr = function(array) {

    array = array.filter(function(element, index) { return array.indexOf(element) == index });

    return array;
}


//HTML element selection
select = function(idString) {

    return document.getElementById(idString) || document.querySelector(idString);
}


//HTML element creation
element = function(paramsObject, appendId) {

    //create a new document element
    var elem = document.createElement(paramsObject.tag);

    //add content
    if(typeof paramsObject.content === 'undefined') { paramsObject.content = "" }

    elem.appendChild(document.createTextNode(paramsObject.content));

    //add attributes
    for(attr in paramsObject.attributes) { elem.setAttribute(attr, paramsObject.attributes[attr]) }

    //append the new element to a parent element
    select(appendId).appendChild(elem);

    return elem;
}


//Remove all children from an element - thanks to Gabriel McAdams on stackoverflow.com for this
removeChildren = function(idString) {

    var elem = select(idString);

    while(elem.firstChild) { elem.removeChild(elem.firstChild) }
}


//Disable or enable multpile classes of elements at once
elementAvail = function(idObject, bool) {

    for(key in idObject) {

        switch(typeof(idObject[key])) {

            case 'string':
                select(idObject[key]).disabled = !bool;
                break;

            case 'object':
                for(subKey in idObject[key]) { select(idObject[key][subKey]).disabled = !bool }
                break;
        }
    }
}


//HTML element animation
elementAnim = function(properties) {

    var self = function() { return }

    for(prop in properties) { self[prop] = properties[prop] }

    return self; 
}({

    //element height animation
    ease: function(type, idString, increment, maxHeight, callback) {

        var elem = select(idString).style,
            height = 0,
            timer = setInterval(render, (1000/50));

        function render() {

            height = (maxHeight-height > 0) ? height + increment : maxHeight;

            if(height == maxHeight) {

                clearInterval(timer);
                if(typeof callback === 'function') { callback() }

            } else {

                height += increment;
                if(type == "in") {elem.height = height + 'vw'} else if(type == "out") {elem.height = maxHeight - height + 'vw'}
            }
        }
    },

    //opacity animation
    fade: function(type, idString, inc, callback) {

        var elem = select(idString).style,
            opacity = 0,
            timer = setInterval(render, (1000/50));

        function render() {

            opacity = (1-opacity > 0) ? opacity + inc : 1;

            if(opacity == 1) {

                clearInterval(timer);
                if(typeof callback === 'function') { callback() }

            } else {

                opacity += inc;
                if(type == "in") {elem.opacity = opacity} else if(type == "out") {elem.opacity = 1 - opacity}
            }
        }
    }
})


//Create or destroy a class of forms for radios with two buttons; on create, the default button may be selected based on a string condition
twoButtons = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;  
}({

    create: function(buttonArray, conditionString, appendId, index) {

        element({tag: "form", attributes: {
                                  id:    buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"form-"+(index+1),
                                  class: buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"form"
                              }},
                              appendId+(index+1));

        //radio buttons
        for(var j=0; j<2; j++) {

            element({tag: "input", attributes: {
                                       type: "radio",
                                       id: buttonArray[j][0]+"-"+"radio-"+(index+1),
                                       name: buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"radio-"+(index+1),
                                       value: buttonArray[j][1]
                                   }},
                                   buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"form-"+(index+1));

            element({tag: "label", content: buttonArray[j][0].charAt(0).toUpperCase()+buttonArray[j][0].slice(1), 

                                   attributes: {
                                       "for": buttonArray[j][0]+"-"+"radio-"+(index+1), 
                                       class: "radio "+buttonArray[0][0]+"-"+buttonArray[1][0]
                                   }},
                                   buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"form-"+(index+1));
        }

        //some default settings to save time during common trade setups
        var bin = eval(conditionString) ? 0 : 1;
        select(buttonArray[bin][0]+"-"+"radio-"+(index+1)).setAttribute("checked", "");
    }
})


//Create or destroy a class of forms for text-number fields
numberFields = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;  
}({

    create: function(idString, content, attr, appendId, idx) {
    
        element({tag: "form", content: content, attributes: {id: idString+"-form-"+(idx+1), class: idString+"-form"}}, appendId+(idx+1));

        element({tag: "input", attributes: {
                                   type: "number",
                                   id: idString+"-field-"+(idx+1),
                                   class: idString+"-field",
                                   min: attr.min,
                                   step: attr.step,
                                   value: attr.value
                               }},
                               idString+"-form-"+(idx+1));
    },

    //on first container click, toggle visibility of remaining field containers
    visible: function(container, maxHeight, field) {

        var type, color;

        switch(select(container+'-1').getAttribute("data-clicked")) {

            case "true":
                type = "out";
                color = '#cbdafb';
                select(container+'-1').setAttribute("data-clicked", "false");
                break;

            case "false":
                type = "in";
                color = '#ffcccc';
                select(container+'-1').setAttribute("data-clicked", "true");
                break;
        }

        //ease in or out, set field value to zero on ease out
        for(var i=1; i<g.TRADE_LEGS; i++) {

            (function(index) {

                elementAnim.ease(type, container+'-'+(index+1), 0.25, maxHeight, function() { if(type == "out") {select(field+'-field-'+(index+1)).value = 0} });
            })(i);
        }

        //toggle background color of the first container in the class
        select(container+'-1').style.backgroundColor = color;
    }
})


//Return an object with with numbered id strings; current support for arrays with up to 2 id string types
idStringsObject = function(stringArray, indexMax) {

    var obj = {};

    switch(stringArray.length) {

        case 1:
            for(var i=0; i<indexMax; i++) { obj[(i+1)] = stringArray[0]+"-"+(i+1) }
            break;

        case 2:
            for(var i=0; i<indexMax; i++) {

                obj[(2*i)+1] = stringArray[0]+"-"+(i+1);
                obj[2*(i+1)] = stringArray[1]+"-"+(i+1);
            }
            break;
    }

    return obj;
}


//Determine whether text input form conditions are met for a class of elements; return an object with boolean values
classInputCheck = function(elem, indexMax, condArray) {

    condArray.push('!= ""');

    var obj = {};

    for(var i=0; i<indexMax; i++) {

        for(var j=0; j<condArray.length; j++) {

            obj[(i+1)] = eval('select(elem+"-"+(i+1)).value'+condArray[j]) ? true : false;

            if(!obj[(i+1)]) { return obj }
        }
    }

    return obj;
}


//Some basic error message handling for text form input
inputErrorMsg = function(elem, msg) {

    select(elem).style.borderColor = '#ff0000';
    alert(msg);
    select(elem).style.borderColor = '#d8d8d8';
      
    return;
}


//Compute integrals numerically using Simpson's rule
integrate = function(leftBound, rightBound, numSubIntervals, expression) {

    var a = leftBound,
        b = rightBound,
        n = numSubIntervals,
        f = expression;

    if(n % 2 == 0) {

        var sum1 = 0,
            sum2 = 0,
            halfN = n/2;

        for(var i=1; i<halfN; i++) { sum1 += f((((halfN-i)*a)+(i*b))/halfN) }

        for(var i=1; i<halfN+1; i++) { sum2 += f((((((n+1)/2)-i)*a)+((i-(1/2))*b))/halfN) }

        return ((b-a)/(3*n))*(f(a)+(2*sum1)+(4*sum2)+f(b));

    } else {

        return "The number of sub-intervals, 'n', must be even.";
    }
}

//END HELPERS////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


