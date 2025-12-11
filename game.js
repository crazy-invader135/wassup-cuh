import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

// --- Global Variables ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Raycaster for checking what the player is looking at
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// *** INVENTORY SYSTEM VARIABLES ***
const INVENTORY_MAX = 4;
const inventory = []; // This array will hold the picked-up items
const interactiveObjects = []; // List of all objects the player can interact with

// --- Scene Setup (Existing elements remain) ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

// Add ground plane
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x888888, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
scene.add(plane);

// Add a simple wall (non-interactive blocking geometry)
const wallGeometry = new THREE.BoxGeometry(0.5, 3, 10);
const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x5555ff });
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.position.set(-8, 1.5, 0);
scene.add(wall);

// --- *** NEW INTERACTIVE OBJECTS (Keys and Tools) *** ---

// 1. Key (Interactive Item)
const keyGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.05);
const keyMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
const key = new THREE.Mesh(keyGeometry, keyMaterial);
key.position.set(5, 0.25, 3);
// Assign a unique name and properties for inventory management
key.name = "Gold Key";
key.type = "key"; 
key.description = "Opens the back door.";
scene.add(key);
interactiveObjects.push(key);

// 2. Wrench (Interactive Item)
const wrenchGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
const wrenchMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
const wrench = new THREE.Mesh(wrenchGeometry, wrenchMaterial);
wrench.position.set(-10, 0.75, -5);
wrench.rotation.z = Math.PI / 2;
wrench.name = "Wrench";
wrench.type = "tool";
wrench.description = "Might unscrew something.";
scene.add(wrench);
interactiveObjects.push(wrench);

// ---------------------------------------------------------

camera.position.set(0, 1.7, 5); // Player height
// (Movement variables and listeners from previous example should be here)

// --- *** NEW RAYCASTING AND PICKUP LOGIC *** ---

function checkInteraction() {
    // 1. Set the raycaster origin to the camera position
    raycaster.setFromCamera(mouse, camera); 
    
    // 2. Intersect the ray with the list of interactive objects
    // The second parameter (true) checks children, but we only have meshes here.
    const intersects = raycaster.intersectObjects(interactiveObjects, false);

    if (intersects.length > 0) {
        // We hit an object
        const objectHit = intersects[0].object;
        
        // Only consider hits within 3 units (close enough to pick up)
        if (intersects[0].distance < 3) {
            console.log(`Looking at: ${objectHit.name}. Press 'E' to pickup.`);
            return objectHit;
        }
    }
    return null;
}

function handlePickup(object) {
    if (object && inventory.length < INVENTORY_MAX) {
        // 1. Add item to inventory array
        inventory.push(object);
        
        // 2. Remove item from the 3D scene
        scene.remove(object);
        
        // 3. Remove item from the list of interactive objects
        const index = interactiveObjects.indexOf(object);
        if (index > -1) {
            interactiveObjects.splice(index, 1);
        }
        
        console.log(`Picked up ${object.name}. Inventory size: ${inventory.length}/${INVENTORY_MAX}`);
        console.log("Current Inventory:", inventory.map(i => i.name));
    } else if (inventory.length >= INVENTORY_MAX) {
        console.log("Inventory full! Cannot carry more than 4 items.");
    }
}

// Update the mouse position to be centered (for the raycaster)
// Since this is a first-person game, the ray originates from the center of the screen (0, 0)
mouse.x = 0; 
mouse.y = 0; 

// --- *** NEW EVENT LISTENER FOR 'E' KEY *** ---

document.addEventListener('keydown', (event) => {
    // Existing movement key handlers go here (W, A, S, D)
    // ... 
    
    // Handle the 'E' key for interaction
    if (event.code === 'KeyE') {
        const objectToPickUp = checkInteraction();
        if (objectToPickUp) {
            handlePickup(objectToPickUp);
        }
    }
    // ... 
});

// --- Game Loop (Keep this) ---
function animate() {
    requestAnimationFrame(animate);

    // Run the interaction check every frame
    checkInteraction(); 

    // (Existing movement logic goes here)

    renderer.render(scene, camera);
}

animate();

// (Window resize listener goes here)
