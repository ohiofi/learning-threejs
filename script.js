/*global THREE*/
let camera, scene, renderer, controls;
let GRAVITY = 50;
let jumpPower = 100;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

class Platform {
  constructor() {
    this.geometry = new THREE.BoxGeometry(20, 20, 20).toNonIndexed();
    this.position = this.geometry.attributes.position;
    this.colorsBox = [];
    this.color = new THREE.Color();

    for (let i = 0, l = this.position.count; i < l; i++) {
      this.color.setHSL(
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.25 + 0.75
      );
      this.colorsBox.push(color.r, color.g, color.b);
      //this.colorsBox.push(Math.floor(Math.random()*200),0,Math.floor(Math.random()))
    }

    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.colorsBox, 3)
    );
    this.material = new THREE.MeshPhongMaterial({
      specular: 0x0000ff,
      flatShading: true,
      vertexColors: true
    });
    this.material.color.setHSL(
      Math.random() * 0.2 + 0.5,
      0.75,
      Math.random() * 0.25 + 0.75
    );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.x = Math.floor(Math.random() * 20 - 10) * 20;
    this.mesh.position.y = Math.floor(Math.random() * 20) * 2 + 10;
    this.mesh.position.z = Math.floor(Math.random() * 20 - 10) * 20;
  }
}

function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 10;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 0, 250);

  var playerGeometry = new THREE.BoxBufferGeometry(10, 40, 10);
  playerGeometry = playerGeometry.toNonIndexed(); // ensure each face has unique vertices

  var playerMaterial = new THREE.MeshPhongMaterial({
    specular: 0xffffff,
    flatShading: true,
    vertexColors: THREE.VertexColors
  });

  window.player = new THREE.Mesh(playerGeometry, playerMaterial);

  window.player.add(camera);
  camera.position.set(0, 20, 20);

  controls = new THREE.PointerLockControls(camera, document.body);
  scene.add(controls.getObject());
  //window.player.add(controls.getObject());
  scene.add(window.player);
  objects.push(window.player);

  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");

  instructions.addEventListener("click", function() {
    controls.lock();
  });

  controls.addEventListener("lock", function() {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });

  controls.addEventListener("unlock", function() {
    blocker.style.display = "block";
    instructions.style.display = "";
  });

  scene.add(controls.getObject());

  const onKeyDown = function(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;

      case "Space":
        if (canJump === true && velocity.y == 0) {
          velocity.y = jumpPower;
        }
        canJump = false;
        break;
    }
  };

  const onKeyUp = function(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );

  // floor

  let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
  floorGeometry.rotateX(-Math.PI / 2);

  // vertex displacement

  let position = floorGeometry.attributes.position;

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i);

    vertex.x += Math.random() * 20 - 10;
    vertex.y += Math.random() * 2;
    vertex.z += Math.random() * 20 - 10;

    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

  position = floorGeometry.attributes.position;
  const colorsFloor = [];

  for (let i = 0, l = position.count; i < l; i++) {
    color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    colorsFloor.push(color.r, color.g, color.b);
  }

  floorGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colorsFloor, 3)
  );

  const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  scene.add(floor);

  // objects
  for (let i = 0; i < 200; i++) {
    let box = new Platform();
    scene.add(box.mesh);
    objects.push(box.mesh);
  }

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();

  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= (GRAVITY * 10.0 * delta) / 10; // 100.0 = mass

    if (false && window.player.position) {
      /* Extract the forward facing vector from your camera. This gives us a vector
   by which when can move forward relative to the camera's current pointing 
   direction */
      var forward = new THREE.Vector3();
      camera.getWorldDirection(forward);

      /* Extract a vector that is pointing to the right of the camera's current 
   direction. This gives us a vector that we can move left/right (strafe) on,
   relative to the camera's current direction */
      var right = new THREE.Vector3().crossVectors(camera.up, forward);

      // Normalize the vectors to unit length for ensure predictable camera movement
      forward.normalize();
      right.normalize();

      if (moveForward) {
        /* Add "velocity" vector to the player's current position, based on
     camera forward direction */
        window.player.position.addScaledVector(forward, 1.0 * delta);
      }

      if (moveBackward) {
        /* Add "velocity" vector to the player's current position, based on 
     camera backward direction (ie -1.0) */
        window.player.position.addScaledVector(forward, -1.0 * delta);
      }

      if (moveRight) {
        /* Add "strafe" vector to the player's current position, based on
     camera right direction */
        window.player.position.addScaledVector(right, 1.0 * delta);
      }

      if (moveLeft) {
        /* Add "strafe" vector to the player's current position, based on
     camera left direction (ie -1.0) */
        window.player.position.addScaledVector(right, -1.0 * delta);
      }

      //if (keys[32]) velocity.y = 200;
    }

    // -- ADD TO ACHIEVE THIRD PERSON CAMERA --

    // These vectors store temporary data for out 3rd person camera behaviour
    const playerPosition = new THREE.Vector3();
    const cameraPosition = new THREE.Vector3();

    // Get the players position, and cameras position
    window.player.getWorldPosition(playerPosition);
    camera.getWorldPosition(cameraPosition);

    // Calculate a vector that will offset the camera, based on the player's
    // current position. This is based on the current direction vector from
    // the camera to the player
    const cameraOffset = new THREE.Vector3().subVectors(
      playerPosition,
      cameraPosition
    );

    // Set the distance between player and third person view. Change 5.0 to something smaller to bring
    // camera closer to player
    cameraOffset.setLength(15.0);

    // Calculate the camera's new positions
    const newCameraPosition = new THREE.Vector3().addVectors(
      playerPosition,
      cameraOffset
    );

    // Update the camera's lookat object (player) and position (to achieve
    // third person effect)

    //camera.lookAt(playerPosition);
    //camera.position.copy(newCameraPosition);

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
    }
  }

  prevTime = time;

  renderer.render(scene, camera);
}

init();
animate();
