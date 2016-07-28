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
            }
        }
    },


    //Object size - thanks to 'James Coglan' on stackoverflow.com for this
    size: function(obj) {

        var card = 0;

        for(key in obj) { if(obj.hasOwnProperty(key)) { card++ } }

        return card;
    },


    //Object values sum
    sum: function(obj) {

        //some basic error handling, else round values if parameters provided
        for(key in obj) { if(typeof obj[key] !== 'number') { return "The 'obj.sum()' method requires all object values to be numbers." } }

        //thanks to 'Sirko' on stackoverflow.com for this
        return Object.keys(obj).reduce(function(s,key) { return s + obj[key] }, 0);
    },


    //Object values average
    avg: function(obj) {

        return this.sum(obj)/this.size(obj);
    },


    //Object min and max - thanks to 'levi' on stackoverflow.com for this
    min: function(obj) {

        return Object.keys(obj).reduce(function(m,n) { return obj[n] < m ? obj[n] : m }, Infinity);
    },

    max: function(obj) {
        
        return Object.keys(obj).reduce(function(m,n) { return obj[n] > m ? obj[n] : m }, -Infinity);
    },


    //Given two sets, find the global range of the values
    range: function(set1, set2) {

        var all = array.merge(set1, set2);

        return Math.abs(this.max(all)-this.min(all));
    },


    //Return all keys of an object whose properties meet a given condition
    filterKeys: function(obj, test) {

        var keys = [];

        for(key in obj) { if(test(obj[key])) { keys.push(key) } }

        return keys;
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
    },


    //Merge all elements of two arrays OR all properties of two objects; return an array
    merge: function(a1, a2) {

        var merged = [];

        for(i=0; i<Object.keys(a1).length; i++) { merged[i] = a1[Object.keys(a1)[i]] }

        for(j=0; j<Object.keys(a2).length; j++) { merged[obj.size(a1)+j] = a2[Object.keys(a2)[j]] }

        //remove duplicate elements
        return this.unique(merged);
    },


    //Find the intersection of two arrays
    intersect: function(a1, a2) { // <--- THIS FUNCTION NOT CURRENTLY IN USE

        //thanks to 'Anon.' on stackoverflow.com for help on this
        var x = a1.filter(function(element) { return a2.indexOf(element) != -1 });

        //remove duplicate elements
        return this.unique(x);
    }
})


//HTML element functions
elem = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    //Selection
    select: function(idString) {

        return document.getElementById(idString) || document.querySelector(idString);
    },


    //Disable or enable multpile classes of elements at once
    avail: function(idObject, bool) { // <--- THIS FUNCTION NOT CURRENTLY IN USE

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


    //Creation
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


    //Remove children from an element of the DOM
    destroyChildren: function(idStringParent, idArrayChildren) {

        idArrayChildren = typeof idArrayChildren !== 'undefined' ? idArrayChildren : 'none specified';

        var parent   = this.select(idStringParent),
            children = idArrayChildren;

        switch(children) {

            //remove all children - thanks to Gabriel McAdams on stackoverflow.com for this
            case 'none specified':
                while(parent.firstChild) { parent.removeChild(parent.firstChild) }
                break;

            //remove specified children
            default:
                for(i=0; i<children.length; i++) { parent.removeChild(this.select(children[i])) }
                break;
        }
    },


    //Transition animations
    ease: function(type, idString, increment, maxHeight, callback) {

        var element = this.select(idString).style,
            height  = 0,
            timer   = setInterval(render, (1000/50)); //50 fps

        function render() {

            height = (maxHeight-height > 0) ? height + increment : maxHeight;

            if(height == maxHeight) {

                clearInterval(timer);

                if(typeof callback === 'function') { callback() }

            } else {

                height += increment;

                if(type == "in") { element.height = height + 'vw' } else if(type == "out") { element.height = maxHeight - height + 'vw' }
            }
        }
    },

    fade: function(type, idString, increment, callback) {

        var element = this.select(idString).style,
            opacity = 0,
            timer   = setInterval(render, (1000/50)); //50 fps

        function render() {

            opacity = (1-opacity > 0) ? opacity + increment : 1;

            if(opacity == 1) {

                clearInterval(timer);

                if(typeof callback === 'function') { callback() }

            } else {

                opacity += increment;

                if(type == "in") { element.opacity = opacity } else if(type == "out") { element.opacity = 1 - opacity }
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
	INTEGRAL: function(leftBound, rightBound, numSubIntervals, expression) { // <--- THIS FUNCTION NOT CURRENTLY IN USE

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

            //some basic error handling
        	return "The number of sub-intervals, 'n', must be even.";
    	}
	},


	//Standard Normal Distribution PDF
	NORM: function(x) {

    	return (1/Math.sqrt(2*Math.PI))*Math.pow(Math.E,(-1/2)*Math.pow(x,2));
	},


	//Cumulative Standard Normal Distribution functions
	CUSTNORM: function(z, n) { // <--- THIS FUNCTION NOT CURRENTLY IN USE

        //this method is far slower than the logistic approximation below; n >= 200 is necessary for reasonable accuracy in most trade setups
    	switch(b<0) {

        	case true:
            	return (1/2)-this.INTEGRAL(z, 0, n, this.NORM);
            	break;

        	case false:
            	return (1/2)+this.INTEGRAL(0, z, n, this.NORM);
            	break;
    	}
	},

    //Logistic approximation - thanks to http://http://www.jiem.org/index.php/jiem/article/viewFile/60/27 for this
    LOGISTIC: function(z) {

        return Math.pow((1+Math.pow(Math.E,-(0.07056*Math.pow(z,3)+1.5976*z))),-1);
    }
})

// END MATH /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// MISC /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//disable certain keys
disableKey = function(key) {

    block = function(e) { if((e.keyCode || e.charCode) == key) {e.preventDefault()} }

    document.addEventListener('keydown', block);

    //required for certain keys in Firefox (i.e., the spacebar)
    document.addEventListener('keyup', block);
}

// END MISC /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
