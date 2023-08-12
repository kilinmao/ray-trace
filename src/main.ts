// custom imports
import { CanvasWidget } from './canvasWidget';
import { Application, createWindow } from './lib/window';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import RenderWidget from './lib/rendererWidget';

import * as helper from './helper';

import * as utils from './lib/utils';
import * as dat from 'dat.gui';
import { Vector3 } from 'three';

let wid1: CanvasWidget;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const raycaster = new THREE.Raycaster(camera.position);

let lights: THREE.PointLight[];
let intersects: THREE.Intersection[];
let norm;
let MAX_DEPTH = 2;
let superSamplingRate = 2;
let currentPixelStep = 0;
const pixelBlockSize = 16;

class Settings extends utils.Callbackable {
  maxDepth: number = 2;
  subsamples: number = 1;
  width: number = 256;
  height: number = 256;
  correctSpheres: boolean = false;
  phong: boolean = false;
  alllights: boolean = false;
  shadows: boolean = false;
  mirrors: boolean = false;
  render: () => void = function () { };
  saveImg: () => void = function () { };
}

let h = 512, w = 512;

function createGUI(params: Settings): dat.GUI {
  const gui: dat.GUI = new dat.GUI();
  gui.add(params, "width").name("Width").onChange(e => {
    w = e;
    wid1.changeDimensions(w, h);
  });
  gui.add(params, "height").name("Height").onChange(e => {
    h = e;
    wid1.changeDimensions(w, h);
  });
  gui.add(params, "correctSpheres").name("Correct Spheres").onChange(e => { });
  gui.add(params, "phong").name("Phong").onChange(e => { });
  gui.add(params, "alllights").name("All Lights").onChange(e => { });
  gui.add(params, "shadows").name("Shadows").onChange(e => { });
  gui.add(params, "mirrors").name("Mirrors").onChange(e => { });
  gui.add(params, 'maxDepth', 0, 10, 1).name('Max Recursions').onChange(e => {
    MAX_DEPTH = e;
  });
  gui.add(params, "subsamples", 1, 4, 1).name("Subsamples").onChange(e => {
    superSamplingRate = e;
  });
  gui.add(params, "render").name("Render").onChange(() => {
    currentPixelStep = 0;
    wid1.clearCanvas();
    requestAnimationFrame(rayCasting);
  }  
  );
  gui.add(params, "saveImg").name("Save").onChange(() => {
    wid1.savePNG();
  });
  return gui;
}

function getPhongIllumination(light: THREE.Light, normal: Vector3, obj: THREE.Mesh, hitPos: Vector3) {
  // diffuse
  const lightIntensity = light.intensity;
  const lightPos = light.position;
  const lightDir = lightPos.clone().sub(hitPos.clone());
  lightDir.normalize();
  let attenuation = 1 / lightDir.lengthSq();
  const diffColor = light.color.clone().multiplyScalar(lightIntensity * attenuation);
  let diffuse = new THREE.Color();

  if (obj.material instanceof THREE.MeshPhongMaterial) {
    diffuse.copy(obj.material.color).multiply(diffColor).multiplyScalar(Math.max(normal.clone().dot(lightDir), 0.0));
  }
  let outputColor = diffuse;

  // specular
  if (obj.material instanceof THREE.MeshPhongMaterial) {
    const viewDir = camera.position.clone().sub(hitPos).normalize();
    const v = lightDir.clone().add(viewDir).normalize();
    const specAngle = Math.max(normal.dot(v), 0);
    const lambertian = Math.max(normal.dot(lightDir), 0) * light.intensity;
    const l = Math.max(Math.pow(specAngle, obj.material.shininess), 0.0) * lambertian;

    let specular = new THREE.Color();
    specular.copy(obj.material.specular);
    const spec = Math.pow(Math.max(1 - lightDir.dot(v), 0), 5);
    const shininess = obj.material.shininess / 6;
    let c = new THREE.Color(1, 1, 1);
    specular = specular.add(c.sub(specular).multiplyScalar(spec));
    specular.multiply(light.color);
    specular.multiplyScalar(l * attenuation * shininess);
    outputColor.add(specular);
  }

  return outputColor;
}

function getNextPixelBlock() {
  const startX = (currentPixelStep * pixelBlockSize) % w;
  const startY = Math.floor((currentPixelStep * pixelBlockSize) / w) * pixelBlockSize;
  currentPixelStep++;
  return { startX, startY };
}

function rayCasting() {
  const { startX, startY } = getNextPixelBlock();

  for (let i = startX; i < startX + pixelBlockSize && i < w; i++) {
    for (let j = startY; j < startY + pixelBlockSize && j < h; j++) {
      const color = new THREE.Color(0, 0, 0);
      const pixelAmmount = Math.pow(2, superSamplingRate);
      for (let m = 0; m < superSamplingRate; m++) {
        for (let n = 0; n < superSamplingRate; n++) {
          const step = m * superSamplingRate + n;
          const dx = i - 1 + step / pixelAmmount * 2;
          const dy = j - 1 + step / pixelAmmount * 2;
          const coords = new THREE.Vector2((dx / w) * 2 - 1, -(dy / h) * 2 + 1);
          raycaster.setFromCamera(coords, camera);
          for (const light of lights) {
            const lightColor = rayTrace(raycaster, MAX_DEPTH, scene.children, light);
            color.add(lightColor);
          }
        }
      }
      color.multiplyScalar(1 / pixelAmmount);
      wid1.setPixel(i, j, color);
    }
  }

  if (startX + pixelBlockSize < w || startY + pixelBlockSize < h) {
    requestAnimationFrame(rayCasting);
  }
}

function rayTrace(raycaster: THREE.Raycaster, MAX_DEPTH: number, objs: THREE.Object3D[], light: THREE.Light): THREE.Color {
  const pixelColor = new THREE.Color(0, 0, 0);
  //求这些光束和物体的交点
  intersects = raycaster.intersectObjects(objs, false);

  if (intersects[0]?.object instanceof THREE.Mesh) {
    const interObj = intersects[0].object;
    norm = intersects[0].face?.normal?.transformDirection(interObj.matrixWorld);

    if (norm instanceof Vector3) {
      //求物体法线在世界坐标系的表达
      const V = camera.position.clone().sub(intersects[0].point).normalize(); //从物体到视线 V
      const {
        reflectivity,
        mirror,
      } = interObj.material as THREE.MeshPhongMaterial & { mirror: boolean };
      const objectColor = getPhongIllumination(light, norm, interObj, intersects[0].point);

      if (mirror && MAX_DEPTH > 0) {
        //镜面材质 继续追踪
        const R = V.reflect(norm).negate(); //首先求解交点处的反射光线
        const raycasterReflection = new THREE.Raycaster(intersects[0].point, R); //新的追踪光束是R
        pixelColor.add(objectColor);
        const reflectColor = rayTrace(raycasterReflection, MAX_DEPTH - 1, objs, light);
        pixelColor.lerp(reflectColor, reflectivity);
        return pixelColor;
      } else {
        const raycasterFormObjToLight = new THREE.Raycaster(
          intersects[0].point,
          light.position.clone().sub(intersects[0].point).normalize(),
        );
        const o = raycasterFormObjToLight.intersectObjects(objs);
        if (!o[0]) {
          let objectColor = getPhongIllumination(light, norm, interObj, intersects[0].point);
          pixelColor.add(objectColor);
        }
      }
    }
  }
  return pixelColor;
}

function main() {
  const root = Application("Basic");
  root.setLayout([
    ["renderer1", "renderer2"],
    [".", "."],
  ]);
  root.setLayoutColumns(["1fr", "1fr"]);
  root.setLayoutRows(["100%", "0%"]);

  const settings = new Settings();
  const gui = createGUI(settings);
  gui.open();

  const renderer1Div = createWindow("renderer1");
  const renderer2Div = createWindow("renderer2");
  root.appendChild(renderer1Div);
  root.appendChild(renderer2Div);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  helper.setupGeometry(scene);
  lights = helper.setupLight(scene);

  helper.setupCamera(camera);

  const controls = new OrbitControls(camera, renderer2Div);
  helper.setupControls(controls);

  const wid2 = new RenderWidget(renderer2Div, renderer, camera, scene, controls);
  wid1 = new CanvasWidget(renderer1Div);
  wid1.changeDimensions(h, w);
  wid2.animate();
}

main();
