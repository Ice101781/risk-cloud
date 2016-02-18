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


    //BUILD THE START TAG AND ADD ANY ATTRIBUTES
      var element = '<' + tag;

      for(key in attributes) { element += ' ' + key + '="' + attributes[key] + '"' };


    //SOME BASIC TAG HANDLING TO RETURN THE APPROPRIATE HTML ELEMENT
      if(tag == 'meta' || tag == 'link' || tag == 'img') {

        return element + ' />';

      } else {

        return element + '>' + content + '</' + tag + '>';
      };
  };


//build the header common to all HTML pages, then add the content unique to each page
  createPage = function(callback) {

    //HEADER ICON
      icon = htmlString('a', htmlString('img', '', { alt: "Risk Cloud", src: "../images/icon.png" }), { id: "icon", href: '../html/home.htm' });


    //BUILD THE NAVIGATION MENU RECURSIVELY
      //BUILD THE SUB-MENUS
        var subMenus = {};

        (createSubMenus = function() {

          var subMenusInfo = {

                models: {  one: { title: 'European: &nbsp&nbsp Black-Scholes', link: '../html/blackscholesmodel.htm' }, two: { title: 'American: &nbsp&nbsp Binomial', link: "#" }  },

                info:   {  one: { title: 'about',                              link: "#" },                             two: { title: 'dig deeper',                    link: "#" }  }
              };

          for(elem in subMenusInfo) {

            var listItems = '';

            for(num in subMenusInfo[elem]) { listItems += htmlString('li', htmlString('a', subMenusInfo[elem][num].title, { href: subMenusInfo[elem][num].link, class: "nav-sub-item" }), {}) };

            subMenus[elem] = htmlString('div', htmlString('div', htmlString('ul', listItems, {}), { class: "nav-sub" }), { class: "nav-sub-container" });
          };
        })();


      //BUILD THE MAIN MENU
        var navMenu = {};

        (createNavMenu = function() {

          var menuHeadings = { models: 'models', info: 'info' }, 
              listItems    = '';

          for(elem in menuHeadings) { listItems += htmlString('li', htmlString('a', menuHeadings[elem], { href: "#", class: "nav-item" }) + subMenus[elem], {}) };

          navMenu = htmlString('ul', listItems, {});
        })();


    //BUILD THE CONTAINER FOR THE HEADER, ADD THE ICON AND THE COMPLETED NAVIGATION MENU
      navMain = htmlString('div', icon + navMenu, { class: "nav-main" });


    //CREATE ANY CONTENT UNIQUE TO THE CURRENT PAGE AND RETURN THE HEADER AND THE CONTENT
      content = callback();

      return document.write( navMain + content );
  };
