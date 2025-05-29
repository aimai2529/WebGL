import 'the-new-css-reset/css/reset.css';
import './style.css';
import * as THREE from "three";
import GUI from 'lil-gui';
import Stats from 'stats-js';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

//GSAP
gsap.registerPlugin(ScrollTrigger);

//UIデバッグ
const gui = new GUI();

//FPSデバッグ
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

//シーン
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0B24E0);

//カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 5;
scene.add(camera);

//周囲光
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);

//軸ヘルパー
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

//オブジェクト

//-----文字-----
const fontLoader = new FontLoader();
fontLoader.load('../../public/SpaceGroteskMedium_Regular.json', (font) => {

  //テキストジオメトリの追加
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const textGeometry = new TextGeometry("TRIDENT WEBDESIGN", {
    font: font,
    size: 0.5,
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  });

  const textGeometry2 = new TextGeometry("CONFERENCE 2025", {
    font: font,
    size: 0.5,
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  });

  textGeometry.center();
  textGeometry2.center();

  const text = new THREE.Mesh(textGeometry, material);
  text.position.y = 1;
  scene.add(text);
  const text2 = new THREE.Mesh(textGeometry2, material);
  scene.add(text2);

});


//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

//更新
const update = () => {
  stats.begin();
  renderer.render(scene, camera);
  stats.end();
  window.requestAnimationFrame(update);
};

update();

//ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});