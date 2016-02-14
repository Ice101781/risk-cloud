//HTML elements helper - thanks to MARC GRABANSKI for his helpful example!
  htmlString = function(tag, content, attributes) {

    //some basic parameter handling
      if(arguments.length == 0) {
     
        tag        =  "p";
        content    =  "This is a test paragraph created by the htmlString javascript function.";
        attributes =  { id: "defaultParagraph" };

  	  } else if(arguments.length !== 3) {
     
        console.warn("The htmlString function requires three valid arguments to build HTML elements. You may alternatively use no arguments for testing purposes.");
        return;
      };

    var element = '<' + tag;
  
    for(key in attributes) {
      element += ' ' + key + '="' + attributes[key] + '"';
    };

    //some basic tag handling
      if(tag == "link" || tag == "img") {

        return element + ' />';

      } else {

        return element + '>' + content + '</' + tag + '>';
      };
  };



//build the navigation elements common to all HTML pages, then build the content unique to each page
  createHeader = function(callback) {
  
    //header icon
      icon = htmlString('img', '', {

                 id: "icon",
                 alt: "Risk Cloud",
                 src: "../images/icon.png",
                 style: "width: 12.5%"
               }
             );

    //navigation menu
      var menuHeadings = { one: 'model', two: 'about' },
          listItems = '';

      for(heading in menuHeadings) {

        listItems += htmlString('li', htmlString('a', menuHeadings[heading], { href: "#", class: "nav-item" }), {});
      };

      navMenu = htmlString('ul', listItems, {});

      navMain = htmlString('div', icon + navMenu, { class: "nav-main" });
  
  
    content = callback();

    return document.write( navMain + content );
  };



