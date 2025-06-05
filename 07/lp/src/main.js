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
// const gui = new GUI();

//FPSデバッグ
// const stats = new Stats();
// stats.showPanel(0);
// document.body.appendChild(stats.dom);

//シーン
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0B24E0);

//カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 4;
scene.add(camera);

gsap
  .timeline({
    scrollTrigger: {
      trigger: '#session',
      start: 'top center',
      end: 'bottom center',
      toggleActions: 'play none none reverse',
      scrub: true,
      markers: false,
    },
  })
  .to(camera.position, {
    z: 0,
    y: -4,
    ease: "none",
  })
  .to(camera.rotation, {
    x: Math.PI / 2,
    ease: "none",
  }, 0);

//周囲光
const light = new THREE.AmbientLight(0xffffff, 3);
scene.add(light);

//平行光
const directionalLight = new THREE.DirectionalLight(0x0000ff, 10);
directionalLight.position.set(0, 1, 2);
scene.add(directionalLight);

//軸ヘルパー
// const axesHelper = new THREE.AxesHelper(2);
// scene.add(axesHelper);

//オブジェクト

//-----文字-----
const fontLoader = new FontLoader();
fontLoader.load('SpaceGroteskMedium_Regular.json', (font) => {

  //テキストジオメトリの追加
  const material = new THREE.MeshStandardMaterial({ color: 0xf9dc7c });
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
    bevelThickness: 0.05,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  });

  textGeometry.center();
  textGeometry2.center();

  const text = new THREE.Mesh(textGeometry, material);
  text.position.y = 0.8;
  scene.add(text);
  const text2 = new THREE.Mesh(textGeometry2, material);
  scene.add(text2);

  gsap
    .timeline({
      scrollTrigger: {
        trigger: '#top',
        // start: 'top center',
        end: 'bottom center',
        toggleActions: 'play pause resume reverse',
        scrub: false,
        markers: false,
      },
    })
    .to(text.scale, {
      delay: 0,
      repeatDelay: 1.5,
      duration: 3,
      x: 1.2,
      y: 1.2,
      y: 1.2,
      repeat: -1,
      yoyo: true,
      // ease: "back.in(1.3) ",
    })
    .to(text2.scale, {
      delay: 1.5,
      repeatDelay: 1.5,
      duration: 3,
      x: 1.2,
      y: 1.2,
      y: 1.2,
      repeat: -1,
      yoyo: true,
      // ease: "back.in(1.3) ",
    }, 0)

  gsap
    .timeline({
      scrollTrigger: {
        trigger: '#concept',
        start: 'top center',
        end: 'bottom center',
        toggleActions: 'play none none reverse',
        scrub: true,
        markers: false,
      },
    })
    .to(text.rotation, {
      y: Math.PI * 1,
      ease: "back.in(1.3) ",
    })
    .to(text2.rotation, {
      y: - Math.PI * 1,
      ease: "back.in(1.3)",
    }, "<")

  gsap
    .timeline({
      scrollTrigger: {
        trigger: '#session',
        start: 'top center',
        end: 'bottom center',
        toggleActions: 'play none none reverse',
        scrub: true,
        markers: false,
      },
    })
    .to(text.rotation, {
      y: Math.PI * 2,
      x: Math.PI / 2,
      ease: "none",
    })
    .to(text.position, {
      z: 1,
      ease: "none",
    }, 0)
    .to(text2.rotation, {
      y: - Math.PI * 2,
      x: Math.PI / 2,
      ease: "none",
    }, 0)
});

//パーティクル
const bufferGeometry = new THREE.BufferGeometry();
const count = 3000;
const vertices = new Float32Array(count * 3);
//一つの頂点に対して、x座標、y座標、z座標の3つの値が必要だよ
const colors = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  vertices[i] = Math.random() * 10 - 5;
  colors[i] = Math.random();
}

bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
bufferGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

//メッシュ化
const pointsMaterial = new THREE.PointsMaterial({
  size: 0.05,
  sizeAttenuation: true,
  //遠くの点ほど小さくなるみたいな
  // color: 0xff00ff,
  vertexColors: true,
  depthWrite: false,
  //描写された順番でレイヤー順を決めるか、みたいな
});
const patricles = new THREE.Points(
  bufferGeometry,
  pointsMaterial
)
scene.add(patricles);

//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

const clock = new THREE.Clock();

//更新
const update = () => {
  // stats.begin();

  const elapsedTime = clock.getElapsedTime();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = bufferGeometry.attributes.position.array[i3];
    const y = bufferGeometry.attributes.position.array[i3 + 1];
    const z = bufferGeometry.attributes.position.array[i3 + 2];
    bufferGeometry.attributes.position.array[i3 + 2] = Math.sin(elapsedTime / 2 + x + y);
    // bufferGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime / 2 + x);
  }
  bufferGeometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
  // stats.end();
  window.requestAnimationFrame(update);
};

update();

//ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});