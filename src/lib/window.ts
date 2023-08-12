export interface Window extends HTMLDivElement{
  setLayout(layout:string[][]): void;
  setLayoutRows(row:string[]): void;
  setLayoutColumns(col:string[]): void;
}

function wrapElement(elem: Window, id: string){
  elem.id = id;
  elem.style.gridArea = id;
  elem.classList.add("window");
  elem.style.position = "relative";
  elem.style.display = "flex";
  elem.style.flexDirection = "column";

  elem.setLayout = function(layout:string[][]){
    elem.style.display = "grid";
    this.style.gridTemplateAreas = "\""+layout.map((elem) => elem.join(" ")).join("\" \"")+"\"";
  }
  elem.setLayoutRows = function(row:string[]){
    this.style.gridTemplateRows = row.join(" ");
  }
  elem.setLayoutColumns = function(col:string[]){
    this.style.gridTemplateColumns = col.join(" ");
  }
  return elem;
}

export function createWindow(id: string): Window{
  let elem = document.createElement("div") as Window;
  return wrapElement(elem, id);
}

const App = wrapElement(document.body as Window, "app");

export function Application(name: string){
  document.title = name;
  return App;
}
