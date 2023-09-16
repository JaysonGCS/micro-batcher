import { MicroBatcher } from ".";

it("should use single function - 1", async () => {
  let hasFuncBeenCalled = false;
  let batchFuncCalledTimes = 0;

  const func = async (fake: number): Promise<number> => {
    hasFuncBeenCalled = true;
    return await Promise.resolve(10);
  };
  const batchingFunction = async (payload: number[]) => {
    batchFuncCalledTimes += 1;
    if (payload.length === 1) {
      return await Promise.all([Promise.resolve(1)]);
    } else {
      return await Promise.all([Promise.resolve(2), Promise.resolve(2)]);
    }
  };
  const wrapped1 = MicroBatcher<number, number>(func)
    .batchFunction(batchingFunction)
    .batchThreshold(200)
    .build();
  const result1 = wrapped1(1);

  expect(await result1).toBe(10);

  expect(hasFuncBeenCalled).toBe(true);
  expect(batchFuncCalledTimes).toBe(0);
});

it("should use single function - 2", async () => {
  let hasFuncBeenCalled = false;
  let batchFuncCalledTimes = 0;

  const func = async (fake: number): Promise<number> => {
    hasFuncBeenCalled = true;
    return await Promise.resolve(10);
  };
  const batchingFunction = async (payload: number[]) => {
    batchFuncCalledTimes += 1;
    if (payload.length === 1) {
      return await Promise.all([Promise.resolve(1)]);
    } else {
      return await Promise.all([Promise.resolve(2), Promise.resolve(2)]);
    }
  };
  const wrapped1 = MicroBatcher<number, number>(func)
    .batchFunction(batchingFunction)
    .batchThreshold(200)
    .build();
  const result1 = wrapped1(1);

  const result2 = await new Promise((resolve) => {
    setTimeout(async () => {
      const result2 = await wrapped1(2);
      resolve(result2);
    }, 500);
  });

  expect(await result1).toBe(10);
  expect(await result2).toBe(10);

  expect(hasFuncBeenCalled).toBe(true);
  expect(batchFuncCalledTimes).toBe(0);
});

it("should use batch function - 1", async () => {
  let hasFuncBeenCalled = false;
  let batchFuncCalledTimes = 0;

  const func = async (fake: number): Promise<number> => {
    hasFuncBeenCalled = true;
    return await Promise.resolve(10);
  };
  const batchingFunction = async (payload: number[]) => {
    batchFuncCalledTimes += 1;
    if (payload.length === 1) {
      return await Promise.all([Promise.resolve(1)]);
    } else {
      return await Promise.all([Promise.resolve(2), Promise.resolve(2)]);
    }
  };
  const wrapped1 = MicroBatcher<number, number>(func)
    .batchFunction(batchingFunction)
    .batchThreshold(200)
    .build();
  const result1 = wrapped1(1);
  const result2 = wrapped1(2);

  expect(await result1).toBe(2);
  expect(await result2).toBe(2);

  expect(hasFuncBeenCalled).toBe(false);
  expect(batchFuncCalledTimes).toBe(1);
});

it("should use batch function - 2", async () => {
  let hasFuncBeenCalled = false;
  let batchFuncCalledTimes = 0;

  const func = async (fake: number): Promise<number> => {
    hasFuncBeenCalled = true;
    return await Promise.resolve(10);
  };
  const batchingFunction = async (payload: number[]) => {
    batchFuncCalledTimes += 1;
    if (payload.length === 1) {
      return await Promise.all([Promise.resolve(1)]);
    } else {
      return await Promise.all([Promise.resolve(2), Promise.resolve(2)]);
    }
  };
  const wrapped1 = MicroBatcher<number, number>(func)
    .batchFunction(batchingFunction)
    .batchThreshold(200)
    .build();
  const result1 = wrapped1(1);

  const result2 = await new Promise((resolve) => {
    setTimeout(async () => {
      const result2 = await wrapped1(2);
      resolve(result2);
    }, 100);
  });

  expect(await result1).toBe(2);
  expect(await result2).toBe(2);

  expect(hasFuncBeenCalled).toBe(false);
  expect(batchFuncCalledTimes).toBe(1);
});
