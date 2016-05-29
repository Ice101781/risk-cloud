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
			degVFOV  = 45,
			aspect   = width/height,
			near     = 0.1,
			far      = 100,
			camera   = new THREE.PerspectiveCamera(degVFOV, aspect, near, far),
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

		//set camera position and add camera, light to the scene
		camera.position.set(radius*Math.sin(phi)*Math.cos(theta), radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi));
		scene.add(camera);
		scene.add(light);


		// 2D VIEW //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//
		//local vars for graph
		//	//
		var //general and background vars
			//
			w = 1,
			h = 0.4, //aspect is 2.5:1
			scalar = 0.925,
			radVFOV = Math.PI/4,
			zDist = -h/(2*Math.tan(radVFOV/2)),
			plane1 = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), new THREE.MeshBasicMaterial({ color: 'rgb(200,200,200)' })),
			plane2 = new THREE.Mesh(new THREE.PlaneGeometry(scalar*w, scalar*h, 1, 1), new THREE.MeshBasicMaterial({ color: 0x333333 })),
			//
			//gridlines and labels vars
			//
			numGridLines = 25,
        	canvasW = 3*Math.floor(width*(1-(1.01)*scalar)),
        	canvasH = 3*Math.floor(height*(0.6)*scalar/(numGridLines-1)),
        	xPos = canvasW/2,
        	yPos = 3*canvasH/4,
        	gridlines = {},
			vLbls = { canvas: {}, context: {}, texture: {}, mesh: {} },
			//
   	     	//data vars
   	     	//
   	     	k=0,
        	data = g.PROFITLOSS_DATA,
        	globalRange = Math.abs(obj.max([obj.max(data[0]), obj.max(data[obj.min(g.EXPIRY)])])-obj.min([obj.min(data[0]), obj.min(data[obj.min(g.EXPIRY)])])),
        	//COULD WE USE ANOTHER DATA STRUCTURE HERE?
			dataSets = { T: data[obj.min(g.EXPIRY)], 0: data[0] },
			cloud = { T: new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 1.75*scalar*w/obj.size(dataSets[0]), color: 0xff0000})),
					  0: new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 1.75*scalar*w/obj.size(dataSets[0]), color: 0x0000ff})) };

		//background
		plane1.position.set(0, 0, zDist);
		plane2.position.set(w/2*(1-scalar), h/2*(1-scalar*numGridLines/(numGridLines-1)), zDist);
		camera.add(plane1, plane2);

		//data
		for(t in dataSets) {

			//add vertices (as vectors) to the point cloud geometries
			for(val in dataSets[t]) {

				cloud[t].geometry.vertices.push(new THREE.Vector3(

					scalar*w*((k+0.5)/obj.size(dataSets[0])-0.5), //x-coordinate

					scalar*h*(dataSets[t][val]/(2*globalRange)), //y-coordinate

					0.0001 //z-coordinate; place points slightly in front of gridlines, background
				));

				k++;
			}

			//reset the loop variable
			k=0;

			cloud[t].position.copy(plane2.position);
			camera.add(cloud[t]);
		}

		//add gridlines and labels
		for(var i=0; i<numGridLines; i++) {

			//gridlines
			gridlines[i] = new THREE.Mesh(new THREE.PlaneGeometry(w*(1.01)*scalar, h*(0.002)*scalar, 1, 1), new THREE.MeshBasicMaterial({color: 0x444444}));

			gridlines[i].position.set(w/2*(1-(1.01)*scalar), h/2*(1-scalar*(2*i+1)/(numGridLines-1)), zDist);
			camera.add(gridlines[i]);

			//labels
			vLbls.canvas[i] = document.createElement('canvas');

			vLbls.canvas[i].width = canvasW;
			vLbls.canvas[i].height = canvasH;

			vLbls.context[i] = vLbls.canvas[i].getContext('2d');

			//paint the background
			vLbls.context[i].fillStyle = 'rgb(200,200,200)';
			vLbls.context[i].fillRect(0, 0, canvasW, canvasH);

			//set color, font and alignment for the text
			vLbls.context[i].fillStyle = 'rgb(0,0,0)';
			vLbls.context[i].font = (canvasH-1) + 'px Arial';
			vLbls.context[i].textAlign = 'center';

			switch(i) {

				case (numGridLines-1)/2:
					//set color and value of the x-axis
					gridlines[i].material.color.setHex(0x777777);
					vLbls.context[i].fillText('0', xPos, yPos);
					break;

				default:
					//set gridline value
					vLbls.context[i].fillText(+(globalRange*(1-2*i/(numGridLines-1))).toFixed(2), xPos, yPos);
			}

			vLbls.texture[i] = new THREE.Texture(vLbls.canvas[i]);

			//WHAT DO THESE ACTUALLY DO?
			vLbls.texture[i].minFilter = THREE.LinearFilter;
			vLbls.texture[i].needsUpdate = true;

			vLbls.mesh[i] = new THREE.Mesh(
							 	new THREE.PlaneGeometry(w*(1-(1.01)*scalar), h*(0.6)*scalar/(numGridLines-1), 1, 1),
								new THREE.MeshBasicMaterial({map: vLbls.texture[i]})
							);

			vLbls.mesh[i].position.set(-w/2*(1.01)*scalar, h/2*(1-scalar*((2*i+1+(0.6)/2)/(numGridLines-1)-(0.002))), zDist);
			camera.add(vLbls.mesh[i]);
		}
		//
		// END 2D VIEW //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


		//re-size the 2D view if the window size is changed
		window.addEventListener('resize', function onWindowResize() {

			var width = elem.select("output-view-container").offsetWidth,
			    height = elem.select("output-view-container").offsetHeight;
  
  			renderer.setSize(width,height);
  			camera.aspect = (width/height);
  		});


		//animation
		render = function() {

			renderer.render(scene, camera);
			requestAnimationFrame(render);
			//console.log();
		}

		render();
		//console.log();
	}
})
