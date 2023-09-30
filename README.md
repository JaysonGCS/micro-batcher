# Micro Batcher

Micro-batcher is a lightweight, zero-dependency and experimental interval-based micro batching library for TypeScript/JavaScript.

## Documentation

### How to use MicroBatcher?

Essentially, by providing a single and batch resolver function to the MicroBatcher builder, it produces a function that has the same function signature as the provided single resolver function.

The produced function is a drop-in replacement for all the existing single resolver function usage. Upon burst usages on this function, the payload from all the callers within the batching interval will be intercepted, accumulated and eventually processed by the provided batch resolver function.

After the batch function has been resolved, the results will then be distributed back to the individual caller.

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
