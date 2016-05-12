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

		//2D view
		var plane1 = new THREE.Mesh(new THREE.PlaneGeometry(1, height/width, 1, 1), new THREE.MeshBasicMaterial({color: 0xffffff})),
			plane2 = new THREE.Mesh(new THREE.PlaneGeometry(.7*1, .7*height/width, 1, 1), new THREE.MeshBasicMaterial({color: 0x333333})),
			particles = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 0.0014, color: 0xff1234})),
		    zDist = -1/(2*(aspect)*Math.tan(vFOV/2));

		plane1.position.set(0, 0, zDist);
		plane2.position.set(.02125, .008125, zDist),
		particles.position.set(.02125, .008125, zDist);

		for(k=1; k<=500; k++) {

			particles.geometry.vertices.push(new THREE.Vector3( (.7/500)*(k)-(.35), 0, 0));
		}

		camera.add(plane1, plane2, particles);


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
