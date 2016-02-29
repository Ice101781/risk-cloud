//DYNAMICALLY BUILD *ELEMENTS NEEDED TO SPECIFY ADDITIONAL TRADE PARAMETERS
  specifyAdditionalParams = function() {

    //DISABLE THE TRADE LEGS DROPDOWN MENU AND 'CONTINUE' BUTTON
      elementAvail({ one: "num-legs-dropdown", two: "num-legs-button" }, false);


    //CAPTURE # OF TRADE LEGS PARAMETER
      globalParams.numLegs = __select("num-legs-dropdown").value;


    //*ELEMENTS
      __element({tag: "div", attributes: {id: "more-params-container"}}, "form");

      for(var i=0; i<globalParams.numLegs; i++) {

        __element({tag: "div", attributes: {id: "leg-"+(i+1), class: "trade-leg"}}, "more-params-container");

          __element({tag: "span", content: "This is a test.", attributes: {}}, "leg-"+(i+1));
      };

      elementAnim.ease("in", "more-params-container", 10, 0.5, 15);
  };
