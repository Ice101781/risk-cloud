//HTML elements helper - thanks to MARC GRABANSKI for his helpful example!
  htmlString = function(tag, content, attributes) {

    //SOME BASIC PARAMETER HANDLING
      if(arguments.length == 0) {

        tag        =  'p';
        content    =  'This is a test paragraph created by the htmlString javascript function.';
        attributes =  { id: "defaultParagraph" };

  	  } else if(arguments.length !== 3) {

        console.warn("The htmlString function requires three valid arguments to build HTML elements. You may alternatively use no arguments for testing purposes.");
        return;
      };

    var element = '<' + tag;

    for(key in attributes) {
      element += ' ' + key + '="' + attributes[key] + '"';
    };

    //SOME BASIC TAG HANDLING
      if(tag == 'meta' || tag == 'link' || tag == 'img') {

        return element + ' />';

      } else {

        return element + '>' + content + '</' + tag + '>';
      };
  };


//build the header common to all HTML pages, then build the content unique to each page; use the 'htmlString' function above
  createHeader = function(callback) {

    //HEADER ICON
      icon = htmlString('img', '', { id: "icon", alt: "Risk Cloud", src: "../images/icon.png" });

    //BUILD THE NAVIGATION MENU RECURSIVELY
      //BUILD THE SUB-MENUS
        //MODELS SUB-MENU
        var modelsSubHeadings = { one: 'European: &nbsp&nbsp Black-Scholes', two: 'American: &nbsp&nbsp Binomial' },
            modelsListItems   = '';

        for(num in modelsSubHeadings) {        
          modelsListItems += htmlString('li', htmlString('a', modelsSubHeadings[num], { href: "#", class: "nav-sub-item" }), {});
        };

        modelsSubMenu = htmlString('div', htmlString('div', htmlString('ul', modelsListItems, {}), { class: "nav-sub" }), { class: "nav-sub-container" });

        //INFO SUB-MENU
        var infoSubHeadings = { one: 'about', two: 'white papers' },
            infoListItems   = '';

        for(num in infoSubHeadings) {
          infoListItems += htmlString('li', htmlString('a', infoSubHeadings[num], { href: "#", class: "nav-sub-item" }), {});
        };

        infoSubMenu = htmlString('div', htmlString('div', htmlString('ul', infoListItems, {}), { class: "nav-sub" }), { class: "nav-sub-container" });

        //CREATE A SUB-MENUS OBJECT FOR EASY ADDITION TO THE MAIN MENU
        var subMenus = { one: modelsSubMenu, two: infoSubMenu };

      //BUILD THE MAIN MENU
      var menuHeadings  = { one: 'models', two: 'info' },
          menuListItems = '';

      for(num in menuHeadings) {
        menuListItems += htmlString('li', htmlString('a', menuHeadings[num], { href: "#", class: "nav-item" }) + subMenus[num], {});
      };

      navMenu = htmlString('ul', menuListItems, {});

    //BUILD THE CONTAINER FOR THE HEADER, ADD THE ICON AND THE COMPLETED NAVIGATION MENU
      navMain = htmlString('div', icon + navMenu, { class: "nav-main" });

    //CREATE ANY CONTENT UNIQUE TO THE CURRENT PAGE
      content = callback();

    return document.write( navMain + content );
  };
