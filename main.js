import * as THREE from 'three';

// Initialize variables
let scene, camera, renderer, ship, asteroids = [], lasers = [], energys = [];

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
let energyCount = 0;

let score = 0;
let scoreInterval;

let isPaused = false;

let spawnInterval;

// Initialize ship's position
let shipPosition = new THREE.Vector3(0, 0, 0);
function createSpaceship() {
    const shipGroup = new THREE.Group();

    // Create a geometry for the wedge shape
    const wedgeGeometry = new THREE.BufferGeometry();
    // Define vertices for the wedge
    const vertices = [
        0, 0, 0,     // Vertex 0: Bottom center
        0.5, 0, 0,  // Vertex 1: Bottom right
        0, 0, 0.25,  // Vertex 2: Top center
        0.5, 0, 0.25, // Vertex 3: Top right
        // Apex vertex
        0.25, 0.5, 0.125  // Vertex 4: Apex
    ];

    const indices = [
        0, 1, 2,   // Triangle 1: Bottom center -> Bottom right -> Top center
        1, 3, 2,   // Triangle 2: Bottom right -> Top right -> Top center
        0, 2, 4,   // Triangle 3: Bottom center -> Top center -> Apex
        1, 4, 3,   // Triangle 4: Bottom right -> Apex -> Top right
        3, 4, 2,   // Triangle 5: Top right -> Apex -> Top center
        0, 4, 1    // Triangle 6: Bottom center -> Apex -> Bottom right
    ];




    // Set attributes for the buffer geometry
    wedgeGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    wedgeGeometry.setIndex(indices);
    wedgeGeometry.computeVertexNormals();
    const textureLoader = new THREE.TextureLoader();
    const shiptexture = textureLoader.load('textures/ship.jpg',function(texture) {
        texture.magFilter = THREE.LinearFilter; // Magnification filter
        texture.minFilter = THREE.LinearMipmapLinearFilter; // Minification filter
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Anisotropic filtering for better quality
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;});
    // Create a mesh with the geometry
    const wedgeMaterial = new THREE.MeshStandardMaterial({ map: shiptexture,metalness: .8, roughness: 0 });
    const wedgeMesh = new THREE.Mesh(wedgeGeometry, wedgeMaterial);
    wedgeMesh.position.set(-.25, 1, -.125);
    shipGroup.add(wedgeMesh);

    // Create body (rectangle geometry)
    const bodyGeometry = new THREE.BoxGeometry(0.5, 2, 0.25);
    const bodyMaterial = new THREE.MeshStandardMaterial({map : shiptexture,metalness: .8, roughness: 0 });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.position.set(0, 0, 0); // Adjust position to align with the body
    shipGroup.add(bodyMesh);
    const engineblockGeometry = new THREE.BoxGeometry(1, .5, 0.25);
    const engineblockMaterial = new THREE.MeshStandardMaterial({map : shiptexture,metalness: .8, roughness: 0 });
    const engineblockMesh = new THREE.Mesh(engineblockGeometry, engineblockMaterial);
    engineblockMesh.position.set(0, -1, 0); // Adjust position to align with the body
    shipGroup.add(engineblockMesh);
     // Create engines on either side
     const engineGeometry = new THREE.CylinderGeometry(0.1, 0.3, .5, 16);
     
     const enginetexture = textureLoader.load('textures/metal.jpg',function(texture) {
        texture.magFilter = THREE.LinearFilter; // Magnification filter
        texture.minFilter = THREE.LinearMipmapLinearFilter; // Minification filter
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Anisotropic filtering for better quality
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;});
     const engineMaterial = new THREE.MeshStandardMaterial({ map : enginetexture, metalness: .8, roughness: 0});
     
     const engine1 = new THREE.Mesh(engineGeometry, engineMaterial);
     engine1.position.set(-.3, -1.5, 0); // Adjust position as needed
     shipGroup.add(engine1);
 
     const engine2 = new THREE.Mesh(engineGeometry, engineMaterial);
     engine2.position.set(0.3, -1.5, 0); // Adjust position as needed
     shipGroup.add(engine2);
     // Create the ship mesh based on laser count
    
    if (laserCount === 1) {
        
    } else if (laserCount >= 2) {
        const lasergunGeometry = new THREE.BoxGeometry(1.2, .2, 0.25);
        const lasergunMaterial = new THREE.MeshStandardMaterial({map : shiptexture,metalness: .8, roughness: 0 });
        const lasergunMesh = new THREE.Mesh(lasergunGeometry, lasergunMaterial);
        const cannonGeometry = new THREE.CylinderGeometry(.03, .1, 0.3);
        const cannontexture = textureLoader.load('textures/neon.jpg',function(texture) {
           texture.magFilter = THREE.LinearFilter; // Magnification filter
           texture.minFilter = THREE.LinearMipmapLinearFilter; // Minification filter
           texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Anisotropic filtering for better quality
           texture.wrapS = texture.wrapT = THREE.RepeatWrapping;});
        const cannonMaterial = new THREE.MeshStandardMaterial({map: cannontexture,metalness: .8, roughness: 0 });
        const cannon1Mesh = new THREE.Mesh(cannonGeometry, cannonMaterial);
        const cannon2Mesh = new THREE.Mesh(cannonGeometry, cannonMaterial);
        lasergunMesh.position.set(0, -.5, 0); // Adjust position to align with the laserguns
        cannon1Mesh.position.set(-.5, -.3, 0); // Adjust position to align with the lasergun
        cannon2Mesh.position.set(.5, -.3, 0); // Adjust position to align with the lasergun
        shipGroup.add(lasergunMesh);
        shipGroup.add(cannon1Mesh);
        shipGroup.add(cannon2Mesh);
    }

    return shipGroup;
}
// Set up the scene
function init() {
    // Create a scene
    scene = new THREE.Scene();
    // Set the position of the plane to be in front of the camera

    // Create a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);
    scene.add(camera);

    // Create a renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('textures/background.jpg');

    const backgroundplaneGeometry = new THREE.BoxGeometry(30, 30);
    const backgroundplaneMaterial = new THREE.MeshStandardMaterial({map : backgroundTexture });
    const backgroundplaneMesh = new THREE.Mesh(backgroundplaneGeometry, backgroundplaneMaterial);
    backgroundplaneMesh.position.z = -3; // Adjust the distance as needed to ensure it's in front of everything
    
    // Add the plane to the scene
    scene.add(backgroundplaneMesh);
    // Create a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 10); // Set light direction
    scene.add(directionalLight);

    // Ambient light to illuminate all objects in the scene equally
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    ship = createSpaceship();
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
    if (isPaused) { return }
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
    if (isPaused) { return }

    if (spawnCount % 5 == 0) {
        const asteroidGeometry = new THREE.SphereGeometry(1.0);

        const textureLoader = new THREE.TextureLoader();
        const asteroidtexture = textureLoader.load('textures/asteroid.jpg');

        const asteroidMaterial = new THREE.MeshStandardMaterial({ map: asteroidtexture });

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

        const textureLoader = new THREE.TextureLoader();
        const asteroidtexture = textureLoader.load('textures/asteroid.jpg');

        const asteroidMaterial = new THREE.MeshStandardMaterial({ map: asteroidtexture });
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

    if (spawnCount % 5 == 0) {
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
    if (isPaused) { return }
    for (var i = 0; i < asteroids.length; ++i) {
        if (asteroids[i].position.y < -10) {
            scene.remove(asteroids[i]);
            asteroids.splice(i, 1);
        } else {
            asteroids[i].position.y -= speed;
        }
    }
}

function updateenergyCount() {
    document.getElementById('energy').textContent = 'energy: ' + energyCount;
}

function updateScore() {

    if (isPaused) { return }

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

                const energyGeometry = new THREE.SphereGeometry(0.25);
                const textureLoader = new THREE.TextureLoader();
                const energytexture = textureLoader.load('textures/plasma.jpg');
                const energyMaterial = new THREE.MeshStandardMaterial({
                    map: energytexture
                });
                const energy = new THREE.Mesh(energyGeometry, energyMaterial);
                energy.position.copy(asteroid.position);
                const energyLight = new THREE.PointLight(0x0000ff, 8,10);

                // Remove laser and asteroid from the scene and from their respective arrays
                scene.remove(laser);
                lasers.splice(i, 1);
                scene.remove(asteroid);
                asteroids.splice(j, 1);
                // Decrement both counters to account for removal of elements
                i--;
                j--;
                energy.add(energyLight);
                scene.add(energy);
                energys.push(energy);

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
    const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 16); // Adjust radius and height as needed
    const laserMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000 });
    const laserLight = new THREE.PointLight(0xff0000, 1, 5); // Adjust intensity and distance as needed

    if (laserCount == 1) {
        const laser = new THREE.Mesh(laserGeometry, laserMaterial);
        laser.add(laserLight);
        laser.position.copy(ship.position); // Start laser from ship's position
        scene.add(laser);
        lasers.push(laser);
    } else if (laserCount == 2) {
        const laser1 = new THREE.Mesh(laserGeometry, laserMaterial);
        laser1.add(laserLight);
        laser1.position.copy(ship.position); // Start laser from ship's position
        laser1.position.x -= 0.5
        scene.add(laser1);
        lasers.push(laser1);

        const laser2 = new THREE.Mesh(laserGeometry, laserMaterial);
        laser2.add(laserLight);
        laser2.position.copy(ship.position); // Start laser from ship's position
        laser2.position.x += 0.5
        scene.add(laser2);
        lasers.push(laser2);
    } else if (laserCount == 3) {
        const laser1 = new THREE.Mesh(laserGeometry, laserMaterial);
        laser1.add(laserLight);
        laser1.position.copy(ship.position); // Start laser from ship's position
        laser1.position.x -= 0.5
        scene.add(laser1);
        lasers.push(laser1);

        const laser2 = new THREE.Mesh(laserGeometry, laserMaterial);
        laser2.add(laserLight);
        laser2.position.copy(ship.position); // Start laser from ship's position
        scene.add(laser2);
        lasers.push(laser2);

        const laser3 = new THREE.Mesh(laserGeometry, laserMaterial);
        laser3.add(laserLight);
        laser3.position.copy(ship.position); // Start laser from ship's position
        laser3.position.x += 0.5
        scene.add(laser3);
        lasers.push(laser3);
    }

    lastShotTime = currentTime;
}

function updateLasers() {
    for (let i = 0; i < lasers.length; i++) {
        lasers[i].position.y += 0.1
    }
}


// Check collision between ship and asteroid
function checkenergyCollision() {
    const shipBox = new THREE.Box3().setFromObject(ship);
    for (let i = 0; i < energys.length; i++) {
        const energy = energys[i];
        const energyBox = new THREE.Box3().setFromObject(energy);

        if (energyBox.intersectsBox(shipBox)) {

            // Remove energy and from the scene
            scene.remove(energy);
            energys.splice(i, 1);
            // Decrement both counters to account for removal of elements
            i--;

            energyCount++;
            updateenergyCount();

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

        checkenergyCollision();

        // Render the scene
        renderer.render(scene, camera);
    }
}

// Start the application
init();



// Shop Functions

function speedUp() {

    if (energyCount >= 5) {
        shipSpeed += 0.01;
        energyCount -= 5
        updateenergyCount();
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
        updateSpaceship();
    } else {
        document.getElementById('laser').style.display = 'none'
    }
}

function updateSpaceship() {
    // Remove the existing ship from the scene
    scene.remove(ship);

    // Create a new ship with the updated laser count
    ship = createSpaceship();
    ship.position.z = 4;
    scene.add(ship);
}