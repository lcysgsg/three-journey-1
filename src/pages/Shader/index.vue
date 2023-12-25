<template>
    <canvas :id="uniqueId"></canvas>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import * as THREE from 'three'
import GUI from 'lil-gui'

const uniqueId = `three-${Math.random().toString(36).slice(2)}`

onMounted(() => {
    const gui = new GUI({})
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

    const container = document.querySelector(`#${uniqueId}`) as HTMLElement
    const renderer = new THREE.WebGLRenderer({
        canvas: container,
        antialias: true,
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const cursor = {
        x: 0,
        y: 0,
    }
    document.addEventListener('mousemove', (e) => {
        cursor.x = e.clientX / sizes.width - 0.5
        cursor.y = -(e.clientY / sizes.height - 0.5)
    })

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)

    function tick() {
        camera.updateProjectionMatrix()
        renderer.render(scene, camera)
        requestAnimationFrame(tick)
    }
    tick()
})
</script>
