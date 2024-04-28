// Import Three.js library
import * as THREE from 'three';

// Initialize variables
let scene, camera, renderer, ship, asteroids = [], lasers = [], golds = [];

// Initialize movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let shipSpeed = 0.1;
let laserCount = 1;

// Initialize variables for laser cooldown
let canShoot = true;
let laserCooldownDuration = 1000; // Cooldown duration in milliseconds
let lastShotTime = 0;

// Interval for adding asteroids
let interval = 2000;
let spawnCount = 0;
let speed = 0.05;

let hits = 0;
let goldCount = 0;

let score = 0;
let scoreInterval;

let isPaused = false;

let spawnInterval;

// Initialize ship's position
let shipPosition = new THREE.Vector3(0, 0, 0);

// Set up the scene
function init() {
    // Create a scene
    scene = new THREE.Scene();

    // Create a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    //camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );

    camera.position.set(0, 0, 10);
    scene.add(camera);

    // Create a renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create a space ship
    const shipGeometry = new THREE.BoxGeometry(1, 1);
    const shipMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    ship = new THREE.Mesh(shipGeometry, shipMaterial);
    ship.position.z = 4;
    scene.add(ship);

    // Add event listeners for key presses
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Add event listener for shooting
    document.addEventListener('keydown', onSpaceKeyDown);

    document.getElementById('speed-up').addEventListener("click", speedUp);
    document.getElementById('laser-cooldown').addEventListener("click", laserCooldownDown);
    document.getElementById('laser').addEventListener("click", laserUp);

    // Start adding asteroids at regular intervals
    spawnInterval = setInterval(addRandomAsteroid, interval); // Add an asteroid every 3 seconds
    scoreInterval = setInterval(updateScore, 1000)

    // Start the game loop
    animate();
}

// Function to pause the game
function pauseGame() {
    if (!isPaused) {
        isPaused = true;

        document.getElementById('shop-menu').style.display = 'block'

        return;
    } else {
        isPaused = false;

        document.getElementById('shop-menu').style.display = 'none'

        animate();
    }
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
        case 'f':
            pauseGame();
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
    if (isPaused) {return}
    if (moveForward) {
        shipPosition.y += shipSpeed;
    }
    if (moveBackward) {
        shipPosition.y -= shipSpeed;
    }
    if (moveLeft) {
        shipPosition.x -= shipSpeed;
    }
    if (moveRight) {
        shipPosition.x += shipSpeed;
    }
    ship.position.copy(shipPosition);
}

// Add a random asteroid to the scene
function addRandomAsteroid() {
    if (isPaused) {return}

    if (spawnCount % 5 == 0) {
        const asteroidGeometry = new THREE.SphereGeometry(1.0);
        const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        const asteroid1 = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        const asteroid2 = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        // Randomly choose left or right side
        const side = Math.random() < 0.5 ? -1 : 1;

        const xPos = side * Math.random() * window.innerWidth;

        const yPos = window.innerHeight;

        const zPos = ship.position.z;

        asteroid1.position.set(xPos, yPos, zPos);
        asteroid2.position.set(xPos + (Math.random() * 5) + 3, yPos, zPos);
        scene.add(asteroid1);
        scene.add(asteroid2)

        asteroids.push(asteroid1);
        asteroids.push(asteroid2);
    } else {
        const asteroidGeometry = new THREE.SphereGeometry(1);
        const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

        // Randomly choose left or right side
        const side = Math.random() < 0.5 ? -1 : 1;

        const xPos = side * Math.random() * 10;

        const yPos = 8;

        const zPos = ship.position.z;

        asteroid.position.set(xPos, yPos, zPos);
        scene.add(asteroid);
        asteroids.push(asteroid);
    }

    spawnCount += 1;
        
    if(spawnCount % 5 == 0) {
        if (interval > 100) {
            interval -= 100;
        }
        if (speed < .5) {
            speed += 0.01;
        }
    }

    clearInterval(spawnInterval)
    spawnInterval = setInterval(addRandomAsteroid, interval);
}

// Update ship's position based on key presses
function updateAsteroids() {
    if (isPaused) {return}
    for (var i=0; i<asteroids.length; ++i) {
        if (asteroids[i].position.y < -10) {
            scene.remove(asteroids[i]);
            asteroids.splice(i, 1);
        } else {
            asteroids[i].position.y -= speed;
        }
    }
}

function updateGoldCount() {
    document.getElementById('gold').textContent = 'Gold: ' + goldCount;
}

function updateScore() {

    if (isPaused) {return}

    score++
    document.getElementById('score').textContent = 'Score: ' + score;
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

                const goldGeometry = new THREE.SphereGeometry(0.25);
                const goldMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
                const gold = new THREE.Mesh(goldGeometry, goldMaterial);
                gold.position.copy(asteroid.position);

                // Remove laser and asteroid from the scene and from their respective arrays
                scene.remove(laser);
                lasers.splice(i, 1);
                scene.remove(asteroid);
                asteroids.splice(j, 1);
                // Decrement both counters to account for removal of elements
                i--;
                j--;

                scene.add(gold);
                golds.push(gold);

                return true; // Exit the inner loop since laser can only hit one asteroid
            }
        }
    }
    return false;
}

// Handle shooting laser
function onSpaceKeyDown(event) {
    if (event.key === ' ' && canShoot) {
        shootLaser();
    }
}

// Shoot laser function
function shootLaser() {

    const currentTime = Date.now();
    if (currentTime - lastShotTime < laserCooldownDuration || isPaused) {
        return; // Exit the function if still on cooldown or if the game is paused
    }

    const laserGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    if (laserCount == 1) {
        const laser = new THREE.Mesh(laserGeometry, laserMaterial);
        laser.position.copy(ship.position); // Start laser from ship's position
        scene.add(laser);
        lasers.push(laser);
    } else if (laserCount == 2) {
        const laser1 = new THREE.Mesh(laserGeometry, laserMaterial);
        laser1.position.copy(ship.position); // Start laser from ship's position
        laser1.position.x -= 0.5
        scene.add(laser1);
        lasers.push(laser1);

        const laser2 = new THREE.Mesh(laserGeometry, laserMaterial);
        laser2.position.copy(ship.position); // Start laser from ship's position
        laser2.position.x += 0.5
        scene.add(laser2);
        lasers.push(laser2);
    } else if (laserCount == 3) {
        const laser1 = new THREE.Mesh(laserGeometry, laserMaterial);
        laser1.position.copy(ship.position); // Start laser from ship's position
        laser1.position.x -= 0.5
        scene.add(laser1);
        lasers.push(laser1);

        const laser2 = new THREE.Mesh(laserGeometry, laserMaterial);
        laser2.position.copy(ship.position); // Start laser from ship's position
        scene.add(laser2);
        lasers.push(laser2);

        const laser3 = new THREE.Mesh(laserGeometry, laserMaterial);
        laser3.position.copy(ship.position); // Start laser from ship's position
        laser3.position.x += 0.5
        scene.add(laser3);
        lasers.push(laser3);
    }
 
    lastShotTime = currentTime;
}

function updateLasers() {
    for(let i = 0; i < lasers.length; i++) {
        lasers[i].position.y += 0.1
    }
}


// Check collision between ship and asteroid
function checkGoldCollision() {
    const shipBox = new THREE.Box3().setFromObject(ship);
    for (let i = 0; i < golds.length; i++) {
        const gold = golds[i];
        const goldBox = new THREE.Box3().setFromObject(gold);

        if (goldBox.intersectsBox(shipBox)) {

            // Remove gold and from the scene
            scene.remove(gold);
            golds.splice(i, 1);
            // Decrement both counters to account for removal of elements
            i--;

            goldCount++;
            updateGoldCount();

            return true; // Exit the inner loop since laser can only hit one asteroid
        }
    }
    return false;
}




// Render loop
function animate() {

    if (!isPaused) {
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

        checkGoldCollision();

        // Render the scene
        renderer.render(scene, camera);
    }
}

// Start the application
init();



// Shop Functions

function speedUp() {

    if (goldCount >= 5) {
        shipSpeed += 0.01;
        goldCount -= 5
        updateGoldCount();
        pauseGame();
    } else {
        alert("Not enough")
    }
}

function laserCooldownDown() {
    if (laserCooldownDuration > 0) {
        laserCooldownDuration -= 100
    } else {
        document.getElementById('laser-cooldown').style.display = 'none'
    }
}

function laserUp() {
    if (laserCount < 3) {
        laserCount += 1
    } else {
        document.getElementById('laser').style.display = 'none'
    }
}
