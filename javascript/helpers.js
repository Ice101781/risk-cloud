// OBJECTS, ARRAYS AND ELEMENTS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Object functions
obj = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    //Reset pre-defined parameter values in an object
    reset: function(obj) {

        for(element in obj) {

            switch(typeof obj[element]) {

                case 'number':
                    obj[element] = 0;
                    break;

                case 'object':
                    obj[element] = {};
                    break;

                default:
                    break;
            }
        }
    },


    //Object size - thanks to 'James Coglan' on stackoverflow.com for this
    size: function(obj) {

        var s = 0;

        for(key in obj) { if(obj.hasOwnProperty(key)) {s++} }

        return s;
    },


    //Object min and max - thanks to 'levi' on stackoverflow.com for this
    min: function(obj) {

        return Object.keys(obj).reduce(function(m,n) {return obj[n] < m ? obj[n] : m}, Infinity);
    },


    max: function(obj) {
        
        return Object.keys(obj).reduce(function(m,n) {return obj[n] > m ? obj[n] : m}, -Infinity);
    }
})


//Array functions
array = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    //Remove duplicate elements from an array - thanks to 'georg' on stackoverflow.com for this 
    unique: function(array) {

        return array.filter(function(element, index) { return array.indexOf(element) == index });
    }
})


//Element functions
elem = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    //HTML element selection
    select: function(idString) {

        return document.getElementById(idString) || document.querySelector(idString);
    },


    //Disable or enable multpile classes of elements at once
    avail: function(idObject, bool) {

        for(key in idObject) {

            switch(typeof idObject[key]) {

                case 'string':
                    this.select(idObject[key]).disabled = !bool;
                    break;

                case 'object':
                    for(subKey in idObject[key]) { this.select(idObject[key][subKey]).disabled = !bool }
                    break;
            }
        }
    },


    //HTML element creation
    create: function(paramsObject, appendId) {

        //create a new document element
        var element = document.createElement(paramsObject.tag);

        //add empty string as content if none is provided
        if(typeof paramsObject.content === 'undefined') { paramsObject.content = "" }

        element.appendChild(document.createTextNode(paramsObject.content));

        //add attributes
        for(attr in paramsObject.attributes) { element.setAttribute(attr, paramsObject.attributes[attr]) }

        //append the new element to a parent element
        this.select(appendId).appendChild(element);

        return element;
    },


    //Remove all children from an element - thanks to Gabriel McAdams on stackoverflow.com for this
    destroy: function(idString) {

        var element = this.select(idString);

        while(element.firstChild) { element.removeChild(element.firstChild) }
    },


    //HTML element ease animation
    ease: function(type, idString, increment, maxHeight, callback) {

        var element = this.select(idString).style,
            height = 0,
            timer = setInterval(render, (1000/50));

        function render() {

            height = (maxHeight-height > 0) ? height + increment : maxHeight;

            if(height == maxHeight) {

                clearInterval(timer);
                if(typeof callback === 'function') { callback() }

            } else {

                height += increment;
                if(type == "in") {element.height = height + 'vw'} else if(type == "out") {element.height = maxHeight - height + 'vw'}
            }
        }
    },


    //HTML element opacity animation
    fade: function(type, idString, inc, callback) {

        var element = this.select(idString).style,
            opacity = 0,
            timer = setInterval(render, (1000/50));

        function render() {

            opacity = (1-opacity > 0) ? opacity + inc : 1;

            if(opacity == 1) {

                clearInterval(timer);
                if(typeof callback === 'function') { callback() }

            } else {

                opacity += inc;
                if(type == "in") {element.opacity = opacity} else if(type == "out") {element.opacity = 1 - opacity}
            }
        }
    }
})

//END OBJECTS, ARRAYS AND ELEMENTS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// MATH /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

math = function(properties) {
	
	var self = function() { return };

	for(prop in properties) { self[prop] = properties[prop] }

	return self;
}({

	//Compute integrals numerically using Simpson's rule
	INTEGRAL: function(leftBound, rightBound, numSubIntervals, expression) {

		var a = leftBound,
        	b = rightBound,
        	n = numSubIntervals,
        	f = expression;

    	if(n % 2 == 0) {

        	var sum1 = 0,
            	sum2 = 0;

        	for(var i=1; i<(n/2); i++) { sum1 += f(((((n/2)-i)*a)+(i*b))/(n/2)) }				

        	for(var i=1; i<(n/2)+1; i++) { sum2 += f((((((n+1)/2)-i)*a)+((i-(1/2))*b))/(n/2)) }

        	return ((b-a)/(3*n))*(f(a)+(2*sum1)+(4*sum2)+f(b));

    	} else {

        	return "The number of sub-intervals, 'n', must be even.";
    	}
	},


	//Standard Normal Distribution PDF
	NORM: function(x) {

    	return (1/Math.sqrt(2*Math.PI))*Math.pow(Math.E, (-1/2)*Math.pow(x,2));
	},


	//Cumulative Standard Normal Distribution function
	CUSTNORM: function(b) {

    	switch(b<0) {

        	case true:
            	return +((1/2)-this.INTEGRAL(b, 0, 10, this.NORM)).toFixed(5);
            	break;

        	case false:
            	return +((1/2)+this.INTEGRAL(0, b, 10, this.NORM)).toFixed(5);
            	break;
    	}
	}
})

// END MATH /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
