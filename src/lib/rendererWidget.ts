import * as THREE from 'three';
import Stats from 'stats.js';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import type { Window } from "./window";

export default class RenderWidget{
  Parent: HTMLElement;
  Renderer: THREE.WebGLRenderer;
  Camera: THREE.PerspectiveCamera|THREE.OrthographicCamera;
  Scene: THREE.Scene;
  Stats: Stats;
  Controls: OrbitControls | TrackballControls | undefined;

  constructor(parent: HTMLElement | Window,
              renderer: THREE.WebGLRenderer,
              camera: THREE.PerspectiveCamera|THREE.OrthographicCamera,
              scene: THREE.Scene,
              controls?: OrbitControls | TrackballControls) {
    this.Parent = parent;
    this.Renderer = renderer;
    this.Camera = camera;
    this.Scene = scene;
    this.Stats = new Stats();

    this.Controls = controls;
    // append Stats to parent
    this.Stats.dom.style.position = "absolute";
    this.Parent.appendChild(this.Stats.dom);

    // initializate renderer
    this.Renderer.setPixelRatio(window.devicePixelRatio);
    this.Renderer.setSize(this.Parent.offsetWidth, this.Parent.offsetHeight);
    this.Renderer.autoClear = false;



    // initializate camera
    if (this.Camera instanceof THREE.PerspectiveCamera){
      this.Camera.aspect = this.Parent.offsetWidth / this.Parent.offsetHeight;
    }
    this.Camera.updateProjectionMatrix();

    // listen on resize
    window.addEventListener('resize', () => {
      this.Renderer.setSize(this.Parent.offsetWidth, this.Parent.offsetHeight);
      if (this.Camera instanceof THREE.PerspectiveCamera){
        this.Camera.aspect = this.Parent.offsetWidth / this.Parent.offsetHeight;
      }
      this.Camera.updateProjectionMatrix();      
    });



    // append to DOM
    this.Parent.appendChild( this.Renderer.domElement );
  }
  update() {
    this.Stats.update();
    if (this.Controls != undefined){
      this.Controls.update();
    }
  }
  preRenderHook(){}
  render(){
    this.Renderer.render(this.Scene, this.Camera);
  }
  animate(){
    requestAnimationFrame(this.animate.bind(this));
    this.update();
    this.preRenderHook();
    this.render();
  }
}
