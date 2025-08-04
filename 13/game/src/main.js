import './style.css';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// シーン
const scene = new THREE.Scene();

// カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.set(0, 5, 20);
scene.add(camera);

// 周囲光
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);

// レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

// コントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* 1. ここから追加 */
let score = 0;

// スコア表示
const scoreDiv = document.createElement('div');
scoreDiv.id = 'score';
scoreDiv.style.position = 'absolute';
scoreDiv.style.top = '10px';
scoreDiv.style.left = '10px';
scoreDiv.style.color = 'white';
scoreDiv.style.fontSize = '20px';
scoreDiv.innerText = 'Score: 0';
document.body.appendChild(scoreDiv);

// 床
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// 3Dモデル
let player;
const gltfLoader = new GLTFLoader();
const collectibles = [];

gltfLoader.load('models/kuma.gltf', (gltf) => {
  player = gltf.scene;
  player.scale.set(0.5, 0.5, 0.5);
  player.position.set(0, 1, 0);
  scene.add(player);

  for (let i = 0; i < 10; i++) {
    const x = (Math.random() - 0.5) * 16; // -8〜8
    const z = (Math.random() - 0.5) * 16;

    gltfLoader.load('models/fugu.gltf', (gltf) => {
      const item = gltf.scene;
      item.scale.set(0.5, 0.5, 0.5);
      const y = Math.random() < 0.5 ? 0.4 : 1.8; // 50%で高い位置に出現
      item.position.set(x, y, z);
      item.rotation.y = Math.random() * Math.PI * 2; // ランダムな向き
      scene.add(item);
      collectibles.push(item);
    });
  }

  update();
});

// 障害物
const obstacles = [];

for (let i = 0; i < 5; i++) {
  const x = (Math.random() - 0.5) * 16;
  const z = (Math.random() - 0.5) * 16;

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  box.position.set(x, 0.5, z); // 地面から0.5浮かせる
  scene.add(box);
  obstacles.push(box);
}

// キーボード入力の状態管理
const keyState = {
  w: false,
  a: false,
  s: false,
  d: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

let isJumping = false;
let velocityY = 0;
const gravity = -0.01;

window.addEventListener('keydown', (event) => {
  if (event.key in keyState) keyState[event.key] = true;
  // ジャンプ処理
  if (event.key === ' ' && !isJumping) {
    isJumping = true;
    velocityY = 0.2;
  }
})

window.addEventListener('keyup', (event) => {
  if (event.key in keyState) keyState[event.key] = false;
})

let startTime = null;
let gameCleared = false;

// 更新
const update = () => {
  /* 2. ここから追加 */
  if (player) {
    const speed = 0.1;
    if (keyState.w || keyState.ArrowUp) {
      player.position.z -= speed;
      player.rotation.y = Math.PI;
    }
    if (keyState.a || keyState.ArrowLeft) {
      player.position.x -= speed;
      player.rotation.y = -Math.PI / 2;
    }
    if (keyState.s || keyState.ArrowDown) {
      player.position.z += speed;
      player.rotation.y = 0;
    }
    if (keyState.d || keyState.ArrowRight) {
      player.position.x += speed;
      player.rotation.y = Math.PI / 2;
    }

    if (isJumping) {
      player.position.y += velocityY;
      velocityY += gravity;
      if (player.position.y <= 1) {
        player.position.y = 1;
        isJumping = false;
        velocityY = 0;
      }
    }
  }
  // 床の外に出ないように制限
  const limit = 9.5; // 20の半分 - プレイヤーの半径（=0.5）
  player.position.x = THREE.MathUtils.clamp(player.position.x, -limit, limit);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -limit, limit);

  // 障害物の当たり判定
  obstacles.forEach((obstacle) => {
    const distance = player.position.distanceTo(obstacle.position);
    if (distance < 1.2 && player.position.y < 1.5) {
      // 下をくぐってないなら押し戻す（または止める）
      if (keyState.w || keyState.ArrowUp) {
        player.position.z += 0.1;
      }
      if (keyState.s || keyState.ArrowDown) {
        player.position.z -= 0.1;
      }
      if (keyState.a || keyState.ArrowLeft) {
        player.position.x += 0.1;
      }
      if (keyState.d || keyState.ArrowRight) {
        player.position.x -= 0.1;
      }
    }
  });

  // 時間記録
  if (startTime === null) {
    startTime = Date.now();
  }

  // 距離を取得する
  collectibles.forEach((item, index) => {
    const distance = player.position.distanceTo(item.position);
    // 距離が近くなったらアイテムを削除する
    if (distance < 1) {
      if (item.position.y > 1 && player.position.y < 1.5) {
        return; // ジャンプしてないと取れない
      }
      scene.remove(item);
      collectibles.splice(index, 1);
      score++;
      document.getElementById('score').innerText = `Score: ${score}`;

      if (collectibles.length === 0) {
        gameCleared = true;

        const endTime = Date.now();
        const elapsed = ((endTime - startTime) / 1000).toFixed(2);

        const resultDiv = document.createElement('div');
        resultDiv.style.position = 'absolute';
        resultDiv.style.top = '50%';
        resultDiv.style.left = '50%';
        resultDiv.style.transform = 'translate(-50%, -50%)';
        resultDiv.style.color = 'yellow';
        resultDiv.style.fontSize = '32px';
        resultDiv.style.fontWeight = 'bold';
        resultDiv.style.textAlign = 'center';
        resultDiv.style.whiteSpace = 'pre';
        resultDiv.innerHTML = `Game Clear!\nTime: ${elapsed} 秒`;

        // リトライボタン
        const retryButton = document.createElement('button');
        retryButton.innerText = 'Retry';
        retryButton.style.marginTop = '20px';
        retryButton.style.padding = '10px 20px';
        retryButton.style.fontSize = '20px';
        retryButton.style.border = 'none';
        retryButton.style.borderRadius = '8px';
        retryButton.style.cursor = 'pointer';
        retryButton.onclick = () => {
          location.reload(); // ページをリロードして再スタート
        };

        resultDiv.appendChild(document.createElement('br'));
        resultDiv.appendChild(retryButton);

        document.body.appendChild(resultDiv);
      }
      if (gameCleared) {
        player.rotation.y += 0.05; // 回転演出
        renderer.render(scene, camera);
        controls.update();
        requestAnimationFrame(update);
        return; // それ以上の処理はしない
      }
    }
  });
  if (gameCleared) {
    player.rotation.y += 0.05; // 回転演出
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(update);
    return; // それ以上の処理はしない
  }

  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(update);
};

// update();

// ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});