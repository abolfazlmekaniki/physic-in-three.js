import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon-es'
/**
 * Debug
 */
const gui = new GUI()
const debuggui={}
debuggui.createsphre=()=>{
    createSphere(0.5,{x:0,y:3,z:0})
}
debuggui.reset = ()=>{

    for (const object of objectsToUpdate) {
        object.body.removeEventListener("collide",playsound);
        world.remove(object.body);
        scene.remove(object.mesh);
    }
}
gui.add(debuggui,"reset")
gui.add(debuggui,"createsphre");
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


const hitsount = new Audio('sounds/hit.mp3');

const playsound=(collision)=>{
    if(collision.contact.getImpactVelocityAlongNormal()){
        hitsount.volume=Math.random()
        hitsount.currentTime=0;
        hitsount.play();
    }
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])


const world = new CANNON.World();
world.gravity.set(0,-9.82,0)
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
const defaultmaterial = new CANNON.Material("default");
const defalutContactMaterial = new CANNON.ContactMaterial(
    defaultmaterial,
    defaultmaterial,
    {
        friction:0.1,
        restitution:0.6
    }
)

world.addContactMaterial(defalutContactMaterial)
world.defaultContactMaterial = defalutContactMaterial
const objectsToUpdate = []
const geometry = new THREE.SphereGeometry(1, 20, 20);
const material = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
});
const createSphere = (radius, position) =>
{
    // Three.js mesh
    const mesh = new THREE.Mesh(
        geometry,material
        
    )
    mesh.scale.set(radius,radius,radius);
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh);

    const shape = new CANNON.Sphere(radius)

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultmaterial
    })
    body.position.copy(position)
    world.addBody(body);

    objectsToUpdate.push({
        mesh: mesh,
        body: body
    })
}

createSphere(0.5,{x:0,y:3,z:0});

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
})
const createBox = (width, height, depth, position) =>
{
    // Three.js mesh
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: material
    })
    body.position.copy(position);
    body.addEventListener("collide",playsound)
    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ mesh, body })
}

createBox(1, 1.5, 2, { x: 0, y: 3, z: 0 })

debuggui.createBox = () =>
{
    createBox(
        Math.random(),
        Math.random(),
        Math.random(),
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3
        }
    )
}
gui.add(debuggui, 'createBox')



const floorshape = new CANNON.Plane();
const floorbody = new CANNON.Body();
// floorbody.material=defaultmaterial
floorbody.addShape(floorshape);
floorbody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1,0,0),Math.PI/2)
world.addBody(floorbody)
/**
 * Test sphere
 */


/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldstamp = 0;
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    const delta = elapsedTime - oldstamp;
    oldstamp = elapsedTime;

    // Update controls
    controls.update()
    world.step(1/60,delta,3);
    
    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion)
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()