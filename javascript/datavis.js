visuals = function(properties) {

	var self = function() { return };

	for(prop in properties) { self[prop] = properties[prop] }

	return self;
}({

	init: function() {

		var width    = elem.select("output-view-container").offsetWidth,
            height   = elem.select("output-view-container").offsetHeight,
			scene    = new THREE.Scene(),
			renderer = new THREE.WebGLRenderer({antialias: false, alpha: false}),
			VFOVdeg  = 45,
			aspect   = width/height,
			near     = 0.1,
			far      = 100,
			camera   = new THREE.PerspectiveCamera(VFOVdeg, aspect, near, far),
			phi      = 0,
			theta    = 0,
			radius   = 0,
			light    = new THREE.AmbientLight(0xffffff),
			mouse    = {x: 0, y: 0};

		//set params and attach the renderer to the container when available
		if(elem.select("output-view-container") != null) {

			renderer.setSize(width, height);
			renderer.setClearColor(0x000000);
			elem.select("output-view-container").appendChild(renderer.domElement);
		}

		//re-size the 2D view if the window size is changed
		window.addEventListener('resize', function onWindowResize() {

			var width = elem.select("output-view-container").offsetWidth,
			    height = elem.select("output-view-container").offsetHeight;
  
  			renderer.setSize(width,height);
  			camera.aspect = (width/height);
  		});

		//set camera position and add light, camera to the scene
		camera.position.set(radius*Math.sin(phi)*Math.cos(theta), radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi));
		scene.add(light, camera);


		//THE 2D VIEW
		show2DView = function() {

			//LOCAL VARS FOR THE GRAPH
			var //
			 	//general and background vars
				//
				w = 1,
				h = 0.4, //container aspect is 2.5:1
				scalar = 0.925,
				VFOVrad = Math.PI/4,
				zDist = -h/(2*Math.tan(VFOVrad/2)),
				plane1 = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), new THREE.MeshBasicMaterial({ color: 'rgb(200,200,200)' })),
				plane2 = new THREE.Mesh(new THREE.PlaneGeometry(w*scalar, h*scalar, 1, 1), new THREE.MeshBasicMaterial({ color: 0x333333 })),
				//
				//gridlines and labels vars
				//
				numHGridLines = 25,
				numVGridLines = 7,
        		canvasW = 3*Math.floor(width*(1-(1.01)*scalar)),
        		canvasH = 3*Math.floor(height*(0.6)*scalar/(numHGridLines-1)),
	        	xPos = canvasW/2,
	        	yPos = 5*canvasH/6, //WHY IS THIS NOT 'canvasH/2'?
	        	lines = { xaxis: {}, yaxis: {} }, //COULD WE USE ANOTHER DATA STRUCTURE HERE?
				labels = { xaxis: {canvas: {}, context: {}, texture: {}, mesh: {}}, yaxis: {canvas: {}, context: {}, texture: {}, mesh: {}} }, //AND HERE?
				//
	   	     	//data vars
	   	     	//
	        	data = g.PROFITLOSS_DATA,
	        	globalRange = Math.abs(obj.max([obj.max(data[0]), obj.max(data[obj.min(g.EXPIRY)])])-obj.min([obj.min(data[0]), obj.min(data[obj.min(g.EXPIRY)])])),
				dataSets = { T: data[obj.min(g.EXPIRY)], 0: data[0] }, //COULD WE USE ANOTHER DATA STRUCTURE HERE?
				cloud = { T: new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 1.75*w*scalar/obj.size(dataSets[0]), color: 0xff0000})),
						  0: new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 1.75*w*scalar/obj.size(dataSets[0]), color: 0x0000ff})) };

			//position the background
			plane1.position.set(0, 0, zDist);
			plane2.position.set(w/2*(1-scalar), h/2*(1-scalar*numHGridLines/(numHGridLines-1)), zDist);
			camera.add(plane1, plane2);

			//ADD HORIZONTAL GRIDLINES AND LABELS
			for(var i=0; i<numHGridLines; i++) {

				//gridlines
				var gridlineGeom = new THREE.Geometry();

					gridlineGeom.vertices.push(new THREE.Vector3(w/2*(1-(1.01)*scalar*2), h/2*(1-scalar*(2*i+1)/(numHGridLines-1)), zDist)); //left vertex
					gridlineGeom.vertices.push(new THREE.Vector3(w/2*(1-(1.01)*scalar), h/2*(1-scalar*(2*i+1)/(numHGridLines-1)), zDist)); //center vertex
					gridlineGeom.vertices.push(new THREE.Vector3(w/2, h/2*(1-scalar*(2*i+1)/(numHGridLines-1)), zDist)); //right vertex

				lines.yaxis[i] = new THREE.Line(gridlineGeom, new THREE.LineBasicMaterial({color: 0x444444}));

				//labels
				labels.yaxis.canvas[i] = document.createElement('canvas');

				labels.yaxis.canvas[i].width = canvasW;
				labels.yaxis.canvas[i].height = canvasH;

				labels.yaxis.context[i] = labels.yaxis.canvas[i].getContext('2d');

				//paint the background
				labels.yaxis.context[i].fillStyle = 'rgb(200,200,200)';
				labels.yaxis.context[i].fillRect(0, 0, canvasW, canvasH);

				//set color, font and alignment for the text
				labels.yaxis.context[i].fillStyle = 'rgb(0,0,0)';
				labels.yaxis.context[i].font = (canvasH-1) + 'px Arial';
				labels.yaxis.context[i].textAlign = 'center';

				switch(i) {

					//set color and value of the x-axis
					case (numHGridLines-1)/2:
						lines.yaxis[i].material.color.setHex(0x777777);
						labels.yaxis.context[i].fillText('0', xPos, yPos);
						break;

					//set all other gridline values
					default:
						labels.yaxis.context[i].fillText((globalRange*(1-2*i/(numHGridLines-1))).toFixed(2), xPos, yPos);
				}

				labels.yaxis.texture[i] = new THREE.Texture(labels.yaxis.canvas[i]);

				//WHAT DO THESE ACTUALLY DO?
				labels.yaxis.texture[i].minFilter = THREE.LinearFilter;
				labels.yaxis.texture[i].needsUpdate = true;
				//

				labels.yaxis.mesh[i] = new THREE.Mesh(
								 	   	   new THREE.PlaneGeometry(w*(1-(1.01)*scalar), h*(0.6)*scalar/(numHGridLines-1), 1, 1),
									   	   new THREE.MeshBasicMaterial({map: labels.yaxis.texture[i]})
									   );

				labels.yaxis.mesh[i].position.set(-w/2*(1.01)*scalar, h/2*(1-scalar*((2*i+1+(0.6)/4)/(numHGridLines-1)-(0.002))), zDist);

				//add gridlines and labels to the scene
				camera.add(lines.yaxis[i], labels.yaxis.mesh[i]);
			}

			//ADD VERTICAL TICK MARKS AND DOTTED LINES, LABELS
			//for(var i=0; i<numVGridLines; i++) {

				//tick marks
				var tickGeom = new THREE.Geometry();

				tickGeom.vertices.push(new THREE.Vector3(w*(-scalar+0.5), h/2*(1-scalar*2), zDist)); //top vertex
				tickGeom.vertices.push(new THREE.Vector3(w*(-scalar+0.5), h/2*(1-scalar*(2*numHGridLines-1)/(numHGridLines-1)), zDist)); //center vertex
				tickGeom.vertices.push(new THREE.Vector3(w*(-scalar+0.5), h/2*(1-scalar*(2*numHGridLines)/(numHGridLines-1)), zDist)); //bottom vertex

				tick = new THREE.Line(tickGeom, new THREE.LineBasicMaterial({color: 0xffff00}));

				//dotted lines
				var dotLine = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 1.75*w*scalar/obj.size(dataSets[0]), color: 0xffff00}));

				for(var j=0; j<(4*numHGridLines-6); j++) {
				
					dotLine.geometry.vertices.push(new THREE.Vector3(

						w*(-scalar+0.5), //x-coordinate

						h*(0.5+scalar*(0.25*(j+1)/(numHGridLines-1)-1)), //y-coordinate

						zDist //z-coordinate
					));
				}

				camera.add(tick, dotLine);
			//}

			//DATA
			for(t in dataSets) {

				//loop variable
				var k=0;

				//add vertices (as vectors) to the point cloud geometries
				for(val in dataSets[t]) {

					cloud[t].geometry.vertices.push(new THREE.Vector3(

						w*(scalar*((k+0.5)/obj.size(dataSets[0])-1)+0.5), //x-coordinate

						h/2*(scalar*(dataSets[t][val]/globalRange-numHGridLines/(numHGridLines-1))+1), //y-coordinate

						zDist+0.00001 //z-coordinate - place points just in front of the grid and background
					));

					k++;
				}

				camera.add(cloud[t]);
			}
		}


		//animation
		render = function() {

			renderer.render(scene, camera);
			requestAnimationFrame(render);
			//console.log();
		}

		render();
		show2DView();
		//console.log();
	}
})
