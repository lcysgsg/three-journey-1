<template>
    <canvas :id="uniqueId"></canvas>

    <div style="position: fixed; z-index: 999">
        <button @click="cabinet4open">开门</button>
        <button @click="cabinet4close">关门</button>
    </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { onMounted } from 'vue'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const uniqueId = `three-${Math.random().toString(36).slice(2)}`

let cabinet2DoorStatus = false
let cabinet2open: () => void
let cabinet2close: () => void
let cabinet4DoorStatus = false
let cabinet4open: () => void
let cabinet4close: () => void

onMounted(() => {
    const gui = new GUI({})
    const sizes = {
        width: 800,
        height: 600,
    }
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

    // add light
    const light = new THREE.AmbientLight(0xffffff, 1)
    light.position.set(0, 0, 1)
    scene.add(light)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(-4, 5, 3)
    scene.add(directionalLight)

    const directionalLightHelper = new THREE.DirectionalLightHelper(
        directionalLight
    )
    scene.add(directionalLightHelper)
    const DirectionalLightGUIFolder = gui.addFolder('DirectionalLight')
    DirectionalLightGUIFolder.add(directionalLight, 'intensity')
        .min(0)
        .max(3)
        .step(0.01)
    DirectionalLightGUIFolder.add(directionalLight.position, 'x')
        .min(-10)
        .max(10)
        .step(0.01)
    DirectionalLightGUIFolder.add(directionalLight.position, 'y')
        .min(-10)
        .max(10)
        .step(0.01)
    DirectionalLightGUIFolder.add(directionalLight.position, 'z')
        .min(-10)
        .max(10)
        .step(0.01)

    let cabinet2Mixer: THREE.AnimationMixer
    let modelCabinet2: THREE.Group
    function loadCabinetModel() {
        const gltfLoader = new GLTFLoader()
        // gltfLoader.load('/models/Fox/glTF-Binary/Fox.glb', (gltf) => {
        gltfLoader.load('/models/warehouse/cabinet-2.glb', (gltf) => {
            // gltfLoader.load('/models/test1.glb', (gltf) => {
            console.log('gltf', gltf)
            cabinet2Mixer = new THREE.AnimationMixer(gltf.scene)
            const actionClose = cabinet2Mixer.clipAction(gltf.animations[0])
            const actionOpen = cabinet2Mixer.clipAction(gltf.animations[1])
            actionOpen.clampWhenFinished = true
            actionOpen.setLoop(THREE.LoopOnce, 1)
            actionClose.clampWhenFinished = true
            actionClose.setLoop(THREE.LoopOnce, 1)
            cabinet2open = () => {
                actionClose.stop()
                actionOpen.reset().play()
                cabinet2DoorStatus = true
            }
            cabinet2close = () => {
                actionOpen.stop()
                actionClose.reset().play()
                cabinet2DoorStatus = false
            }
            // action.play()
            // scale the model
            gltf.scene.position.setZ(-1.5)
            gltf.scene.scale.set(0.7, 0.7, 0.7)
            scene.add(gltf.scene)
            modelCabinet2 = gltf.scene
            // modelCabinet.traverse((child) => {
            //     child._name = 'cabinet-2'
            // })
        })
    }
    loadCabinetModel()

    let cabinet4Mixer: THREE.AnimationMixer
    let modelCabinet4: THREE.Group
    function loadCabinet4Model() {
        const gltfLoader = new GLTFLoader()
        // gltfLoader.load('/models/Fox/glTF-Binary/Fox.glb', (gltf) => {
        gltfLoader.load('/models/warehouse/cabinet-4.glb', (gltf) => {
            // gltfLoader.load('/models/test1.glb', (gltf) => {
            console.log('gltf', gltf)
            cabinet4Mixer = new THREE.AnimationMixer(gltf.scene)
            const actionClose = cabinet4Mixer.clipAction(gltf.animations[0])
            const actionOpen = cabinet4Mixer.clipAction(gltf.animations[1])
            actionOpen.clampWhenFinished = true
            actionOpen.setLoop(THREE.LoopOnce, 1)
            actionClose.clampWhenFinished = true
            actionClose.setLoop(THREE.LoopOnce, 1)
            cabinet4open = () => {
                actionClose.stop()
                actionOpen.reset().play()
                cabinet4DoorStatus = true
            }
            cabinet4close = () => {
                actionOpen.stop()
                actionClose.reset().play()
                cabinet4DoorStatus = false
            }
            // action.play()
            // scale the model
            gltf.scene.position.set(1.8, 0, -1.5)
            gltf.scene.scale.set(0.7, 0.7, 0.7)
            scene.add(gltf.scene)
            modelCabinet4 = gltf.scene
            // modelCabinet4.traverse((child) => {
            //     child._name = 'cabinet-4'
            // })
        })
    }
    loadCabinet4Model()

    function loadSceneModel() {
        const gltfLoader = new GLTFLoader()
        gltfLoader.load('/models/warehouse/scene.glb', (gltf) => {
            console.log('gltf', gltf)
            gltf.scene.scale.set(2, 2, 2)
            scene.add(gltf.scene)
        })
    }
    loadSceneModel()

    function addMesh1() {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        const cube = new THREE.Mesh(geometry, material)

        scene.add(cube)
    }
    // addMesh1()

    function addMesh2() {
        const texture = new THREE.TextureLoader().load('textures/crate.gif')
        texture.colorSpace = THREE.SRGBColorSpace

        const geometry = new THREE.BoxGeometry()
        const material = new THREE.MeshStandardMaterial()
        material.map = texture
        material.roughness = 0.45
        material.metalness = 0.65

        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
        gui.add(mesh.position, 'x', -3, 3, 0.01)
        gui.add(material, 'metalness', 0, 1, 0.01)
        gui.add(material, 'roughness', 0, 1, 0.01)
    }
    // addMesh2()

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
    camera.position.z = 5
    camera.position.x = 1
    camera.position.y = 1
    scene.add(camera)

    const axesHelper = new THREE.AxesHelper(3)
    scene.add(axesHelper)

    const container = document.querySelector(`#${uniqueId}`) as HTMLElement
    const renderer = new THREE.WebGLRenderer({
        canvas: container,
        antialias: true,
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.shadowMap.enabled = true

    const controls = new OrbitControls(camera, container)
    controls.enableDamping = true

    /**
     * Raycaster
     */
    const raycaster = new THREE.Raycaster()
    // const rayOrigin = new THREE.Vector3(-3, 0, 0)
    // const rayDirection = new THREE.Vector3(10, 0, 0)
    // rayDirection.normalize()

    /**
     * Mouse
     */
    const mouse = new THREE.Vector2()
    const wrap = document.getElementById(uniqueId)

    if (wrap) {
        wrap.addEventListener('mousemove', (event) => {
            const xInWrap = event.clientX - wrap.offsetLeft
            const yInWrap = event.clientY - wrap.offsetTop
            mouse.x = (xInWrap / sizes.width) * 2 - 1
            mouse.y = -(yInWrap / sizes.height) * 2 + 1
        })
    }

    let currentIntersect: THREE.Group<THREE.Object3DEventMap> | undefined
    let currentIntersectCabinet: THREE.Intersection | undefined
    let currentIntersectCabinet4: THREE.Intersection | undefined
    window.addEventListener('click', () => {
        switch (currentIntersect) {
            case modelCabinet2:
                console.log('modelCabinet')
                if (cabinet2DoorStatus) {
                    cabinet2close()
                } else {
                    cabinet2open()
                }
                break
            case modelCabinet4:
                console.log('modelCabinet4')
                if (cabinet4DoorStatus) {
                    cabinet4close()
                } else {
                    cabinet4open()
                }
                break
        }
    })
    function tick() {
        // camera.position.x = cursor.x * 10
        // camera.position.y = cursor.y * 10
        // camera.lookAt(scene.position)

        // Cast a ray from the mouse and handle events
        raycaster.setFromCamera(mouse, camera)
        const objects = [modelCabinet2, modelCabinet4]
        if (modelCabinet2 && modelCabinet4) {
            const intersects = raycaster.intersectObjects(objects)

            if (intersects.length) {
                let highestModel = intersects[0].object
                while (highestModel.parent?.parent !== null) {
                    if (!highestModel.parent) return
                    highestModel = highestModel.parent
                }

                objects.forEach((obj) => {
                    if (obj === highestModel) {
                        currentIntersect = obj
                        // obj.scale.set(1, 1, 1)
                    } else {
                        // obj.scale.set(0.7, 0.7, 0.7)
                    }
                })
            } else {
                // currentIntersect?.scale.set(0.7, 0.7, 0.7)
                currentIntersect = undefined
            }

            // if (intersects.length) {
            //     modelCabinet.scale.set(1, 1, 1)
            //     currentIntersectCabinet = intersects[0]
            // } else {
            //     modelCabinet.scale.set(0.7, 0.7, 0.7)
            //     currentIntersectCabinet = undefined
            // }

            // if (intersects.length) {
            //     let highestModel = intersects[0].object
            //     while (highestModel.parent?.parent !== null) {
            //         if (!highestModel.parent) return
            //         highestModel = highestModel.parent
            //     }
            //     console.log('intersects', intersects)
            //     if (highestModel === modelCabinet4) {
            //         modelCabinet4.scale.set(1, 1, 1)
            //     }
            // } else {
            //     modelCabinet4.scale.set(0.7, 0.7, 0.7)
            // }
        }

        if (cabinet2Mixer) {
            cabinet2Mixer.update(0.01)
        }

        if (cabinet4Mixer) {
            cabinet4Mixer.update(0.01)
        }

        controls.update()

        renderer.render(scene, camera)
        requestAnimationFrame(tick)
    }
    tick()
})
</script>