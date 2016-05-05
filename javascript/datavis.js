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
			camera   = new THREE.PerspectiveCamera(45, width/height, 0.1, 100),
			phi      = 0,
			theta    = Math.PI/2,
			radius   = 6,
			light    = new THREE.AmbientLight(0xffffff),
			mouse    = {x: 0, y: 0};

		//set params and attach the renderer to the container when available
		if(elem.select("output-view-container") != null) {

			renderer.setSize(width, height);
			renderer.setClearColor(0x000000);
			elem.select("output-view-container").appendChild(renderer.domElement);
		}

		scene.add(light);

		camera.position.set(radius*Math.sin(phi)*Math.cos(theta), radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi));
		scene.add(camera);

		//test
		var cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color: 0xff0000}));
		cube.position.set(0,0,0);
		scene.add(cube);

		render = function() {

			renderer.render(scene, camera);
			requestAnimationFrame(render);
			//console.log();
		}

		render();

		//console.log();
	}
})
