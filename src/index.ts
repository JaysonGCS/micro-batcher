import { PayloadManager, PromiseLocker } from './payloadManager';

export type AsyncFunction<A, O> = A extends void
  ? never
  : A extends any[]
    ? (...args: A) => Promise<O>
    : (arg: A) => Promise<O>;

export type PayloadParam<A> = A extends any[] ? A : [A];

/**
 * Previous Implementation:
 * type AsyncBatchFunction<T extends any[], O> = (arg: T[]) => Promise<O>;
 */
export type AsyncBatchFunction<T, O> = (arg: PayloadParam<T>[]) => Promise<O[]>;

export const DEFAULT_BATCH_WINDOW_MS = 50;

export interface BatchOptions {
  /**
   * Optional. Default is 50ms, override to set the interval for batching the payload.
   */
  batchingIntervalInMs?: number;
  /**
   * Optional. If set with a valid size, once the current payload queue reaches the limit before the interval ends, kick start the batcher immediately.
   */
  payloadWindowSizeLimit?: number;
  /**
   * Optional. Default is false, determine if should go through batch resolver function even for single payload.
   */
  shouldUseBatchResolverForSinglePayload?: boolean;
}

const DEFAULT_BATCH_OPTIONS: BatchOptions = {};

export function MicroBatcher<A, O>(func: AsyncFunction<A, O>) {
  class MicroBatcher {
    private static _singlePayloadFunction: AsyncFunction<A, O>;
    private static _batchResolver: AsyncBatchFunction<A, O> | undefined;
    // The timeout id of the current batcher, can be used for short circuit to start the batcher before the interval if needed (e.g. payloadWindowSizeLimit)
    private static _currentBatchTimeoutId: NodeJS.Timeout | undefined;
    private static _payloadManager = PayloadManager<PayloadParam<A>, O>();

    private static _activeBatchCount: number = 0;

    private static batchingIntervalInMs = 0;
    private static payloadWindowSizeLimit: number | undefined = undefined;
    private static shouldUseBatchResolverForSinglePayload: boolean = false;

    constructor(singlePayloadFunction: AsyncFunction<A, O>) {
      MicroBatcher._singlePayloadFunction = singlePayloadFunction;
    }

    private static processPayload(payloadLockerList: PromiseLocker<PayloadParam<A>, O>[]) {
      const payloadList: PayloadParam<A>[] = payloadLockerList.map((pl) => {
        return pl.payload;
      });

      const shouldUseBatchResolver =
        payloadList.length > 1 ||
        (MicroBatcher.shouldUseBatchResolverForSinglePayload && payloadList.length === 1);
      if (MicroBatcher._batchResolver && shouldUseBatchResolver) {
        MicroBatcher._activeBatchCount++;
        MicroBatcher._batchResolver(payloadList)
          .then((results) => {
            if (results.length !== payloadList.length) {
              throw Error(
                `Batch function has different number of results (${results.length}) as payload (${payloadList.length})`
              );
            }
            results.forEach((result, index) => {
              const {
                promiseLock: { release }
              } = payloadLockerList[index];
              release(result);
            });
          })
          .finally(() => {
            MicroBatcher._activeBatchCount--;
          });
      } else {
        payloadList.forEach((payload: PayloadParam<A>, index) => {
          const {
            promiseLock: { release, releaseWithError }
          } = payloadLockerList[index];
          MicroBatcher._activeBatchCount++;

          // TODO: Try to make type better without ts-ignore
          // @ts-ignore
          MicroBatcher._singlePayloadFunction(...payload)
            .then((result) => {
              release(result);
            })
            .catch((e) => {
              releaseWithError(e);
            })
            .finally(() => {
              MicroBatcher._activeBatchCount--;
            });
        });
      }
    }

    intercept = (func: AsyncFunction<A, O>) => {
      const runBatcher = (processCount?: number) => {
        MicroBatcher._currentBatchTimeoutId = undefined;
        // TODO: add concurrent batcher limit support
        const payloadForBatchProcessing: PromiseLocker<PayloadParam<A>, O>[] =
          MicroBatcher._payloadManager.consumePayloadList(processCount);
        MicroBatcher.processPayload(payloadForBatchProcessing);
      };

      const startBatcherEarlierIfEligible = () => {
        const currentPayloadSize: number = MicroBatcher._payloadManager.getCurrentSize();
        if (
          MicroBatcher.payloadWindowSizeLimit !== undefined &&
          MicroBatcher.payloadWindowSizeLimit <= currentPayloadSize
        ) {
          clearTimeout(MicroBatcher._currentBatchTimeoutId);
          runBatcher(MicroBatcher.payloadWindowSizeLimit);
        }
      };

      return new Proxy(func, {
        apply: async (_target, _, argumentsList: PayloadParam<A>) => {
          const result: () => Promise<O> =
            MicroBatcher._payloadManager.submitPayload(argumentsList);

          if (MicroBatcher._currentBatchTimeoutId === undefined) {
            const timeoutId = setTimeout(() => {
              runBatcher();
            }, MicroBatcher.batchingIntervalInMs);
            MicroBatcher._currentBatchTimeoutId = timeoutId;
          }

          startBatcherEarlierIfEligible();

          return result().catch((e) => {
            throw Error(e);
          });
        }
      });
    };

    /**
     *
     * @param batch  - Optional. The batch resolver/function to process the accumulated payload array.
     * @param batchOptions - Optional. Options to configure batching behaviour.
     * @returns
     * - The returned array length and the payload array length are required to be the same.
     * - Each element's position in the result array will be mapped back to the corresponding payload element's position.
     */
    batchResolver = (
      batch: AsyncBatchFunction<A, O>,
      batchOptions: BatchOptions = DEFAULT_BATCH_OPTIONS
    ) => {
      MicroBatcher._batchResolver = batch;
      const {
        payloadWindowSizeLimit,
        batchingIntervalInMs = DEFAULT_BATCH_WINDOW_MS,
        shouldUseBatchResolverForSinglePayload = false
      } = batchOptions;
      MicroBatcher.payloadWindowSizeLimit = payloadWindowSizeLimit;
      MicroBatcher.batchingIntervalInMs = batchingIntervalInMs;
      MicroBatcher.shouldUseBatchResolverForSinglePayload = shouldUseBatchResolverForSinglePayload;

      return this;
    };

    build(): AsyncFunction<A, O> {
      return this.intercept(MicroBatcher._singlePayloadFunction);
    }
  }

  return new MicroBatcher(func);
}
