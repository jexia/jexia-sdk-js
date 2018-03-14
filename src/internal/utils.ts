
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
