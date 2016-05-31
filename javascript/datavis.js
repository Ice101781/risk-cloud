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

		//set camera position and add camera, light to the scene
		camera.position.set(radius*Math.sin(phi)*Math.cos(theta), radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi));
		scene.add(camera);
		scene.add(light);


		//the 2D view
		show2DView = function() {

			//local vars for graph
			var //
			 	//general and background vars
				//
				w = 1,
				h = 0.4, //container aspect is 2.5:1
				scalar = 0.925,
				VFOVrad = Math.PI/4,
				zDist = -h/(2*Math.tan(VFOVrad/2)),
				plane1 = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), new THREE.MeshBasicMaterial({ color: 'rgb(200,200,200)' })),
				plane2 = new THREE.Mesh(new THREE.PlaneGeometry(scalar*w, scalar*h, 1, 1), new THREE.MeshBasicMaterial({ color: 0x333333 })),
				//
				//gridlines and labels vars
				//
				numHGridLines = 25,
				numVGridLines = 7,
        		canvasW = 3*Math.floor(width*(1-(1.01)*scalar)),
        		canvasH = 3*Math.floor(height*(0.6)*scalar/(numHGridLines-1)),
	        	xPos = canvasW/2,
	        	yPos = 5*canvasH/6,
	        	gridlines = { xaxis: {}, yaxis: {} }, //COULD WE USE ANOTHER DATA STRUCTURE HERE?
				labels = { xaxis: {canvas: {}, context: {}, texture: {}, mesh: {}}, yaxis: {canvas: {}, context: {}, texture: {}, mesh: {}} },
				//
	   	     	//data vars
	   	     	//
	        	data = g.PROFITLOSS_DATA,
	        	globalRange = Math.abs(obj.max([obj.max(data[0]), obj.max(data[obj.min(g.EXPIRY)])])-obj.min([obj.min(data[0]), obj.min(data[obj.min(g.EXPIRY)])])),
				dataSets = { T: data[obj.min(g.EXPIRY)], 0: data[0] }, //COULD WE USE ANOTHER DATA STRUCTURE HERE?
				cloud = { T: new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 1.75*scalar*w/obj.size(dataSets[0]), color: 0xff0000})),
						  0: new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 1.75*scalar*w/obj.size(dataSets[0]), color: 0x0000ff})) };

			//background
			plane1.position.set(0, 0, zDist);
			plane2.position.set(w/2*(1-scalar), h/2*(1-scalar*numHGridLines/(numHGridLines-1)), zDist);
			camera.add(plane1, plane2);

			//add horizontal gridlines and labels
			for(var i=0; i<numHGridLines; i++) {

				//gridlines
				var gridlineGeom = new THREE.Geometry();

					gridlineGeom.vertices.push(new THREE.Vector3(w/2*(1-(1.01)*scalar*2), h/2*(1-scalar*(2*i+1)/(numHGridLines-1)), zDist)); //left vertex
					gridlineGeom.vertices.push(new THREE.Vector3(w/2*(1-(1.01)*scalar), h/2*(1-scalar*(2*i+1)/(numHGridLines-1)), zDist)); //center vertex
					gridlineGeom.vertices.push(new THREE.Vector3(w/2, h/2*(1-scalar*(2*i+1)/(numHGridLines-1)), zDist)); //right vertex

				gridlines.yaxis[i] = new THREE.Line(gridlineGeom, new THREE.LineBasicMaterial({color: 0x444444}));

				camera.add(gridlines.yaxis[i]);

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

					case (numHGridLines-1)/2:
						//set color and value of the x-axis
						gridlines.yaxis[i].material.color.setHex(0x777777);
						labels.yaxis.context[i].fillText('0', xPos, yPos);
						break;

					default:
						//set gridline value
						labels.yaxis.context[i].fillText(+(globalRange*(1-2*i/(numHGridLines-1))).toFixed(2), xPos, yPos);
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
				camera.add(labels.yaxis.mesh[i]);
			}

			//add vertical gridlines and labels
			for(var i=0; i<numVGridLines; i++) {


				//MOR COD HEER PLZ
			}

			//data
			for(t in dataSets) {

				//loop variable
				var k=0;

				//add vertices (as vectors) to the point cloud geometries
				for(val in dataSets[t]) {

					cloud[t].geometry.vertices.push(new THREE.Vector3(

						scalar*w*((k+0.5)/obj.size(dataSets[0])-0.5), //x-coordinate

						scalar*h*(dataSets[t][val]/(2*globalRange)), //y-coordinate

						0.00001 //z-coordinate; place points just in front of gridlines, background
					));

					k++;
				}

				cloud[t].position.copy(plane2.position);
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
