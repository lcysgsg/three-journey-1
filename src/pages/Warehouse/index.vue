<template>
    <canvas :id="uniqueId"></canvas>

    <!-- modal cabinet-2 -->
    <div class="point point-0 visible">
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

const uniqueId = `three-${Math.random().toString(36).slice(2)}`

function init(canvas: HTMLElement) {
    /**
     * Scene
     */
    const scene = new THREE.Scene()

    /**
     * Sizes
     */
    const sizes = {
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

    /**
     * Camera
     */
    const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        100
    )
    camera.position.set(3, 3, 5)
    scene.add(camera)

    // Controls
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
    })
    renderer.setSize(sizes.width, sizes.height)

    // Renderer Helper
    // const axesHelper = new THREE.AxesHelper(10)
    // scene.add(axesHelper)

    /**
     * Points of interest
     */
    const points = [
        {
            // position: new THREE.Vector3(1.55, 0.3, -0.6),
            position: new THREE.Vector3(0.5, 0.5, 3),
            element: document.querySelector('.point-0') as HTMLElement,
        },
    ]

    /**
     * Raycaster
     */
    const raycaster = new THREE.Raycaster()

    /**
     * Animate
     */
    const tick = () => {
        // Go through each point
        for (const point of points) {
            if (!point.element) return
            // Get 2D screen position
            const screenPosition = point.position.clone()
            screenPosition.project(camera)

            // Set the raycaster
            const xy = new THREE.Vector2(screenPosition.x, screenPosition.y)
            raycaster.setFromCamera(xy, camera)
            const intersects = raycaster.intersectObjects([], true)
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
            const translateY = -screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }

        // Update controls
        controls.update()

        // Render
        renderer.render(scene, camera)

        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }
    tick()
}

onMounted(() => {
    const elemCanvas = document.querySelector(`#${uniqueId}`) as HTMLElement
    init(elemCanvas)
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
