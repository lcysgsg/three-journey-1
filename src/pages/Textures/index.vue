<template>
    <canvas :id="uniqueId"></canvas>

    <!-- <div style="position: fixed; z-index: 999">
        <button @click="cabinet4open">开门</button>
        <button @click="cabinet4close">关门</button>
    </div> -->
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
let helmetStatus = false

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
    const debugObject = {}

    /**
     * Update all materials
     */
    const updateAllMaterials = () => {
        scene.traverse((child) => {
            if (
                child instanceof THREE.Mesh &&
                child.material instanceof THREE.MeshStandardMaterial
            ) {
                // child.material.envMap = environmentMap
                // child.material.envMapIntensity = debugObject.envMapIntensity
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }
    // add light
    const ambientLight = new THREE.AmbientLight(0xffffff, 3)
    ambientLight.position.set(0, 0, 1)
    scene.add(ambientLight)
    const AmbientLightGUIFolder = gui.addFolder('AmbientLightGUIFolder')
    AmbientLightGUIFolder.add(ambientLight, 'intensity')
        .min(0)
        .max(3)
        .step(0.01)
    AmbientLightGUIFolder.add(ambientLight.position, 'x')
        .min(-10)
        .max(10)
        .step(0.01)
    AmbientLightGUIFolder.add(ambientLight.position, 'y')
        .min(-10)
        .max(10)
        .step(0.01)
    AmbientLightGUIFolder.add(ambientLight.position, 'z')
        .min(-10)
        .max(10)
        .step(0.01)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    directionalLight.castShadow = true
    // directionalLight.shadow.camera.far = 15
    // directionalLight.shadow.mapSize.set(1024, 1024)
    directionalLight.shadow.normalBias = 0.05
    directionalLight.position.set(-1.3, 7, 1.15)
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
            cabinet2close()
            // action.play()
            // scale the model
            gltf.scene.position.setZ(-1.5)
            gltf.scene.scale.set(0.7, 0.7, 0.7)

            scene.add(gltf.scene)
            modelCabinet2 = gltf.scene
            updateAllMaterials()
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
            updateAllMaterials()
        })
    }
    loadCabinet4Model()

    let modelHelmet: THREE.Group
    function loadModelHelmet() {
        const gltfLoader = new GLTFLoader()
        gltfLoader.load('/models/warehouse/helmet.glb', (gltf) => {
            gltf.scene.position.set(0, 0.2, -1.4)
            gltf.scene.scale.set(0.3, 0.3, 0.3)

            const GUIFolderHelmet = gui.addFolder('model-helmet')
            GUIFolderHelmet.add(gltf.scene.position, 'x')
                .min(-10)
                .max(10)
                .step(0.01)
            GUIFolderHelmet.add(gltf.scene.position, 'y')
                .min(-10)
                .max(10)
                .step(0.01)
            GUIFolderHelmet.add(gltf.scene.position, 'z')
                .min(-10)
                .max(10)
                .step(0.01)
            GUIFolderHelmet.add(gltf.scene.scale, 'x')
                .name('scale-x')
                .min(-10)
                .max(10)
                .step(0.01)
            GUIFolderHelmet.add(gltf.scene.scale, 'y')
                .name('scale-y')
                .min(-10)
                .max(10)
                .step(0.01)
            GUIFolderHelmet.add(gltf.scene.scale, 'z')
                .name('scale-z')
                .min(-10)
                .max(10)
                .step(0.01)
            scene.add(gltf.scene)
            modelHelmet = gltf.scene
            updateAllMaterials()
        })
    }
    loadModelHelmet()

    function loadSceneModel() {
        const gltfLoader = new GLTFLoader()
        gltfLoader.load('/models/warehouse/scene.glb', (gltf) => {
            console.log('gltf', gltf)
            gltf.scene.scale.set(2, 2, 2)
            scene.add(gltf.scene)
            updateAllMaterials()
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
    camera.position.x = -3
    camera.position.y = 6
    camera.position.z = 4
    scene.add(camera)
    // add camera helper
    const cameraHelper = new THREE.CameraHelper(camera)
    scene.add(cameraHelper)

    const controls = new OrbitControls(camera, container)

    // controls.enableDamping = true
    // controls.enabled = false

    const CameraGUIFolder = gui.addFolder('CameraGUIFolder')
    CameraGUIFolder.add(camera.position, 'x')
        .min(-5)
        .max(10)
        .step(0.01)
        .listen()
    CameraGUIFolder.add(camera.position, 'y')
        .min(-5)
        .max(10)
        .step(0.01)
        .listen()
    CameraGUIFolder.add(camera.position, 'z')
        .min(-5)
        .max(10)
        .step(0.01)
        .listen()
    // control camera rotation
    CameraGUIFolder.add(camera.rotation, 'x')
        .name('rotation x')
        .min(-Math.PI)
        .max(Math.PI)
        .step(0.01)
        .onChange(() => {
            // camera.updateProjectionMatrix()
            // camera.updateProjectionMatrix()
            // camera.updateMatrixWorld()
        })
        .listen()
    CameraGUIFolder.add(camera.rotation, 'y')
        .name('rotation y')
        .min(-Math.PI)
        .max(Math.PI)
        .step(0.01)
        .onChange(() => {
            // camera.position.x = 3
            // camera.lookAt(scene.position)
            // camera.updateProjectionMatrix()
            // camera.updateMatrixWorld()
        })
        .listen()
    CameraGUIFolder.add(camera.rotation, 'z')
        .name('rotation z')
        .min(-Math.PI)
        .max(Math.PI)
        .step(0.01)
        .onChange(() => {
            // camera.updateProjectionMatrix()
            // camera.updateProjectionMatrix()
            // camera.updateMatrixWorld()
        })
        .listen()

    const axesHelper = new THREE.AxesHelper(3)
    scene.add(axesHelper)

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

    // initCameraPositionAndLookAt
    const initCameraPositionAndLookAt = () => {
        gsap.to(camera.position, {
            x: -3,
            y: 6,
            z: 4,
            duration: 1,
            onUpdate: () => {
                // camera.lookAt(modelCabinet2.position)
                controls.update()
            },
        })
        gsap.to(controls.target, {
            z: 0,
            y: 0,
            x: 0,
            duration: 1,
            onUpdate: () => {
                // camera.lookAt(modelCabinet2.position)
                controls.update()
            },
        })
    }
    let currentIntersect: THREE.Group<THREE.Object3DEventMap> | undefined
    let currentIntersectCabinet: THREE.Intersection | undefined
    let currentIntersectCabinet4: THREE.Intersection | undefined

    let tempMouseDownIntersect: THREE.Group<THREE.Object3DEventMap> | undefined
    window.addEventListener('mousedown', () => {
        tempMouseDownIntersect = currentIntersect
    })

    window.addEventListener('mouseup', () => {
        // when mouse down object is not the same as mouse up object then return
        if (tempMouseDownIntersect !== currentIntersect) return
        switch (currentIntersect) {
            case modelCabinet2:
                {
                    // use controls.target instead of camera.lookAt
                    // https://discourse.threejs.org/t/controls-target-vs-camera-lookat/5086
                    gsap.to(controls.target, {
                        z: modelCabinet2.position.z,
                        y: 1.5,
                        x: modelCabinet2.position.x,
                        duration: 1,
                        onUpdate: () => {
                            // camera.lookAt(modelCabinet2.position)
                            controls.update()
                        },
                    })
                    gsap.to(camera.position, {
                        z: modelCabinet2.position.z + 5,
                        y: 1.5,
                        x: modelCabinet2.position.x,
                        duration: 1,
                    })
                    // const startOrientation = camera.quaternion.clone()
                    // const targetOrientation = modelCabinet2.quaternion
                    //     .clone()
                    //     .normalize()
                    // gsap.to(
                    //     {},
                    //     {
                    //         duration: 1.3,
                    //         onUpdate: function () {
                    //             camera.quaternion
                    //                 .copy(startOrientation)
                    //                 .slerp(targetOrientation, this.progress())
                    //         },
                    //     }
                    // )
                    // camera.lookAt(modelCabinet2.position)
                    // camera.updateProjectionMatrix()
                    if (cabinet2DoorStatus) {
                        cabinet2close()
                        initCameraPositionAndLookAt()
                    } else {
                        cabinet2open()
                        cabinet4DoorStatus && cabinet4close()
                    }
                }
                break
            case modelCabinet4:
                {
                    gsap.to(controls.target, {
                        z: modelCabinet4.position.z,
                        y: 1.5,
                        x: modelCabinet4.position.x,
                        duration: 1,
                        onUpdate: () => {
                            // camera.lookAt(modelCabinet2.position)
                            controls.update()
                        },
                    })
                    gsap.to(camera.position, {
                        z: modelCabinet4.position.z + 5,
                        y: 1.5,
                        x: modelCabinet4.position.x,
                        duration: 1,
                        onUpdate: () => {
                            // camera.lookAt(modelCabinet4.position)
                        },
                    })
                    // const startOrientation = camera.quaternion.clone()
                    // const targetOrientation = modelCabinet4.quaternion
                    //     .clone()
                    //     .normalize()
                    // gsap.to(
                    //     {},
                    //     {
                    //         duration: 1.3,
                    //         onUpdate: function () {
                    //             camera.quaternion
                    //                 .copy(startOrientation)
                    //                 .slerp(targetOrientation, this.progress())
                    //         },
                    //     }
                    // )
                    // camera.position.z = modelCabinet4.position.z + 5
                    // camera.position.y = 1.5
                    // camera.position.x = modelCabinet4.position.x
                    // camera.lookAt(modelCabinet4.position)
                    // camera.updateProjectionMatrix()
                    if (cabinet4DoorStatus) {
                        cabinet4close()
                        initCameraPositionAndLookAt()
                    } else {
                        cabinet4open()
                        cabinet2DoorStatus && cabinet2close()
                    }
                }
                break

            case modelHelmet:
                {
                    console.log('modelHelmet')

                    gsap.to(controls.target, {
                        y: 0.6,
                        x: modelHelmet.position.x,
                        z: modelHelmet.position.z,
                        duration: 1,
                        onUpdate: () => {
                            // camera.lookAt(modelCabinet2.position)
                            controls.update()
                        },
                    })
                    gsap.to(camera.position, {
                        z: modelHelmet.position.z + 3,
                        y: 1,
                        x: modelHelmet.position.x,
                        duration: 1,
                        onUpdate: () => {
                            // camera.lookAt(modelCabinet4.position)
                        },
                    })

                    if (helmetStatus) {
                        // scale-up model
                        // gsap.to(modelHelmet.scale, {
                        //     x: 0.3,
                        //     y: 0.3,
                        //     z: 0.3,
                        //     duration: 1,
                        // })
                        gsap.to(modelHelmet.position, {
                            x: 0,
                            y: 0.2,
                            z: -1.4,
                            duration: 1,
                        })
                        gsap.to(modelHelmet.rotation, {
                            y: 0,
                            duration: 1,
                        })
                        helmetStatus = false
                    } else {
                        // scale-up model
                        // gsap.to(modelHelmet.scale, {
                        //     z: 0.6,
                        //     y: 0.6,
                        //     x: 0.6,
                        //     duration: 1,
                        // })
                        gsap.to(modelHelmet.position, {
                            x: 0,
                            y: 0.6,
                            z: 0,
                            duration: 1,
                        })
                        helmetStatus = true
                    }
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
        const objects = [modelCabinet2, modelCabinet4, modelHelmet]
        if (modelCabinet2 && modelCabinet4 && modelCabinet2) {
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

        // helmetStatus === true let the model rotate calc it with Math.PI
        if (helmetStatus) {
            modelHelmet.rotation.y += 0.01
        }

        // controls.update()

        camera.updateProjectionMatrix()
        renderer.render(scene, camera)
        requestAnimationFrame(tick)
    }
    tick()
})
</script>
