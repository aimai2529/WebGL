import './style.css';
import * as THREE from "three";
import GUI from 'lil-gui';
import Stats from 'stats-js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

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
camera.position.y = 10;
camera.position.z = 15;
scene.add(camera);

//周囲光;
const light = new THREE.AmbientLight(0xffffff, 10);
scene.add(light);

//軸ヘルパー
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

//コントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* Cannon-es ここから */

//物理空間の設定
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // 重力を設定（-9.82：地球上の重力定数）

//材質の設定（変数名、括弧内の値、共に任意の名前）
const concrete = new CANNON.Material('concrete');
const rubber = new CANNON.Material('rubber');

//材質同士が衝突した際の値を設定
const rubberConcrete = new CANNON.ContactMaterial(rubber, concrete, {
  friction: 0.6, //摩擦力の強さ（1に近いほど滑りにくい）
  restitution: 0.5, //跳ね返りの強さ（1に近いほどよく跳ねる）
});
world.addContactMaterial(rubberConcrete); //設定を物理空間に登録

const rubberRubber = new CANNON.ContactMaterial(rubber, rubber, {
  friction: 0.7, //摩擦力の強さ（1に近いほど滑りにくい）
  restitution: 0.8, //跳ね返りの強さ（1に近いほどよく跳ねる）
});
world.addContactMaterial(rubberRubber); //設定を物理空間に登録

const objects = [];

//3dモデルの配置
const createObj = (x = 0, y = 0, z = 0, size = 0.5) => {
  const mtlLoader = new MTLLoader();
  mtlLoader.load('models/Panda/Panda.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('models/Panda/Panda.obj', (object) => {
      object.position.set(x, y, z);
      object.scale.set(size, size, size);
      scene.add(object);

      //物理演算用の球体を設置
      const body = new CANNON.Body({
        mass: 10,
        material: rubber,
        position: new CANNON.Vec3(x, y, z),
        shape: new CANNON.Sphere(size),
      });
      world.addBody(body);

      //配列に代入
      objects.push({
        mesh: object,
        body: body,
      });
    });
  });
};

//関数を実行
createObj(0, 10, 0, 0.5);

const spheres = [];

const createSphere = (x = 0, y = 10, z = 0, size = 0.5) => {
  //球体
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
    })
  );
  scene.add(sphere);

  //物理演算用の球体（画面上には表示されない）
  const sphereBody = new CANNON.Body({
    mass: 1, //質量
    material: rubber,
    position: new CANNON.Vec3(x, y, z), //初期位置
    shape: new CANNON.Sphere(size), //半径
  });
  world.addBody(sphereBody); //物理空間に追加

  //オブジェクトの形で値をプッシュ（追加）する
  spheres.push({
    mesh: sphere,
    body: sphereBody,
  });

}

const boxes = [];

const createBox = (x = 0, y = 5, z = 0, size = 1) => {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random())
    })
  );
  scene.add(box);

  const boxBody = new CANNON.Body({
    mass: 1,
    material: rubber,
    position: new CANNON.Vec3(x, y, z),
    shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)), //halfExtents（半分の範囲）
  });
  world.addBody(boxBody);

  boxes.push({
    mesh: box,
    body: boxBody,
  })


  setTimeout(() => {
    scene.remove(box);
    world.removeBody(boxBody);
  }, 10000);
}

for (let i = 0; i < 100; i++) {
  //関数を実行する
  createSphere(
    Math.random() * 10 - 5,
    Math.random() * 10 + 5,
    Math.random() * 10 - 5,
    Math.random() * 0.5 + 0.1
  );
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'b') { // "b"キーで爆発！
    boxes.forEach(({ body }) => {
      body.applyImpulse(new CANNON.Vec3(
        Math.random() * 20 - 10,
        Math.random() * 15,
        Math.random() * 20 - 10
      ));
    });
  }
});

document.body.addEventListener('click', () => {
  createBox(
    Math.random() * 10 - 5,
    Math.random() * 10 + 5,
    Math.random() * 10 - 5,
    Math.random() * 0.7 + 0.5
  );
})

//床
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(10, 1, 10),
  new THREE.MeshBasicMaterial({
    color: 0x777777,
  })
);
scene.add(floor);

const floorBody = new CANNON.Body({
  mass: 0, //下に落ちないように質量を0にする
  material: concrete,
  shape: new CANNON.Box(new CANNON.Vec3(5, 0.5, 5)),
});
world.addBody(floorBody);

//更新の必要がないので1回だけ紐づける
floorBody.position.copy(floor.position);
floorBody.quaternion.copy(floor.quaternion);

/* Cannon-es ここまで */

//更新
const update = () => {
  stats.begin();

  //物理空間の更新（1秒間に60回）
  world.fixedStep();

  //紐づける
  objects.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position); //位置
    mesh.quaternion.copy(body.quaternion); //回転
  })

  spheres.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position); //位置
    mesh.quaternion.copy(body.quaternion); //回転
  });

  boxes.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  })

  renderer.render(scene, camera);
  controls.update();
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