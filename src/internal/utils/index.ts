export type DeferType<T = any> = {
  promise: Promise<T>,
  resolve(value?: T): void,
  reject(err: any): void,
};

export function deferPromise<T = any>(): DeferType<T> {
  let resolve;
  let reject;
  return {
    promise: new Promise<T>((internalResolve, internalReject) => {
      resolve = internalResolve;
      reject = internalReject;
    }),
    resolve,
    reject,
  } as any;
}

/**
 * Clones an object keeping its instance
 *
 * @param  obj The object to be cloned
 * @returns T
 */
export function clone<T>(o: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(o)), o);
}

export * from "./relations";
