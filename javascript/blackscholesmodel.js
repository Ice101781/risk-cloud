//build HTML elements native to the Black-Scholes model page
  blackScholesContent = function() {

    //BUILD ELEMENTS NEEDED TO SPECIFY THE NUMBER OF TRADE LEGS
      numLegsText = htmlString('span', 'Please select the number of legs in the trade:', { id: "num-legs-text" });

      numLegsDropDown = htmlString('select',

        htmlString('option', '1', { value: "1" }) +
        htmlString('option', '2', { value: "2", selected: "selected" }) +
        htmlString('option', '3', { value: "3" }) +
        htmlString('option', '4', { value: "4" }),

        { id: "num-legs-dropdown" }
      );

      numLegsNext = htmlString('button', 'continue', { id: "num-legs-button", type: "button", onclick: "specifyAdditionalParams()" });

      numLegsContainer = htmlString('div', numLegsText + numLegsDropDown + numLegsNext, { id: "num-legs-container" });


    //BUILD ELEMENTS NEEDED TO SPECIFY ADDITIONAL TRADE PARAMETERS
      moreParamsContainer = htmlString('ul', 'more params here as an unordered list', { id: "more-params-container" });

      specifyAdditionalParams = function() {

        //DISABLE THE TRADE LEGS DROPDOWN MENU AND 'CONTINUE' BUTTON
          (disableLegsElements = function() {

            var disable = { one: "num-legs-dropdown", two: "num-legs-button" };

            for(element in disable) { document.getElementById(disable[element]).disabled = true };
          })();


        //CAPTURE # OF TRADE LEGS PARAMETER AND DYNAMICALLY BUILD ADDITIONAL ELEMENTS
          globalParams.numLegs = document.getElementById("num-legs-dropdown").value;

          (moreParamsElements = function() {

            //MORE CODE HERE>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

            elementEaseIn("more-params-container", 0.2, 20);
          })();
      };


    //BUILD AND RETURN THE FORM
      form = htmlString('div', numLegsContainer + moreParamsContainer, { id: "form" });

      return form;
  };
