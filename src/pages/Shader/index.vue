<template>
    <canvas :id="uniqueId"></canvas>

    <div class="point point-0">
        <div class="label">工器具专用管理柜</div>
        <div class="text">
            Front and top screen with HUD aggregating terrain and battle
            informations.
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import * as THREE from 'three'
import GUI from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import ImgFlagFrench from './flag-french.jpg'

const uniqueId = `three-${Math.random().toString(36).slice(2)}`

onMounted(() => {
    /**
     * Base
     */
    // Debug
    const gui = new GUI({})

    // Canvas
    const elemCanvas = document.querySelector(`#${uniqueId}`) as HTMLElement
    console.log('elemCanvas', elemCanvas)

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000055)

    // Light
    const color = 0xffffff
    const intensity = 1
    const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(-1, 2, 4)
    scene.add(light)

    const lightHelper = new THREE.DirectionalLightHelper(light)
    scene.add(lightHelper)

    // Textures
    const textureLoader = new THREE.TextureLoader()
    const flagTexture = textureLoader.load(ImgFlagFrench)

    /**
     * Test mesh
     */
    // Geometry
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)
    const count = geometry.attributes.position.count
    const randoms = new Float32Array(count)

    for (let i = 0; i < count; i++) {
        randoms[i] = Math.random()
    }

    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

    // Material
    const material = new THREE.ShaderMaterial({
        vertexShader: `uniform vec2 uFrequency;
uniform float uTime;

varying vec2 vUv;
varying float vElevation;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = cos(modelPosition.x * uFrequency.x - uTime) * 0.1;
    elevation += cos(modelPosition.y * uFrequency.y - uTime) * 0.1;

    // modelPosition.x += elevation * 0.2;
    // modelPosition.y += elevation * 0.2;
    modelPosition.z += cos(modelPosition.x * uFrequency.x - uTime) * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv;
    vElevation = elevation;
}`,
        fragmentShader: `uniform vec3 uColor;
        uniform sampler2D uTexture;

        varying vec2 vUv;
        varying float vElevation;

        void main()
        {
            // vec4 textureColor = texture2D(uTexture, vUv);
            // textureColor.rgb *= vElevation * 2.0 + 0.55;
            // gl_FragColor = textureColor;
            gl_FragColor = vec4(vUv, 1.0, 1.0);
        }`,
        side: THREE.DoubleSide,
        uniforms: {
            uFrequency: { value: new THREE.Vector2(10, 5) },
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('red') },
            uTexture: { value: flagTexture },
        },
    })
    gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01)
    gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01)
    gui.add(material.uniforms.uColor.value, 'r').min(0).max(1).step(0.01)
    gui.add(material.uniforms.uColor.value, 'g').min(0).max(1).step(0.01)
    gui.add(material.uniforms.uColor.value, 'b').min(0).max(1).step(0.01)

    // Mesh
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const sizes = {
        // width: 800,
        // height: 600,
        width: window.innerWidth,
        height: window.innerHeight,
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

    const renderer = new THREE.WebGLRenderer({
        canvas: elemCanvas,
        antialias: true,
    })
    renderer.setSize(sizes.width, sizes.height)

    const cursor = {
        x: 0,
        y: 0,
    }
    document.addEventListener('mousemove', (e) => {
        cursor.x = e.clientX / sizes.width - 0.5
        cursor.y = -(e.clientY / sizes.height - 0.5)
    })

    const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        100
    )
    camera.position.z = 5
    // const cameraHelper = new THREE.CameraHelper(camera)
    // scene.add(cameraHelper)
    // const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)

    // Controls
    const controls = new OrbitControls(camera, elemCanvas)
    controls.enableDamping = true

    /**
     * Points of interest
     */
    const points = [
        {
            // position: new THREE.Vector3(1.55, 0.3, -0.6),
            position: new THREE.Vector3(1.55, 0.3, -0.6),
            element: document.querySelector('.point-0') as HTMLElement,
        },
    ]

    /**
     * Animate
     */
    const clock = new THREE.Clock()
    const raycaster = new THREE.Raycaster()

    function tick() {
        const elapsedTime = clock.getElapsedTime()

        // Update material
        material.uniforms.uTime.value = elapsedTime

        // Go through each point
        for (const point of points) {
            if (!point.element) return
            // Get 2D screen position
            const screenPosition = point.position.clone()
            screenPosition.project(camera)

            // Set the raycaster
            raycaster.setFromCamera(screenPosition, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)
            // No intersect found
            if (intersects.length === 0) {
                // Show
                point.element.classList.add('visible')
            }

            // Intersect found
            else {
                // Get the distance of the intersection and the distance of the point
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(camera.position)
                // Intersection is close than the point
                if (intersectionDistance < pointDistance) {
                    // Hide
                    point.element.classList.remove('visible')
                }
                // Intersection is further than the point
                else {
                    // Show
                    point.element.classList.add('visible')
                }
            }
            const translateX = screenPosition.x * sizes.width * 0.5
            console.log('screenPosition.x', screenPosition.x)
            console.log('sizes.width', sizes.width)
            console.log('translateX', translateX)
            const translateY = -screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }

        // Update controls
        controls.update()

        // Render
        renderer.render(scene, camera)

        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
        // camera.updateProjectionMatrix()
        // renderer.render(scene, camera)
        // requestAnimationFrame(tick)
    }
    tick()
})
</script>

<style scoped>
.point {
    position: absolute;
    top: 50%;
    left: 50%;
    /* pointer-events: none; */
}

.point .label {
    position: absolute;
    top: -20px;
    left: -20px;
    padding: 10px 5px;
    width: 140px;
    border-radius: 10px;
    background: #00000077;
    border: 1px solid #ffffff77;
    color: #ffffff;
    text-align: center;
    font-weight: 100;
    font-size: 14px;
    cursor: help;
    transform: scale(0, 0);
    transition: transform 0.3s;
}

.point .text {
    position: absolute;
    top: 30px;
    left: -50px;
    width: 200px;
    padding: 20px;
    border-radius: 4px;
    background: #00000077;
    border: 1px solid #ffffff77;
    color: #ffffff;
    line-height: 1.3em;
    font-family: Helvetica, Arial, sans-serif;
    font-weight: 100;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
}

.point:hover .text {
    opacity: 1;
}

.point.visible .label {
    transform: scale(1, 1);
}
</style>
