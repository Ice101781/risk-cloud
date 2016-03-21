//GLOBAL PARAMETERS//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var g = {

    CONTRACT_FEES : null,
    TRADE_LEGS : null,
    LEG_SIGN : {},
    CONTRACT_TYPE : {},
    NUM_CONTRACTS : {},
    STRIKE_PRICE : {},
    EXPIRY : {},
    DIV_YIELD : {},
    RISK_FREE : {},
    STOCK_PRICE : null
};

g.purge = function() {

      
}

//END GLOBAL PARAMETERS//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//HELPERS////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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


//Disable or enable multpile classes of elements at once
elementAvail = function(idObject, bool) {

    for(key in idObject) {

        switch(typeof(idObject[key])) {

            case 'string':
                select(idObject[key]).disabled = !bool;
                break;

            case 'object':
                for (subKey in idObject[key]) { select(idObject[key][subKey]).disabled = !bool }
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

    ease: function(type, idString, increment, maxHeight, callback) {

        var elem = select(idString),
            height = 0,
            animate = setInterval(frame, (1000/60));

        function frame() {

            if(maxHeight-height < .001) {

                clearInterval(animate);

                //callback for compound element animations, etc.
                if(typeof callback === 'function') { callback() }

            } else {

                height += increment;

                if(type == "in") {elem.style.height = height + 'vw'} else if(type == "out") {elem.style.height = maxHeight - height + 'vw'}
            }
        }
    },

    //transition between two element containers
    transition: function(Object1, Object2) {

        this.ease("out", Object1.idString, Object1.increment, Object1.height, function() {

             elementAnim.ease("in", Object2.idString, Object2.increment, Object2.height) }
        );
    },

    //on checkbox element button click, toggle visibility of a class of containers, skipping the first;
    //for input validation purposes, also set values of the containers' fields after the containers have been closed
    visible: function(container, maxHeight, elem, field) {

        var type, color;

        switch(select(elem+'-checkbox').checked) {

            case true:
                type = "out";
                color = "#ffdddd";
                break;

            case false:
                type = "in";
                color = "#fafafa";
                break;
        }

        for (var i=1; i<g.TRADE_LEGS; i++) {

            (function(index) {
                elementAnim.ease(type, container+'-'+(index+1), .375, maxHeight, function() {

                    if(type == "out") {select(field+'-field-'+(index+1)).value = 0}
                });
            })(i);
        }

        //toggle background color of the first container in the class to provide a visual cue that the remaining container values are locked to the first
        select(container+'-1').style.backgroundColor = color;
    }
})


//Create a class of forms for text-number fields
textNumFields = function(idString, content, attr, appendId) {

    for(var i=0; i<g.TRADE_LEGS; i++) {

        element({tag: "form", content: content, attributes: {id: idString+"-form-"+(i+1), class: idString+"-form"}}, appendId+(i+1));

        element({tag: "input", attributes: {
                                   type:  "number",
                                   id:    idString+"-field-"+(i+1),
                                   class: idString+"-field",
                                   min:   attr.min,
                                   step:  attr.step,
                                   value: attr.value
                               }},
                               idString+"-form-"+(i+1));
    }
}


//Create a class of forms for radios with two buttons; the default button may be selected based on a string condition
twoWayRadios = function(buttonArray, conditionString, appendId) {

    for(var i=0; i<g.TRADE_LEGS; i++) {

        element({tag: "form", attributes: {
                                  id:    buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"form-"+(i+1),
                                  class: buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"form"
                              }},
                              appendId+(i+1));

        //radio buttons
        for(var j=0; j<2; j++) {

            element({tag: "input", attributes: {
                                       type:  "radio",
                                       id:    buttonArray[j][0]+"-"+"radio-"+(i+1),
                                       name:  buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"radio-"+(i+1),
                                       value: buttonArray[j][1]
                                   }},
                                   buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"form-"+(i+1));

            element({tag: "label", content: buttonArray[j][0].charAt(0).toUpperCase()+buttonArray[j][0].slice(1), 

                                   attributes: {
                                       "for": buttonArray[j][0]+"-"+"radio-"+(i+1), 
                                       class: "radio "+buttonArray[0][0]+"-"+buttonArray[1][0]
                                   }},
                                   buttonArray[0][0]+"-"+buttonArray[1][0]+"-"+"form-"+(i+1));
        }

        //some default settings to save time during common trade setups
        var index = eval(conditionString) ? 0 : 1;

        select(buttonArray[index][0]+"-"+"radio-"+(i+1)).setAttribute("checked", "");
    }
}


//Object size - thanks to James Coglan on stackoverflow.com for this
lastKey = function(obj) {

    var size = 0;

    for (key in obj) { if(obj.hasOwnProperty(key)) {size++} }

    return size;
}


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

//END HELPERS////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//HEADER/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

createHeader = function() {

    //main header container
    element({tag: "div", attributes: {id: "header-main"}}, ".body");

    //icon
    element({tag: "a", attributes: {id: "icon-link", href: "../html/home.htm"}}, "header-main");

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
                                                           onclick: "navDropDown.anim("+num+")"
                                                       }},
                                                       "nav-list-item-"+num);
        }
    })();

    //sub-menus
    (subMenus = function() {

        var subHeadings = {   

            1: { a: {heading: "Black-Scholes-Merton", link: "../html/blackscholesmerton.htm"}, 
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
}


//nav menu dropdown animation logic
navDropDown = function(properties) {

    var self = function() { return };
      
    for(prop in properties) { self[prop] = properties[prop] }

    return self;   
}({

    anim: function(index) {

        //local parameters
        var otherIndex = (index == "1") ? "2" : "1",
            increment  = 0.25,
            maxHeight  = 4.25;

        //close the other sub-menu if it's open
        if(select("nav-sub-container-"+otherIndex).getAttribute("data-open") == "true") {

            elementAnim.ease("out", "nav-sub-container-"+otherIndex, increment, maxHeight);
            select("nav-sub-container-"+otherIndex).setAttribute("data-open", "false");
        }

        //open or close the relevant sub-menu
        switch(select("nav-sub-container-"+index).getAttribute("data-open")) {

            case "false":
                elementAnim.ease("in", "nav-sub-container-"+index, increment, maxHeight);
                select("nav-sub-container-"+index).setAttribute("data-open", "true");
                break;

            case "true":
                elementAnim.ease("out", "nav-sub-container-"+index, increment, maxHeight);
                select("nav-sub-container-"+index).setAttribute("data-open", "false");
                break;
        }
    }
})

//END HEADER/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


