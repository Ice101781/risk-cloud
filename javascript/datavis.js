visuals = function(properties) {

	var self = function() { return };

	for(prop in properties) { self[prop] = properties[prop] }

	return self;
}({

	init: function() {

		var width    = elem.select("output-view-container").offsetWidth,
            height   = elem.select("output-view-container").offsetHeight,
			scene    = new THREE.Scene(),
			renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false }),
			vFOV     = 45,
			aspect   = width/height,
			near     = 0.1,
			far      = 100,
			camera   = new THREE.PerspectiveCamera(vFOV, aspect, near, far),
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
		var plane1 = new THREE.Mesh(new THREE.PlaneGeometry(1, height/width, 1, 1), new THREE.MeshBasicMaterial({color: 0x0000ff})),
			plane2 = new THREE.Mesh(new THREE.PlaneGeometry(.7, .7*height/width, 1, 1), new THREE.MeshBasicMaterial({color: 0x333333})),
		    zDist = -1/(2*(aspect)*Math.tan(vFOV/2));

		plane1.position.set(0, 0, zDist);
		plane2.position.set(0.02125, .008125, zDist);
		camera.add(plane1, plane2);


		//axis objects
		var gridline = new THREE.Mesh(new THREE.PlaneGeometry(.7020375, height/(750*width), 1, 1), new THREE.MeshBasicMaterial({color: 0xaaaaaa}));
 
		gridline.position.set(0.02, .135, zDist);
		camera.add(gridline);


		var label = new THREE.Mesh(new THREE.PlaneGeometry(1/25, height/(45*width), 1, 1), new THREE.MeshBasicMaterial({color: 0x00ff00}));

		label.position.set(-.35125, .13125, zDist);
		camera.add(label);


		var w = .7,

			data = g.PROFITLOSS_DATA,

			dataSets = { 0: data[0], T: data[obj.min(g.EXPIRY)] },

			cloud = { 0: new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: (w/obj.size(dataSets[0])), color: 0x0000ff})),
					  T: new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: (w/obj.size(dataSets[0])), color: 0xff0000})) },

			globalRange = Math.abs(obj.max([obj.max(data[0]), obj.max(data[obj.min(g.EXPIRY)])])-obj.min([obj.min(data[0]), obj.min(data[obj.min(g.EXPIRY)])])),

			k=1;


		//add vectors to the point cloud geometries
		for(t in dataSets) {

			for(val in dataSets[t]) {

				cloud[t].geometry.vertices.push(new THREE.Vector3(

					(w)*((k-(obj.size(dataSets[0])/2))/obj.size(dataSets[0])), //x-coordinate

					(+(w/aspect).toFixed(2))*(dataSets[t][val]/(2*globalRange)), //y-coordinate

					0 //z-coordinate
				));

				k++;
			}

			//reset the loop variable
			k=1;

			cloud[t].position.copy(plane2.position);
			camera.add(cloud[t]);
		}
	// END 2D VIEW //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




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
