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

	// createCoordinateMap();
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








// under this commend are functions for obtaining a user's coordinates via section and row


function getSectionAndRow() {
	sectionElement = document.getElementById('sectionInput');
	rowElement = document.getElementById('rowInput');

	form = document.getElementById('form');

	section = sectionElement.value;
	row = rowElement.value;

	form.style.display = 'none';

	var coordinates = getCoordinates(section, row);
	console.log(coordinates);
}

//gets coordinates from dictionary with section and row as keys
function getCoordinates(section, row) {
	var secrow = section + "," + row;
	var coord = dictionary[secrow];
	if (coord == "") {
		console.log("Error getting coordinates");
	} else {
		return coord;
	}
}

function createCoordinateMap() {
	dictionary = {};
	dictionary["20,10"] = "0,0,0";
	dictionary["30,20"] = "1,1,1";

}