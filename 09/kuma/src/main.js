import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

//シーン
const scene = new THREE.Scene();

//カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 5;
scene.add(camera);

//周囲光
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);

//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

//マウスコントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

//GLTFデータの読み込み
const gltfLoader = new GLTFLoader();
gltfLoader.load("models/kuma.gltf", (gltf) => {
  gltf.scene.scale.set(1, 1, 1);
  scene.add(gltf.scene);
});

//更新
const update = () => {
  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(update);
};

update();

//ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});