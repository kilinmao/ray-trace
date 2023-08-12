
export function degToRad(deg: number){
  return deg * (Math.PI/180.0);
}

export function radToDeg(rad: number){
  return rad * (180.0/Math.PI);
}

export class Callbackable {
  _handler: Function[] = []
  constructor() {
    let watcher = {
      set: function <T extends keyof Callbackable>(obj: Callbackable, prop: T, value: Callbackable[T]) {
        obj[prop] = value;
        if (obj._handler != undefined) {
          // obj.handler.forEach((handler, idx) => handler.call(obj.parent[idx], prop, value));
          obj._handler.forEach((handler) => handler({ key: prop, value: value }));
        }
        return true;
      }
    }
    return new Proxy(this, watcher)
  }
  addCallback(handler: (KeyValuePair: KeyValuePair<Callbackable>) => void) {
    this._handler.push(handler);
  }
}

export type KeyValuePair<T> = { [N in keyof T]: { key: N, value: T[N] } }[keyof T]

/**
 * Some Typescript enum "exploit" to get the names of all enum options.
 * @param myEnum  Name of an enum
 */
export function enumOptions<T>(myEnum: T): Array<string> {
  let res: string[] = [];
  Object.keys(myEnum).forEach(k => {
    if (typeof (myEnum as any)[k]  === 'string')
     if ((myEnum as any)[(myEnum as any)[k]])
       res.push(k);
     else
      res.push((myEnum as any)[k]);
  });
  return res
}

/**
 * Some Typescript enum "exploit" to get the keys of all enum options.
 * @param myEnum  Name of an enum
 */
export function enumKeys<T>(myEnum: T): Array<string> {
  let res: string[] = [];
  Object.keys(myEnum).forEach(k => {
    if (typeof (myEnum as any)[k]  === 'string')
     if ((myEnum as any)[(myEnum as any)[k]])
       res.push((myEnum as any)[k]);
     else
       res.push(k);
  });
  return res
}



export function objectFlip<T>(myEnum: T): {[key: string]: string } {
  return Object.keys(myEnum).reduce((ret, key) => {
    (ret as any)[String((myEnum as any)[key])] = key;
    return ret;
  }, {});
}
