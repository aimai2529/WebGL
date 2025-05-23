import './style.css';
import * as THREE from "three";
import GUI from 'lil-gui';
import Stats from 'stats-js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

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
camera.position.z = 5;
scene.add(camera);

//軸ヘルパー
// const axesHelper = new THREE.AxesHelper(2);
// scene.add(axesHelper);

//周囲光
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);

//オブジェクト
const mtlLoader = new MTLLoader();
mtlLoader.load('models/kingfisher-3d-model/Kingfisher-bl.mtl', (materials) => {
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load('models/kingfisher-3d-model/Kingfisher-bl.obj', (obj) => {
    scene.add(obj);
    obj.scale.set(0.2, 0.2, 0.2);

    //#trigger01のアニメーション
    gsap
      .timeline({
        scrollTrigger: {
          trigger: '#trigger01',
          start: 'top center',
          end: 'bottom center',
          toggleActions: 'play none none reverse',
          scrub: true,
          markers: true,
        },
      })
      .to(obj.position, {
        z: 5,
      });

    //#trigger02のアニメーション
    gsap
      .timeline({
        scrollTrigger: {
          trigger: '#trigger02',
          start: 'top center',
          end: 'bottom center',
          toggleActions: 'play none none reverse',
          scrub: true,
          markers: true,
        },
      })
      .to(obj.position, {
        z: 0,
      })
      .to(obj.rotation, {
        z: Math.PI * 2,
      }, '0');

    //#trigger03のアニメーション
    gsap
      .timeline({
        scrollTrigger: {
          trigger: '#trigger03',
          start: 'top center',
          end: 'bottom center',
          toggleActions: 'play none none reverse',
          scrub: true,
          markers: true,
        },
      })
      .to(obj.position, {
        y: -2,
      })
      .to(obj.scale, {
        x: 0,
        y: 0,
        z: 0,
      }, '0');

    // gsap
    //   .timeline({
    //     scrollTrigger: {
    //       trigger: '.trigger',
    //       start: "top center",
    //       end: "bottom center",
    //       scrub: true,
    //       markers: true,
    //     },
    //     repeat: 0,
    //     repeatDelay: 1,
    //     yoyo: false,
    //   })
    //   .set(obj.position, {
    //     x: -2,
    //     y: 3,
    //   })
    //   .to(obj.position, {
    //     y: 0,
    //     duration: 1,
    //     ease: 'power1.in',
    //   })
    //   .to(obj.position, {
    //     y: 2,
    //     duration: 0.6,
    //     ease: 'power1.out',
    //   })
    //   .to(obj.position, {
    //     y: 0,
    //     duration: 0.6,
    //     ease: 'power1.in',
    //   })
    //   .to(obj.position, {
    //     y: 1,
    //     duration: 0.3,
    //     ease: 'power1.out',
    //   })
    //   .to(obj.position, {
    //     y: 0,
    //     duration: 0.3,
    //     ease: 'power1.in',
    //   })
    //   .to(obj.position, {
    //     y: 0.1,
    //     duration: 0.1,
    //     ease: 'power1.out',
    //   })
    //   .to(obj.position, {
    //     y: 0,
    //     duration: 0.1,
    //     ease: 'power1.in',
    //   })

    //   .to(obj.position, {
    //     x: 2,
    //     duration: 3.3,
    //     ease: 'power1.out',
    //   }, '0')

    //   .to(obj.rotation, {
    //     duration: 3,
    //     y: Math.PI * 2,
    //     x: Math.PI * 2,
    //   }, '0')

    //GUI
    gui.add(obj.rotation, 'x', 0, Math.PI * 2, 0.01).name('X軸回転');
    gui.add(obj.rotation, 'y', 0, Math.PI * 2, 0.01).name('Y軸回転');
    gui.add(obj.rotation, 'z', 0, Math.PI * 2, 0.01).name('Z軸回転')

  });
});

//アニメーション
// gsap.from(cube.position, {
//   y: 2,
//   duration: 3,
//   ease: 'bounce.out',
//   repeat: 0,
// });
// gsap.from(cube.position, {
//   x: 2,
//   duration: 3.5,
//   ease: 'power1.out',
//   repeat: 0,
// });

// gsap.to(cube.rotation, {
//   x: Math.PI * 2,
//   y: Math.PI * 2,
//   z: Math.PI * 2,
//   duration: 3,
//   ease: 'power1.out',
//   repeatDelay: 1,
//   repeat: -1,
// });


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