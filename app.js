function initialize() {
	// initialize Argon
	app = Argon.init();
	app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);

	// initialize THREE
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera();
	userLocation = new THREE.Object3D;
	scene.add(camera);
	scene.add(userLocation);
	renderer = new THREE.WebGLRenderer({
	    alpha: true,
	    logarithmicDepthBuffer: true
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	app.view.element.appendChild(renderer.domElement);

	// get lcoation of user
	locate();
}

function locate() {
	var output = document.getElementById('location');

	if (!navigator.geolocation) {
		console.log("No such navigator");
		output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
		return;
	}

	function success(position) {
		console.log("Success");
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;

		output.innerHTML = "<p>Latitude: " + latitude + "° <br>Longitude: " + longitude + "°</p>";
	}

	function error() {
		console.log("Error");
		output.innerHTML = "Unable to retrieve your location";
	}

	output.innerHTML = "<p>Locating...</p>";

	navigator.geolocation.getCurrentPosition(success, error);
}
