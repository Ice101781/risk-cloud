//DYNAMICALLY BUILD *ELEMENTS NEEDED TO SPECIFY ADDITIONAL TRADE PARAMETERS
  specifyAdditionalParams = function() {

    //CAPTURE SOME USER-DEFINED PARAMETERS
      globalParams.currentPrice = Math.round(__select("current-price-field").value*100)/100;


      if(globalParams.currentPrice != "") {  //SOME INPUT VALIDATION

        globalParams.numLegs = __select("num-legs-dropdown").value;

        //DISABLE SOME ELEMENTS ON 'CONTINUE' CLICK
          elementAvail({ one: "current-price-field", two: "num-legs-dropdown", three: "continue-button-1" }, false);


        //*ELEMENTS
          __element({tag: "div", attributes: {id: "more-params-container"}}, "form");

          for(var i=0; i<globalParams.numLegs; i++) {

            __element({tag: "div", attributes: {id: "leg-"+(i+1), class: "trade-leg"}}, "more-params-container");

              __element({tag: "span", content: "This is a test.", attributes: {}}, "leg-"+(i+1));
          };

          elementAnim.ease("in", "more-params-container", 10, 0.5, 15);

      } else {

        alert("Please enter a valid number string as a current price.");
        return;
      };
  };
