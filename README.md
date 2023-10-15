# Micro Batcher

Micro-batcher is a lightweight, zero-dependency and experimental interval-based micro batching library for TypeScript/JavaScript.

## Documentation

### When to use it?

If there is a burst usage of multiple callers accessing same function with different payload, and we would like to intercept these calls and delegate the payloads to another function for batch processing.

### MicroBatcher in a nutshell

![micro batcher demo](./gif/demo.gif)

Essentially, MicroBatcher is a utility that accepts two functions - the original function and the batch resolver function - and produces a new function with the exact same function signature as the original function.

The produced function serves as a seamless replacement for all original single payload function usages. When the produced function experiences bursts of usage, it intercepts, accumulates, and subsequently processes payloads from the callers within the batching interval using the provided batch resolver function.

Once the batch function has been resolved, the results are then distributed back to the individual callers. From the caller's perspective, they only need to be concerned with fetching their own data.

### API examples

#### Example 1: single parameter function

```typescript
// Single resolver function
const multiplyByTwo = (input: number): Promise<number> => {...};

// Batch resolver function for "multiplyByTwo", which accepts an array of multiplyByTwo's parameter
const batchMultiplyByTwo = (inputs: number[][]): Promise<number[]> => {...};

const multiplyByTwoBatcher:(input: number): Promise<number> = MicroBatcher<number, number>(multiplyByTwo)
  .batchResolver(batchMultiplyByTwo)
  .build();
```

#### Example 2: multiple parameters function

```typescript
// Single resolver function
const multiply = (input1: number, input2:number): Promise<number> => {...}

// Batch resolver function for "multiplyByTwo", which accepts an array of multiplyByTwo's parameter
const batchMultiply = (inputs: [number,number][]): Promise<number[]> => {...};

const multiplyBatcher:(input1: number, input2:number): Promise<number> = MicroBatcher<[number,number], number>(multiply)
  .batchResolver(batchMultiply)
  .build();
```

#### Example 3: override default batching interval

The default batching interval is 50ms, which can be overriden with `batchingIntervalInMs` in the batch options.

```typescript
const multiplyBatcher:(input1: number, input2:number): Promise<number> = MicroBatcher<[number,number], number>(multiply)
  .batchResolver(batchMultiply, {
    batchingIntervalInMs: 100
  })
  .build();
```

#### Example 4: specify payload window size limit

By default, MicroBatcher will accumulate all the caller's payload based on bathching interval. However, there is an optional batch option `payloadWindowSizeLimit`, which can specify the upper limit of the accumulation size. Upon reaching the limit, the payloads will be delegated to the batch resolver immediately.

```typescript
const multiplyBatcher:(input1: number, input2:number): Promise<number> = MicroBatcher<[number,number], number>(multiply)
  .batchResolver(batchMultiply, {
    payloadWindowSizeLimit: 5
  })
  .build();
```

## Installation

```shell
npm install @jaysongcs/micro-batcher
yarn add @jaysongcs/micro-batcher
pnpm add @jaysongcs/micro-batcher
```

## Roadmap

### Stress Test

- [ ] Experiment on various error scenarios

### Feature

- [ ] API Cancellation
- [ ] Concurrent batcher limit support
- [ ] Rate Limiting and Throttling policies support

## Local Development

### Installation

```shell
pnpm install
```

### Build

```shell
pnpm run build
```

### Test

```shell
# Run test with coverage report
pnpm run test
# Watch mode
pnpm run test:dev
```

## License

Micro-batcher is [MIT licensed](./LICENSE)
