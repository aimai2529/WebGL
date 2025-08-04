import './style.css';
import * as THREE from "three";
import GUI from 'lil-gui';
import Stats from 'stats-js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

// UIデバッグ
const gui = new GUI();

// FPSデバッグ
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// シーン
const scene = new THREE.Scene();

// カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 5;
scene.add(camera);

// 環境マップの読み込み
const loader = new THREE.CubeTextureLoader();
const environmentMap = loader.load([
  'textures/cube/posx.jpg', // 右面
  'textures/cube/negx.jpg', // 左面
  'textures/cube/posy.jpg', // 上面
  'textures/cube/negy.jpg', // 下面
  'textures/cube/posz.jpg', // 前面
  'textures/cube/negz.jpg', // 背面
]);

// 背景に設定
scene.background = environmentMap;

// 周囲光
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);

// 軸ヘルパー
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

// オブジェクト
const draggableObjects = []; // ドラッグ可能なオブジェクトを配列にまとめる

// const sphere = new THREE.Mesh(
//   new THREE.SphereGeometry(1, 64, 64),
//   new THREE.MeshStandardMaterial({
//     metalness: 1,
//     roughness: 0,
//     envMap: environmentMap,
//   })
// );
// sphere.name = `Sphere`;
// scene.add(sphere);
// draggableObjects.push(sphere);

// // GUI
// const materialFolder = gui.addFolder('Material Settings');
// materialFolder.add(sphere.material, 'metalness', 0, 1, 0.01);
// materialFolder.add(sphere.material, 'roughness', 0, 1, 0.01);

//数字つきテクスチャを作る関数
function createNumberTexture(number) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // 数字
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(number, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const limit = 5;

for (let i = 1; i <= limit; i++) {
  const texture = createNumberTexture(i);
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    // new THREE.MeshStandardMaterial({
    //   metalness: 1,
    //   roughness: 0,
    //   envMap: environmentMap,
    // })
    new THREE.MeshBasicMaterial({
      map: texture,
    })
  );
  box.name = `${i}`;
  box.position.set(
    (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 30
  );
  scene.add(box);
  draggableObjects.push(box);
}


// レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

// コントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ドラッグコントロール
const dragControls = new DragControls(draggableObjects, camera, renderer.domElement); // ドラッグコントロールの初期化

// ドラッグコントロールのイベントリスナー
// OrbitControlsとDragControlsを併用する場合、ドラッグ中はOrbitControlsを無効にする必要がある
dragControls.addEventListener('dragstart', () => controls.enabled = false);
dragControls.addEventListener('dragend', () => controls.enabled = true);

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const info = document.querySelector('#info');

let currentNumber = 1;

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(draggableObjects, true);

  intersects.forEach((intersect) => {
    if (intersect.object.isMesh) {
      const target = intersect.object;

      info.textContent = `${target.name} がクリックされました`;

      if (target.name == currentNumber) {
        target.material.color.set(0xff0000);
        currentNumber++;

        if (currentNumber > limit) {
          draggableObjects.forEach(obj => {
            obj.material.color.set(0x00ff00);
          })
        }
      }

      // scene.remove(target);
      // // 配列からも削除
      // const index = draggableObjects.indexOf(target);
      // if (index > -1) draggableObjects.splice(index, 1);
      // // メモリ解放
      // if (target.geometry) target.geometry.dispose();
      // if (target.material) target.material.dispose();
    }
  })
})

// 更新
const update = () => {
  stats.begin();
  renderer.render(scene, camera);
  controls.update();
  stats.end();
  window.requestAnimationFrame(update);
};

update();

// ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});