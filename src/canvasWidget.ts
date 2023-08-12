import type * as THREE from 'three';

export class ImageData extends globalThis.ImageData{
  setPixel(x: number, y: number, color: THREE.Color, alpha: number = 1) {
      let index = x + y * this.width;
      this.data[index * 4] = color.r * 255;
      this.data[index * 4 + 1] = color.g * 255;
      this.data[index * 4 + 2] = color.b * 255;
      this.data[index * 4 + 3] = alpha * 255;
  }
}

export class CanvasWidget{
  Canvas: HTMLCanvasElement

  constructor(parent: HTMLElement, width: number = 512, height: number = 512){
    parent.style.justifyContent = "center";
    parent.style.alignItems = "center";

    this.Canvas = document.createElement('canvas');
    this.Canvas.style.width = "100%";
    this.Canvas.style.height = "100%";
    this.Canvas.width = width;
    this.Canvas.height = height;
    parent.appendChild(this.Canvas);
  }

  clearCanvas() {
    let context = this.Canvas.getContext("2d");
    if (context != null) {
      context.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
    }
  }

  changeDimensions(width:number, height: number){
    this.Canvas.width = width;
    this.Canvas.height = height;
  }
  savePNG(filename: string = "img.png"){
    this.Canvas.toBlob(function(blob) {
      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob!);
      a.download = filename
      a.click();
    }, "./");
  }
  setImageData(data: ImageData, x: number = 0, y: number = 0){
    let context = this.Canvas.getContext("2d");
    if (context != null){
      context.putImageData(data, x, y);
    }
  }
  setPixel(x: number, y: number, color: THREE.Color, alpha: number = 1) {
    let context = this.Canvas.getContext("2d");
    if (context != null){
      let data = context.createImageData(1,1);
      data.data[0] = color.r * 255;
      data.data[1] = color.g * 255;
      data.data[2] = color.b * 255;
      data.data[3] = alpha * 255;
      context.putImageData(data, x, y);
    }
  }

  
}
