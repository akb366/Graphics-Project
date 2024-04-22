// Import Three.js library
import * as THREE from 'three';

// Initialize variables
let scene, camera, renderer, ship, asteroids = [], lasers = [];

// Initialize movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// Interval for adding asteroids
let interval = 2000;
let spawnCount = 0;
let speed = 0.05;

let hits = 0;

// Initialize ship's position
let shipPosition = new THREE.Vector3(0, 0, 0);

// Set up the scene
function init() {
    // Create a scene
    scene = new THREE.Scene();

    // Create a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);

    // Create a renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create a space ship
    const shipGeometry = new THREE.BoxGeometry(1, 1, 1);
    const shipMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    ship = new THREE.Mesh(shipGeometry, shipMaterial);
    scene.add(ship);

    // Add event listeners for key presses
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Add event listener for shooting
    document.addEventListener('keydown', onSpaceKeyDown);

    // Start adding asteroids at regular intervals
    setInterval(addRandomAsteroid, interval); // Add an asteroid every 3 seconds

    // Start the game loop
    animate();
}

// Event listener functions for key presses
function onKeyDown(event) {
    switch (event.key) {
        case 'w':
            moveForward = true;
            break;
        case 's':
            moveBackward = true;
            break;
        case 'a':
            moveLeft = true;
            break;
        case 'd':
            moveRight = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.key) {
        case 'w':
            moveForward = false;
            break;
        case 's':
            moveBackward = false;
            break;
        case 'a':
            moveLeft = false;
            break;
        case 'd':
            moveRight = false;
            break;
    }
}

// Update ship's position based on key presses
function updateShipPosition() {
    if (moveForward) {
        shipPosition.y += 0.1;
    }
    if (moveBackward) {
        shipPosition.y -= 0.1;
    }
    if (moveLeft) {
        shipPosition.x -= 0.1;
    }
    if (moveRight) {
        shipPosition.x += 0.1;
    }
    ship.position.copy(shipPosition);
}

// Add a random asteroid to the scene
function addRandomAsteroid() {
    const asteroidGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

    // Randomly choose left or right side
    const side = Math.random() < 0.5 ? -1 : 1;
    // Calculate random x position on the left or right side
    //const xPos = side * (window.innerWidth / 2) - 5;
    //console.log(xPos);
    const xPos = side * Math.random() * 10;
    // Set y position to be at the same level as the ship
    const yPos = 8;
    // Set z position to be at the same level as the ship
    const zPos = ship.position.z;

    asteroid.position.set(xPos, yPos, zPos);
    scene.add(asteroid);
    asteroids.push(asteroid);

    spawnCount += 1;
    if(spawnCount % 5 == 0) {
        if (interval > 500) {
            interval -= 100;
        }
        if (speed < .5) {
            speed += 0.01;
        }
    }
}

// Update ship's position based on key presses
function updateAsteroids() {
    for (var i=0; i<asteroids.length; ++i) {
        asteroids[i].position.y -= speed;
    }
}

// Check collision between ship and asteroid
function checkShipCollision() {
    const shipBox = new THREE.Box3().setFromObject(ship);
    for (let i = 0; i < asteroids.length; i++) {
        const asteroid = asteroids[i];
        const asteroidBox = new THREE.Box3().setFromObject(asteroid);
        if (shipBox.intersectsBox(asteroidBox)) {
            // Remove the asteroid from the scene and from the asteroids array
            scene.remove(asteroid);
            asteroids.splice(i, 1);
            return true;
        }
    }
    return false;
}

// Check collision between ship and asteroid
function checkLaserCollision() {
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        const laserBox = new THREE.Box3().setFromObject(laser);

        for (let j = 0; j < asteroids.length; j++) {
            const asteroid = asteroids[j];
            const asteroidBox = new THREE.Box3().setFromObject(asteroid);

            if (laserBox.intersectsBox(asteroidBox)) {
                // Remove laser and asteroid from the scene and from their respective arrays
                scene.remove(laser);
                lasers.splice(i, 1);
                scene.remove(asteroid);
                asteroids.splice(j, 1);
                // Decrement both counters to account for removal of elements
                i--;
                j--;
                return true; // Exit the inner loop since laser can only hit one asteroid
            }
        }
    }
    return false;
}

// Handle shooting laser
function onSpaceKeyDown(event) {
    if (event.key === ' ') {
        shootLaser();
    }
}

// Shoot laser function
function shootLaser() {
    const laserGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);
    laser.position.copy(ship.position); // Start laser from ship's position
    scene.add(laser);
    lasers.push(laser);
}

function updateLasers() {
    for(let i = 0; i < lasers.length; i++) {
        lasers[i].position.y += 0.1
    }
}

// Render loop
function animate() {
    requestAnimationFrame(animate);

    // Update ship's position
    updateShipPosition();

    updateAsteroids();

    updateLasers();

    // Check collision
    if (checkShipCollision()) {
        hits++;
        console.log(hits);
        // Here you can add actions to take when a collision occurs
    }

    if (checkLaserCollision()) {
        // Something
    }

    // Render the scene
    renderer.render(scene, camera);
}

// Start the application
init();
