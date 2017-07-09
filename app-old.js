// APIs
var Cesium = Argon.Cesium;
var Cartesian3 = Argon.Cesium.Cartesian3;
var ReferenceFrame = Argon.Cesium.ReferenceFrame;
var JulianDate = Argon.Cesium.JulianDate;
var CesiumMath = Argon.Cesium.CesiumMath;

// set up Argon
var app = Argon.init();
// app.context.defaultReferenceFrame = app.context.localOriginEastUpSouth;

// set up THREE
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var userLocation = new THREE.Object3D;
scene.add(camera);
scene.add(userLocation);
const renderer = new THREE.WebGLRenderer({
    alpha: true
    // logarithmicDepthBuffer: true
});
renderer.setPixelRatio(window.devicePixelRatio);
app.view.element.appendChild(renderer.domElement);

// get location of user
// locate();

// create model of box
var boxGeoObject = new THREE.Object3D();
var box = new THREE.Object3D();
var loader = new THREE.TextureLoader();
loader.load('images/box.png', function (texture) {
    var geometry = new THREE.BoxGeometry(5, 5, 5);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    var mesh = new THREE.Mesh(geometry, material);
    box.add(mesh);
});

boxGeoObject.add(box);
var boxGeoEntity = new Argon.Cesium.Entity({
    name: "I have a box",
    // position: Cartesian3.fromDegrees(-84.39468204975128, 33.77758226630099),
    position: Cartesian3.fromDegrees(-84.276284, 33.839615),
    position: Cartesian3.ZERO,
    orientation: Cesium.Quaternion.IDENTITY
});

// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent
var boxInit = false;
app.updateEvent.addEventListener(function (frame) {

    // the first time through, we create a geospatial position for
    // the box somewhere near us
    if (!boxInit) {
      // get the position and orientation (the "pose") of the user
      // in the local coordinate frame.
      var userPose = app.context.getEntityPose(app.context.user);
      // assuming we know the user's pose, set the position of our
      // THREE user object to match it
      if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
          userLocation.position.copy(userPose.position);
      }
      else {
          // if we don't know the user pose we can't do anything
          return;
      }

      var defaultFrame = app.context.defaultReferenceFrame;
      // set the box's position to 10 meters away from the user.
      // First, clone the userPose postion, and add 10 to the X

      // console.log("user: " + userPose.position);
      var boxPos = userPose.position.clone();
      boxPos.x += 10;
      // set the value of the box Entity to this local position, by
      // specifying the frame of reference to our local frame

      // var boxPos = boxGeoEntity.position.setValue(
      //   Cartesian3.fromDegrees(-84.276284, 33.839615), defaultFrame
      // );

      boxGeoEntity.position.setValue(boxPos, defaultFrame);

      // orient the box according to the local world frame
      boxGeoEntity.orientation.setValue(Cesium.Quaternion.IDENTITY);
      // now, we want to move the box's coordinates to the FIXED frame, so
      // the box doesn't move if the local coordinate system origin changes.
      if (Argon.convertEntityReferenceFrame(boxGeoEntity, frame.time, ReferenceFrame.FIXED)) {
          scene.add(boxGeoObject);
          boxInit = true;
      }
    }

    // get the local coordinates of the local box, and set the THREE object
    var boxPose = app.context.getEntityPose(boxGeoEntity);
    boxGeoObject.position.copy(boxPose.position);
    boxGeoObject.quaternion.copy(boxPose.orientation);

    // rotate the boxes at a constant speed, independent of frame rates
    // to make it a little less boring
    box.rotateY(3 * frame.deltaTime / 10000);
});

// renderEvent is fired whenever argon wants the app to update its display
app.renderEvent.addEventListener(() => {
  // set the renderer to know the current size of the viewport.
  // This is the full size of the viewport, which would include
  // both views if we are in stereo viewing mode
  const viewport = app.view.viewport;
  renderer.setSize(viewport.width, viewport.height);

  // there is 1 subview in monocular mode, 2 in stereo mode
  for (let subview of app.view.subviews) {
    // set the position and orientation of the camera for
    // this subview
    camera.position.copy(subview.pose.position);
    camera.quaternion.copy(subview.pose.orientation);

    // the underlying system provide a full projection matrix
    // for the camera.
    camera.projectionMatrix.fromArray(subview.projectionMatrix);

    // set the viewport for this view
    let {x,y,width,height} = subview.viewport;

    // set the webGL rendering parameters and render this view
    renderer.setViewport(x,y,width,height);
    renderer.setScissor(x,y,width,height);
    renderer.setScissorTest(true);
    renderer.render(scene, camera);
  }
});

function locate(){
  var output = document.getElementById('location-output');

  if (!navigator.geolocation) {
    console.log("No such navigator");
    output.innerHTML = "Geolocation is not supported by your browser";
    return;
  }

  function success(position) {
    console.log("Success");
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    output.innerHTML = "Latitude: " + latitude + "&deg; <br>Longitude: " + longitude + "&deg;";
  }

  function error() {
    console.log("Error");
    output.innerHTML = "Unable to retrieve your location";
  }

  output.innerHTML = "Locating...";

  navigator.geolocation.getCurrentPosition(success, error);
}
