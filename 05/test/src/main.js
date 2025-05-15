import './style.css';
import * as THREE from "three";
import GUI from 'lil-gui';
import Stats from 'stats-js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
//{}で囲まれたものは、名前が決まっているので変更できない

//UIデバッグ
const gui = new GUI();

//FPSデバッグ
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

//シーン
const scene = new THREE.Scene();

//カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.y = 5;
camera.position.z = 10;
scene.add(camera);

//周囲光
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const lightFolder = gui.addFolder("Light");
lightFolder.add(light, "intensity", 0, 3, 0.01).name("AmbientLight");

//平行光源
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);
directionalLight.position.set(3, 3, 0);

lightFolder.add(directionalLight, "intensity", 0, 3, 0.01).name("DirectionalLight");

//半球光源
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
scene.add(hemisphereLight);

lightFolder.add(hemisphereLight, "intensity", 0, 3, 0.01).name("HemisphereLight");

//軸ヘルパー
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

//床
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const texture = new THREE.TextureLoader().load("Grass.png");
const material = new THREE.MeshBasicMaterial({
  map: texture
});
const plane = new THREE.Mesh(planeGeometry, material);
scene.add(plane);
plane.position.set(0, 0, 0);
plane.rotation.x = -Math.PI * 0.5;
/*--------------------
3Dモデル
--------------------*/
//オブジェクトの追加
const key = {
  up: false,
  down: false,
  right: false,
  left: false,
};

//グループの追加
const group = new THREE.Group();
scene.add(group);

//テクスチャの読み込み
const mtlLoader = new MTLLoader();
mtlLoader.load("models/kingfisher-3d-model/Kingfisher-bl.mtl", (materials) => {
  materials.preload();

  //OBJデータの読み込み
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("models/kingfisher-3d-model/Kingfisher-bl.obj", (obj) => {
    group.add(obj);

    const scl = {
      val: 0.3,
    }
    obj.scale.set(scl.val, scl.val, scl.val);

    //GUIの追加
    const scaleFolder = gui.addFolder("Scale");
    scaleFolder.add(scl, "val", 0.1, 2, 0.1).onChange((val) => {
      obj.scale.set(val, val, val);
    })

    const positionFolder = gui.addFolder('Position');
    positionFolder.add(obj.position, "x", -10, 10, 0.1);
    positionFolder.add(obj.position, "y", -10, 10, 0.1);
    positionFolder.add(obj.position, "z", -10, 10, 0.1);

    const rotationFolder = gui.addFolder('Rotation');
    rotationFolder.add(obj.rotation, "x", -10, 10, 0.1);
    rotationFolder.add(obj.rotation, "y", -10, 10, 0.1);
    rotationFolder.add(obj.rotation, "z", -10, 10, 0.1);

    //キーダウンイベント設定（変更）
    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "ArrowUp":
          key.up = true;
          obj.rotation.y = Math.PI
          break;
        case "ArrowDown":
          key.down = true;
          obj.rotation.y = 0;
          break;
        case "ArrowRight":
          key.right = true;
          obj.rotation.y = Math.PI * 0.5;
          break;
        case "ArrowLeft":
          key.left = true;
          obj.rotation.y = -Math.PI * 0.5;
          break;
        case "KeyR":
          group.position.set(0, 0, 0);
          break;
      }
    });

    //キーアップイベント設定（追加）
    document.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "ArrowUp":
          key.up = false;
          break;
        case "ArrowDown":
          key.down = false;
          break;
        case "ArrowRight":
          key.right = false;
          break;
        case "ArrowLeft":
          key.left = false;
          break;
      }
    });
  });
});



//マウスコントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

//更新
const update = () => {
  stats.begin();
  renderer.render(scene, camera);
  controls.update();
  if (key.up && group.position.z >= -5) {
    group.position.z -= 0.1;
  }
  if (key.down && group.position.z <= 5) {
    group.position.z += 0.1;
  }
  if (key.right && group.position.x <= 5) {
    group.position.x += 0.1;
  }
  if (key.left && group.position.x >= -5) {
    group.position.x -= 0.1;
  }
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