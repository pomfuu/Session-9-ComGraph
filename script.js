import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js"

let cam, renderer, scene;
let width = window.innerWidth;
let height = window.innerHeight;
let model;
let control;

const initCam = () => {
    let aspect = width / height;
    let fov = 45;
    cam = new THREE.PerspectiveCamera(fov, aspect);
    cam.position.set(0, 10,20);
    cam.lookAt(0, 0, 0);
};

const initRenderer = () => {
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

};

const initScene = () => {
    scene = new THREE.Scene();
};

let clock = new THREE.Clock()
let mixer

const render = () => {
    requestAnimationFrame(render)
    renderer.render(scene, cam);
    control.update()
    if(mixer){
        let delta = clock.getDelta()
        mixer.update(delta)
    }
};

const createPointLight = () =>{
    let light = new THREE.PointLight(0xffffff,10,100,0.5)
    light.position.set(30,30,30)
    let pointLightHelper = new THREE.PointLightHelper(light, 1,0xffffff);
    light.castShadow = true
    scene.add(pointLightHelper);
    
    scene.add(light)
}

const createPlane = () =>{
    let geometry = new THREE.PlaneGeometry(50,50)
    let mat = new THREE.MeshPhongMaterial({color:0xffffff})

    let mesh = new THREE.Mesh(geometry, mat)
    mesh.position.y = 0
    mesh.rotateX(-Math.PI/2)
    mesh.receiveShadow = true
    scene.add(mesh)
}

const load3DModel = (url) =>{
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(url,
        (gltf) => {
            console.log(gltf)
            // model = gltf.scene
            resolve(gltf)
        },
        (loading) => {
            console.log(loading.loaded / loading.total * 100) + '% loaded'
        },
        (error) => {
            console.log('error')
            reject(error)
        })
    })
}

const setUpScene = async(url) => {
    try {
        const gltf = await load3DModel(url)
        model = gltf.scene
        model.position.set(0,0,0)
        model.scale.set(20,20,20)
        scene.add(model)
        control.target.copy(model.position)
        playAnimation(gltf,0)
    } catch (error) {
        console.log("error bjir")
    }
}

const orbitControl = () =>{
    control = new OrbitControls(cam, renderer.domElement)
    control.autoRotate = true

}

const playAnimation = (gltf,index) => {
    mixer = new THREE.AnimationMixer(gltf.scene)
    let clip = gltf.animations[index]
    let action = mixer.clipAction(clip)
    action.play()
}

window.onload = () => {
    initCam();
    initRenderer();
    initScene();
    orbitControl();
    createPointLight();
    createPlane();
    setUpScene('./blue_smurf_cat/scene.gltf');
    
    render();
};

window.onresize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
    cam.aspect = width / height;
    cam.updateProjectionMatrix();
};
