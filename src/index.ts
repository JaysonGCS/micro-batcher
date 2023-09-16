type AsyncFunction<A, O> = (...args: A[] | never) => Promise<O>;

export function MicroBatcher<O, A>(func: AsyncFunction<A, O>) {
  class MicroBatcher {
    private fun: AsyncFunction<A, O>;
    private static batchFun: AsyncFunction<A[], O[]> | undefined = undefined;
    private static batchCounter: number = 0;
    private static payloadPositionCounter: number = 0;
    private static payloadQueue: A[][] = [];
    // Default is 50ms
    private static threshold = 50;
    private static hasBatchStarted = false;
    private static batcherResult: (O | undefined)[][] = [];
    private static batchReadyStatus: boolean[] = [];

    constructor(func: AsyncFunction<A, O>) {
      this.fun = func;
    }

    private static batchProcess = async (
      batchId: number,
      singleFunc: AsyncFunction<A, O>
    ) => {
      let inFlightResult;
      if (MicroBatcher.payloadQueue[batchId].length === 1) {
        inFlightResult = Promise.all([
          singleFunc(MicroBatcher.payloadQueue[batchId][0]),
        ]);
      } else {
        inFlightResult = MicroBatcher.batchFun!(
          MicroBatcher.payloadQueue[batchId]
        );
      }
      return await inFlightResult;
    };

    private intercept = (func: AsyncFunction<A, O>) => {
      return new Proxy(func, {
        apply: function (target, _, argumentsList) {
          // TODO: take note this id may keep growing, batcherResult array may keep growing. we might need some sort of circular buffer
          const batchId = MicroBatcher.batchCounter;
          const payloadId = MicroBatcher.payloadPositionCounter;
          let totalPayloadForThisBatch = 0;
          console.debug(`batch: ${batchId} id: ${payloadId}`, argumentsList);
          if (MicroBatcher.batchFun !== undefined && argumentsList.length > 0) {
            // Bump the counter for payload position so that next access would use a new payload position id
            MicroBatcher.payloadPositionCounter += 1;
            if (MicroBatcher.payloadQueue[batchId] === undefined) {
              MicroBatcher.payloadQueue[batchId] = [];
            }
            MicroBatcher.payloadQueue[batchId].push(
              argumentsList.length === 1
                ? argumentsList[0]
                : { ...argumentsList }
            );

            if (!MicroBatcher.hasBatchStarted) {
              MicroBatcher.hasBatchStarted = true;
              MicroBatcher.batchReadyStatus[batchId] = false;
              setTimeout(() => {
                console.debug("BATCH START");
                // Bump batchCounter so that if there is incoming payload while the current batch is still running,
                // they may kick start without waiting for current batch to finish
                MicroBatcher.batchCounter += 1;
                MicroBatcher.batchProcess(batchId, target)
                  .then((result) => {
                    MicroBatcher.batcherResult[batchId] = result;
                  })
                  .finally(() => {
                    // Keep track of the payload count for this batch, will be used to determine if the current batch is done extracting
                    totalPayloadForThisBatch =
                      MicroBatcher.payloadQueue[batchId].length;
                    // Clear the payload queue once the current batch has finished fetching. This is to allow next batch to continue asynchronously
                    MicroBatcher.payloadQueue[batchId] = [];
                    // Reset current counter for next batch to start from 0 again
                    MicroBatcher.payloadPositionCounter = 0;
                  });
                // Setting this to false to allow next batch to kick start without waiting for current batch to finish
                MicroBatcher.hasBatchStarted = false;
              }, MicroBatcher.threshold);
            }
            let extractionCounter = 0;
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(MicroBatcher.batcherResult[batchId][payloadId]);
                // Every "resolve" will be considered a successful "extraction"
                extractionCounter += 1;
                // After extraction, set the result of this slot to "undefined"
                MicroBatcher.batcherResult[batchId][payloadId] = undefined;
                // If extractionCounter is the same as the total payload, set the status of this slot "true" to signal completion
                MicroBatcher.batchReadyStatus[batchId] =
                  extractionCounter === totalPayloadForThisBatch;
              }, MicroBatcher.threshold);
            });
          } else {
            return target(...argumentsList);
          }
        },
      });
    };

    batchThreshold(threshold: number) {
      MicroBatcher.threshold = threshold;
      return this;
    }

    batchFunction(batch: AsyncFunction<A[], O[]>) {
      MicroBatcher.batchFun = batch;
      return this;
    }

    build(): AsyncFunction<A, O> {
      return this.intercept(this.fun);
    }
  }

  return new MicroBatcher(func);
}
