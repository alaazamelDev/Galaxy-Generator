import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 400 })

// TextureLoader
const textureLoader = new THREE.TextureLoader()

// Textures
const starParticlesTexture = textureLoader.load('./textures/particles/8.png')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */

// this object contains all the properties of the galaxy 
// ex : size, radius, scale, etc..
const paramaters = {}
paramaters.count = 10000    // count of particles
paramaters.size = 0.01
paramaters.sizeAttenuation = true
paramaters.radius = 5
paramaters.branches = 3
paramaters.spin = 1
paramaters.randomness = 0.2
paramaters.randomnessPower = 3
paramaters.insideColor = '#ff0000'
paramaters.outsideColor = '#0000ff'


let starGeometry = null
let starMaterial = null
let starParticles = null

let vertices = null
let colors = null

// draw particles
const _drawParticles = () => {

    if (starParticles !== null) {
        vertices = []
        colors = []
        starGeometry.dispose()
        starMaterial.dispose()
        scene.remove(starParticles)
    }

    colors = []
    vertices = []
    starGeometry = new THREE.BufferGeometry()
    starMaterial = new THREE.PointsMaterial({
        size: paramaters.size,
        sizeAttenuation: paramaters.sizeAttenuation,
        // alphaMap: starParticlesTexture,
        // transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    starParticles = new THREE.Points(starGeometry, starMaterial)
    for (let i = 0; i < paramaters.count * 3; i++) {

        const radius = Math.random() * paramaters.radius
        const spinAngle = radius * paramaters.spin
        const branchAngle = ((Math.PI * 2) / paramaters.branches) * (i % paramaters.branches)
        const i3 = i * 3

        const randomX = Math.pow(Math.random(), paramaters.randomnessPower) * (Math.random() < 0.5 ? -1 : 1) * paramaters.randomness
        const randomY = Math.pow(Math.random(), paramaters.randomnessPower) * (Math.random() < 0.5 ? -1 : 1) * paramaters.randomness
        const randomZ = Math.pow(Math.random(), paramaters.randomnessPower) * (Math.random() < 0.5 ? -1 : 1) * paramaters.randomness

        vertices[i3 + 0] = radius * Math.cos(branchAngle + spinAngle) + randomX
        vertices[i3 + 1] = randomY
        vertices[i3 + 2] = radius * Math.sin(branchAngle + spinAngle) + randomZ

        const mixedColor = new THREE.Color(paramaters.insideColor).clone()

        // Lerp the inside color into outsideColor and add tranceperancy depending on radius
        mixedColor.lerp(new THREE.Color(paramaters.outsideColor), radius / paramaters.radius)

        colors[i3 + 0] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }


    // set position attribute of vertices in starGeometry
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    // add it to the scene
    scene.add(starParticles)
}


const generateGalaxy = () => {

    // Draw Star Particles
    _drawParticles()
}

generateGalaxy()


// Tweak values

// Add count and size tweaks to dat.gui
gui.add(paramaters, 'count').name('Particles Count').min(100).max(1000000).step(10).onFinishChange(generateGalaxy)
gui.add(paramaters, 'size').name('Particle Size').min(0.01).max(0.5).step(0.0001).onFinishChange(generateGalaxy)
gui.add(paramaters, 'radius').name('Galaxy Radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(paramaters, 'branches').name('Branches Count').min(1).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(paramaters, 'spin').name('Spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(paramaters, 'randomness').name('Randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(paramaters, 'randomnessPower').name('Randomness Power').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(paramaters, 'insideColor').name('Inside Color').onFinishChange(generateGalaxy)
gui.addColor(paramaters, 'outsideColor').name('Outside Color').onFinishChange(generateGalaxy)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
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
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
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
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()