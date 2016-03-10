//USER-PROVIDED GLOBAL PARAMETERS////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  var globalParams = {

        contractFees: null,
        tradeLegs:    null,
        legSigns:     {  },
        currentPrice: null,
      };

//END GLOBAL PARAMETERS//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//HELPERS////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //HTML element selection
    __select = function(identifier) {

      return document.getElementById(identifier) || document.querySelector(identifier);
    };


  //HTML element creation
    __element = function(params, appendIdentifier) {

      //CREATE A NEW ELEMENT
        var elem = document.createElement(params.tag);

      //ADD ANY CONTENT
        if(typeof params.content === 'undefined') { params.content = "" };

        elem.appendChild(document.createTextNode(params.content));

      //SET ANY ATTRIBUTES
        for(attr in params.attributes) { elem.setAttribute(attr, params.attributes[attr]) };

      //APPEND THE NEW ELEMENT
        __select(appendIdentifier).appendChild(elem);

      return elem;
    };


  //HTML element availability
    elementAvail = function(identifiersHash, boolean) {

      if(boolean == false) {

        for(elem in identifiersHash) { __select(identifiersHash[elem]).disabled = true };

      } else {

        for(elem in identifiersHash) { __select(identifiersHash[elem]).disabled = false };
      };
    };


  //HTML element animation
    elementAnim = function(properties) {

      var self = function() { return };

      for(property in properties) { self[property] = properties[property] };

      return self; 
    }({
      
      ease: function(type, identifier, execSpeed, increment, maxHeight) {

        var elem    = __select(identifier),
            height  = 0,
            animate = setInterval(frame, execSpeed);

        function frame() {

          if(height == maxHeight) {

            clearInterval(animate);

          } else {

            height += increment;

            if(type == "in") { elem.style.height = height + 'vw' } else if(type == "out") { elem.style.height = maxHeight - height + 'vw' };
          };
        };
      },
    });

//END HELPERS////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//HEADER/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  createHeader = function(content) {

    //CONTAINER
      __element({tag: "div", attributes: {id: "header-main"}}, ".body");


    //ICON
      __element({tag: "a", attributes: {id: "icon-link", href: "../html/home.htm"}}, "header-main");
        
        __element({tag: "img", attributes: {id: "icon", alt: "Risk Cloud", src: "../images/icon.png"}}, "icon-link");


    //NAVIGATION
      //MAIN MENU
        (mainMenu = function() {

          var headings = { 1: "models", 2: "info" };

          __element({tag: "ul", attributes: {id: "nav-menu"}}, "header-main");

          for(num in headings) {

            __element({tag: "li", attributes: {id: "nav-list-item-"+num, class: "nav-list-item"}}, "nav-menu");

              __element({tag: "a", content: headings[num], attributes: {href: "#", class: "nav-list-item-link", onclick: "navDropDown.anim("+num+")"}}, "nav-list-item-"+num);
          };
        })();


      //SUB-MENUS
        (subMenus = function() {

          var subHeadings = {  1: { a: {heading: "Black-Scholes-Merton", link: "../html/blackscholesmerton.htm"}, b: {heading: "Binomial",   link: "#"} }, 

                               2: { a: {heading: "about",                link: "#"                             }, b: {heading: "dig deeper", link: "#"} }  };

          for(num in subHeadings) {

            __element({tag: "div", attributes: {id: "nav-sub-container-"+num, class: "nav-sub-container", "data-open": "false"}}, ".body");

              __element({tag: "ul", attributes: {id: "nav-sub-menu-"+num, class: "nav-sub-menu"}}, "nav-sub-container-"+num);

              for(letter in subHeadings[num]) {

                __element({tag: "li", attributes: {id: "nav-sub-list-item-"+num+letter, class: "nav-sub-list-item"}}, "nav-sub-menu-"+num);

                  __element({tag: "a", content: subHeadings[num][letter].heading, attributes: {href: subHeadings[num][letter].link, class: "nav-sub-list-item-link"}}, "nav-sub-list-item-"+num+letter);
              };
          };
        })();

    
    //ADD ANY PAGE-SPECIFIC CONTENT
      if(typeof content === 'function') { content() } else { content = null };
  };


  //nav menu dropdown animation logic
    navDropDown = function(properties) {

      var self = function() { return };
      
      for(property in properties) { self[property] = properties[property] };

      return self;   
    }({

      anim: function(index) {

        //LOCAL PARAMETERS
          var otherIndex = (index == "1") ? "2" : "1",
              execSpeed  = 20,
              increment  = 0.5,
              maxHeight  = 4;

        //CLOSE OTHER SUB-MENU IF IT'S OPEN
          if(__select("nav-sub-container-"+otherIndex).getAttribute("data-open") == "true") {

            elementAnim.ease("out", "nav-sub-container-"+otherIndex, execSpeed, increment, maxHeight);
            __select("nav-sub-container-"+otherIndex).setAttribute("data-open", "false");
          };

        //OPEN OR CLOSE RELEVANT SUB-MENU
          switch(__select("nav-sub-container-"+index).getAttribute("data-open")) {

            case "false":
              elementAnim.ease("in", "nav-sub-container-"+index, execSpeed, increment, maxHeight);
              __select("nav-sub-container-"+index).setAttribute("data-open", "true");
              break;

            case "true":
              elementAnim.ease("out", "nav-sub-container-"+index, execSpeed, increment, maxHeight);
              __select("nav-sub-container-"+index).setAttribute("data-open", "false");
              break;
          };
      },
    });

//END HEADER/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



