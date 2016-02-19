//build HTML elements native to the home page
  homeContent = function() {

    //THE HOME PAGE WELCOME MESSAGE
      risk = htmlString('span', 'risk', { id: "risk" });

      profit = htmlString('span', 'profit', { id: "profit" });

      welcome = htmlString('h1', 'Estimate '+risk+' and '+profit+' potential in option(s) trades.', { id: "welcome" });


    //THE HOME PAGE BACKGROUND ICON
      icon2 = htmlString('img', '', { id: "icon2", alt: "Watermark Icon", src: "../images/icon2.png" });

      watermark = htmlString('div', icon2, { id: "watermark" });


    //RETURN THE HOME PAGE CONTENT
      return welcome + watermark;
  };
