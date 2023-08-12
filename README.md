# Basic Three.js Raytracer

A simple raytracer using WebGL and Three.js to render static scenes and raytrace them as well. Additionally, you can view the 🌟 [demo](https://kilinmao.github.io/ray-trace/). 🌟 

## Features
* Phong illumination model
* Reflections
* Shadows
* Supersampling
* Controllable camera with orbit controls
* Adjustable size of the rendered image
* Download rendered images as PNG
* Flexible rendering settings through dat.GUI

## Usage
1. Set up your scene using helpers in the `helper.ts` file or create your own components.
2. Adjust rendering settings using the dat.GUI controls as desired.
3. Press the "Render" button to start rendering the scene.
4. To download a high-quality render of the scene, press the "Save" button.

## Main Functionality
The raytracer functionality can be found in the `rayCasting` function in the `main.ts` file.
Raytracing breaks down the scene into pixels and shoots rays from the camera, calculating the color for each ray based on the intersections with the objects in the scene. The process involves calculating reflections, shadows, and diffuse/specular lighting components using the Phong illumination model.

## Libs & Helpers
The project uses the following libraries and helper functions:

* Three.js for WebGL rendering. Also used to draw our geometry
* dat.GUI for controlling settings and adjustments.
* Utility functions for canvas drawing and color manipulation in `./lib/utils.ts`

### Helper files
- `helper.ts`: Set up geometry, lights, camera, controls, etc.