import { Queue } from './queue';

export class PromiseLock<O> {
  private promise: Promise<O>;
  private resolve: ((result: O) => void) | undefined;
  private reject: ((result: O) => void) | undefined;

  constructor() {
    this.promise = new Promise<O>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  awaitResult = () => {
    return this.promise;
  };

  release = (result: O) => {
    this.resolve && this.resolve(result);
  };

  releaseWithError = (e: any) => {
    this.reject && this.reject(e);
  };
}

export interface PromiseLocker<P, O> {
  payload: P;
  promiseLock: PromiseLock<O>;
}

export function PayloadManager<P extends any[], O>() {
  class PayloadManager {
    payloadQueue: Queue<PromiseLocker<P, O>> = new Queue<PromiseLocker<P, O>>();

    submitPayload = (payload: P): (() => Promise<O>) => {
      const promiseLock = new PromiseLock<O>();
      this.payloadQueue.enqueue({ payload, promiseLock });
      return promiseLock.awaitResult;
    };

    getCurrentSize = (): number => {
      return this.payloadQueue.size();
    };

    consumePayloadList = (payloadLimit?: number): PromiseLocker<P, O>[] => {
      let counter = 0;
      const payloadList: PromiseLocker<P, O>[] = [];
      // Process all payload if limit is not specified
      const finalPayloadLimit = payloadLimit ?? this.payloadQueue.size();
      while (finalPayloadLimit > counter) {
        payloadList.push(this.payloadQueue.dequeue());
        counter++;
      }
      return payloadList;
    };
  }
  return new PayloadManager();
}
