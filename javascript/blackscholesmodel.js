//build HTML elements native to the Black-Scholes model page
  BSM = function() {

    //BUILD ELEMENTS NEEDED TO SPECIFY THE NUMBER OF TRADE LEGS
      numLegsText = htmlString('span', 'Please select the number of legs in the trade:', { id: "num-legs-text" });

      numLegsDropDown = htmlString('select',

        htmlString('option', '1', { value: "1" }) +
        htmlString('option', '2', { value: "2", selected: "selected" }) +
        htmlString('option', '3', { value: "3" }) +
        htmlString('option', '4', { value: "4" }) +
        htmlString('option', '5', { value: "5" }) +
        htmlString('option', '6', { value: "6" }),

        { id: "num-legs-dropdown" }
      );

      numLegsNext = htmlString('button', 'continue', { id: "num-legs-button", type: "button", onclick: "specifyAdditionalParams()" });

      numLegsContainer = htmlString('div', numLegsText + numLegsDropDown + numLegsNext, { id: "num-legs-container" });


    //BUILD ELEMENTS NEEDED TO SPECIFY ADDITIONAL TRADE PARAMETERS
      specifyAdditionalParams = function() {
       
        //DISABLE THE TRADE LEGS DROPDOWN MENU AND 'CONTINUE' BUTTON
          (disableLegsElements = function() {

            var disable = { one: "num-legs-dropdown", two: "num-legs-button" };

            for(element in disable) { document.getElementById(disable[element]).disabled = true };
          })();


        var numLegs = document.getElementById("num-legs-dropdown").value;

        (moreParamsElements = function() {

          //MORE CODE BUILDING ADDITIONAL HTML ELEMENTS AND IMPLEMENTING 'numLegs' GOES HERE...
          //
          //
          //
          //
          //
          /////////////////////////////////////////////////////////////////////////////////////
        })();
      };


    //BUILD AND RETURN THE FORM
      form = htmlString('div', numLegsContainer, { id: "form" });

      return form;
  };
