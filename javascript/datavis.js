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
				plane1 = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), new THREE.MeshBasicMaterial({color: 'rgb(200,200,200)'})),
				plane2 = new THREE.Mesh(new THREE.PlaneGeometry(w*scalar, h*scalar, 1, 1), new THREE.MeshBasicMaterial({color: 0x333333})),
				//
				//gridlines and labels vars
				//
				numH = 25,
				numV = 7,
        		canvasW = 3*Math.floor(width*(1-(1.01)*scalar)), //WHY DO THESE DIMENSIONS REQUIRE A MULTIPLIER?
        		canvasH = 3*Math.floor(height*(0.6)*scalar/(numH-1)), //
	        	xPos = canvasW/2,
	        	yPos = 5*canvasH/6, //WHY IS THIS NOT 'canvasH/2'?
	        	lines = { xaxis: {tick: {}, ext: {}, dots: {}}, yaxis: {} }, //COULD WE USE ANOTHER DATA STRUCTURE HERE?
				labels = { xaxis: {canvas: {}, context: {}, texture: {}, mesh: {}}, yaxis: {canvas: {}, context: {}, texture: {}, mesh: {}} }, //AND HERE?
				//
	   	     	//data vars
	   	     	//
	        	data = g.PROFITLOSS_DATA,
	        	gRange = globalRange(data, 0, obj.min(g.EXPIRY)) !== 0 ? globalRange(data, 0, obj.min(g.EXPIRY)) : 1,
				dataSets = { T: data[obj.min(g.EXPIRY)], 0: data[0] }, //COULD WE USE ANOTHER DATA STRUCTURE HERE?
				cloud = { T: new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 1.75*w*scalar/obj.size(dataSets[0]), color: 0xff0000})),
						  0: new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 1.75*w*scalar/obj.size(dataSets[0]), color: 0x0000ff})) };

			//position the background
			plane1.position.set(0, 0, zDist);
			plane2.position.set(w/2*(1-scalar), h/2*(1-scalar*numH/(numH-1)), zDist);
			camera.add(plane1, plane2);

			//ADD HORIZONTAL GRIDLINES AND VERTICAL AXIS LABELS
			for(var i=0; i<numH; i++) {

				//gridlines
				var gridlineGeom = new THREE.Geometry();

					gridlineGeom.vertices.push(new THREE.Vector3(w/2*(1-(1.01)*scalar*2), h/2*(1-scalar*(2*i+1)/(numH-1)), zDist)); //left vertex
					gridlineGeom.vertices.push(new THREE.Vector3(w/2*(1-(1.01)*scalar), h/2*(1-scalar*(2*i+1)/(numH-1)), zDist)); //center vertex
					gridlineGeom.vertices.push(new THREE.Vector3(w/2, h/2*(1-scalar*(2*i+1)/(numH-1)), zDist)); //right vertex

				lines.yaxis[i] = new THREE.Line(gridlineGeom, new THREE.LineBasicMaterial({color: 0x444444}));

				//labels
				labels.yaxis.canvas[i] = document.createElement('canvas');

				labels.yaxis.canvas[i].width = canvasW;
				labels.yaxis.canvas[i].height = canvasH;

				labels.yaxis.context[i] = labels.yaxis.canvas[i].getContext('2d');

				//paint the canvas background
				labels.yaxis.context[i].fillStyle = 'rgb(200,200,200)';
				labels.yaxis.context[i].fillRect(0, 0, canvasW, canvasH);

				//set color, font and alignment for the label text
				labels.yaxis.context[i].fillStyle = 'rgb(0,0,0)';
				labels.yaxis.context[i].font = (canvasH-1)+'px Arial';
				labels.yaxis.context[i].textAlign = 'center';

				//set color and value of the x-axis as well as all other gridline values
				switch(i) {

					case (numH-1)/2:
						lines.yaxis[i].material.color.setHex(0x777777);
						labels.yaxis.context[i].fillText('0', xPos, yPos);
						break;

					//MINOR ROUNDING ISSUE HERE, WORTH TRYING TO FIX?
					default:
						labels.yaxis.context[i].fillText((gRange*(1-2*i/(numH-1))).toFixed(2), xPos, yPos);
				}

				//set canvas as texture and specify texture parameters
				labels.yaxis.texture[i] = new THREE.Texture(labels.yaxis.canvas[i]);
				labels.yaxis.texture[i].minFilter = THREE.LinearFilter; //WHAT DOES THIS ACTUALLY DO?
				labels.yaxis.texture[i].needsUpdate = true; //AND THIS?

				//create label mesh and map canvas texture to it
				labels.yaxis.mesh[i] = new THREE.Mesh(
								 	   	   new THREE.PlaneGeometry(w*(1-(1.01)*scalar), h*(0.6)*scalar/(numH-1), 1, 1),
									   	   new THREE.MeshBasicMaterial({map: labels.yaxis.texture[i]})
									   );

				//set label position
				labels.yaxis.mesh[i].position.set(-w/2*(1.01)*scalar, h/2*(1-scalar*((2*i+1+(0.6)/4)/(numH-1)-(0.002))), zDist);

				//add gridline and label to the scene
				camera.add(lines.yaxis[i], labels.yaxis.mesh[i]);
			}

			//ADD VERTICAL TICK MARKS AND DOTTED LINES, AND HORIZONTAL AXIS LABELS
			for(var i=0; i<numV; i++) {

				//tick marks
				var tickGeom = new THREE.Geometry();

				tickGeom.vertices.push(new THREE.Vector3(w*(scalar*(i/6-1)+0.5), h/2*(1-scalar*2), zDist)); //top vertex
				tickGeom.vertices.push(new THREE.Vector3(w*(scalar*(i/6-1)+0.5), h/2*(1-scalar*(2*numH-1)/(numH-1)), zDist)); //center vertex
				tickGeom.vertices.push(new THREE.Vector3(w*(scalar*(i/6-1)+0.5), h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //bottom vertex

				lines.xaxis.tick[i] = new THREE.Line(tickGeom, new THREE.LineBasicMaterial({color: 0xffff00}));

				//dotted lines
				switch(i) {

					//make the book-ends larger and brighter
					case 0: //fall-through
					case 6:
						lines.xaxis.dots[i] = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 1.75*w*scalar/obj.size(dataSets[0]), color: 0xffff00}));
						break;

					default:
						lines.xaxis.dots[i] = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: w*scalar/obj.size(dataSets[0]), color: 0xaaaa00}));
						break;
				}

				//add vertices (as vectors) to the dotted line geometries
				for(var j=0; j<(4*numH-6); j++) {
				
					lines.xaxis.dots[i].geometry.vertices.push(new THREE.Vector3(w*(scalar*(i/6-1)+0.5), h*(scalar*(0.25*(j+1)/(numH-1)-1)+0.5), zDist));
				}

				//labels
				labels.xaxis.canvas[i] = document.createElement('canvas');

				labels.xaxis.canvas[i].width = canvasW*0.75;
				labels.xaxis.canvas[i].height = canvasH;

				labels.xaxis.context[i] = labels.xaxis.canvas[i].getContext('2d');

				//paint the canvas background
				labels.xaxis.context[i].fillStyle = 'rgb(200,200,200)';
				labels.xaxis.context[i].fillRect(0, 0, canvasW, canvasH);

				//set color, font and alignment for the label text
				labels.xaxis.context[i].fillStyle = 'rgb(0,0,0)';
				labels.xaxis.context[i].font = (canvasH-1)+'px Arial';
				labels.xaxis.context[i].textAlign = 'center';

				//set label value - MINOR ROUNDING ISSUE HERE, WORTH TRYING TO FIX?
				labels.xaxis.context[i].fillText('$'+(g.STOCK_PRICE*(1+obj.max(g.IMPLIED_VOL)*Math.sqrt(obj.min(g.EXPIRY)/365)*(i-3))).toFixed(2), xPos*0.75, yPos);

				//set canvas as texture and specify texture parameters
				labels.xaxis.texture[i] = new THREE.Texture(labels.xaxis.canvas[i]);
				labels.xaxis.texture[i].minFilter = THREE.LinearFilter; //WHAT DOES THIS ACTUALLY DO?
				labels.xaxis.texture[i].needsUpdate = true; //AND THIS?

				//create label mesh and map canvas texture to it
				labels.xaxis.mesh[i] = new THREE.Mesh(
							       	       new THREE.PlaneGeometry(w*(1-(1.01)*scalar)*0.75, h*(0.6)*scalar/(numH-1), 1, 1),
								           new THREE.MeshBasicMaterial({map: labels.xaxis.texture[i]})
							           );

				//set label position; at book-ends: bump in label and extend tick mark
				switch(i) {

					case 0:
						//bump label right
						labels.xaxis.mesh[i].position.set(w*(scalar*(i/6-1-1.01*0.375)+0.375+0.5), h*(scalar/(1-numH)*(numH+0.45)+0.5), zDist);

						//extend tick mark right
						var extGeom = new THREE.Geometry();

						extGeom.vertices.push(new THREE.Vector3(w*(-scalar+0.5), h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //left vertex
						extGeom.vertices.push(new THREE.Vector3(w*0.25*(-scalar*(1.01*0.75+4)+0.75+2), h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //center vertex
						extGeom.vertices.push(new THREE.Vector3(w*0.5*(-scalar*(1.01*0.75+2)+0.75+1), h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //right vertex

						lines.xaxis.ext[i] = new THREE.Line(extGeom, new THREE.LineBasicMaterial({color: 0xffff00}));
						camera.add(lines.xaxis.ext[i]);
						break;

					case 6:
						//bump label left
						labels.xaxis.mesh[i].position.set(w*(scalar*(i/6-1+1.01*0.375)-0.375+0.5), h*(scalar/(1-numH)*(numH+0.45)+0.5), zDist);

						//extend tick mark left
						var extGeom = new THREE.Geometry();

						extGeom.vertices.push(new THREE.Vector3(w*0.5*(0.75*(scalar*1.01-1)+1), h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //left vertex
						extGeom.vertices.push(new THREE.Vector3(w*0.25*(0.75*(scalar*1.01-1)+2), h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //center vertex
						extGeom.vertices.push(new THREE.Vector3(w*0.5, h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //right vertex

						lines.xaxis.ext[i] = new THREE.Line(extGeom, new THREE.LineBasicMaterial({color: 0xffff00}));
						camera.add(lines.xaxis.ext[i]);
						break;

					default:
						labels.xaxis.mesh[i].position.set(w*(scalar*(i/6-1)+0.5), h*(scalar/(1-numH)*(numH+0.45)+0.5), zDist);
						break;
				}

				//add tick marks, dotted lines and labels to the scene
				camera.add(lines.xaxis.tick[i], lines.xaxis.dots[i], labels.xaxis.mesh[i]);
			}

			//DATA
			for(t in dataSets) {

				//loop variable
				var k=0;

				//add vertices (as vectors) to the point cloud geometries
				for(val in dataSets[t]) {

					cloud[t].geometry.vertices.push(new THREE.Vector3(

						w*(scalar*(k/(obj.size(dataSets[0])-1)-1)+0.5), //x-coordinate

						h/2*(scalar*(dataSets[t][val]/gRange-numH/(numH-1))+1), //y-coordinate

						zDist+0.00001 //z-coordinate - place points just in front of the grid and the background
					));

					k++;
				}

				//add the point cloud to the scene
				camera.add(cloud[t]);
			}
			//console.log();
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
