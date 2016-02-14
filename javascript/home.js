//build HTML elements native to the home page
  createHomePage = function() {

    //the home page welcome message
      risk = htmlString('span', 'risk', {

                 id: "risk",
                 style: "color: #ff5555;"
               }
             );

      profit = htmlString('span', 'profit', {

                   id: "profit",
                   style: "color: #55bb55;"
                 }
               );

      welcome = htmlString('h1', 'Estimate '+risk+' and '+profit+' potential in your option(s) trades.', { id: "welcome" });


    //the home page background icon
      icon2 = htmlString('img', '', {

                  id: "icon2",
                  alt: "Watermark Icon",
                  src: "../images/icon2.png",
                  style: "width: 25%;"
                }
              );

      watermark = htmlString('div', icon2, { id: "watermark" });


    return welcome + watermark;
  };

  