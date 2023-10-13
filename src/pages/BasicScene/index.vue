<template>
    <canvas :id="uniqueId"></canvas>
</template>

<script setup lang="ts">
import * as three from 'three'
import { onMounted } from 'vue'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const sizes = {
    width: 800,
    height: 600,
}
const uniqueId = `three-${Math.random().toString(36).slice(2)}`
const cursor = {
    x: 0,
    y: 0,
}
document.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5
    cursor.y = -(e.clientY / sizes.height - 0.5)
})

const scene = new three.Scene()
scene.background = new three.Color(0x000000)

const geometry = new three.BoxGeometry(1, 1, 1)
const material = new three.MeshBasicMaterial({ color: 0xff0000 })
const cube = new three.Mesh(geometry, material)

scene.add(cube)

const camera = new three.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 5
camera.position.x = 1
camera.position.y = 1
scene.add(camera)

const axesHelper = new three.AxesHelper(3)
scene.add(axesHelper)

onMounted(() => {
    const container = document.querySelector(`#${uniqueId}`) as HTMLElement
    const renderer = new three.WebGLRenderer({
        canvas: container,
    })
    renderer.setSize(sizes.width, sizes.height)

    const controls = new OrbitControls(camera, container)
    controls.enableDamping = true

    function tick() {
        // camera.position.x = cursor.x * 10
        // camera.position.y = cursor.y * 10
        // camera.lookAt(scene.position)

        controls.update()

        renderer.render(scene, camera)
        requestAnimationFrame(tick)
    }
    tick()
    gsap.to(cube.position, {
        y: 2,
        x: 2,
        duration: 1,
        delay: 1,
    })
    gsap.to(cube.position, {
        y: 0,
        x: 0,
        duration: 1,
        delay: 2,
    })
})
</script>
