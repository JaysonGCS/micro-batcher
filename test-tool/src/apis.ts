import axios from "axios";
import { BatchOptions, MicroBatcher } from "@jaysongcs/micro-batcher";

const instance = axios.create({ baseURL: "http://localhost:3000" });

export interface Response {
  color: string;
  value: number;
}

export const calculateApi = async (value: number): Promise<Response> => {
  return instance.get("/calculate", { params: { value } }).then((resp) => {
    return resp.data;
  });
};

export const batchCalculateApi = async (
  valueInCsv: string
): Promise<Response[]> => {
  return instance
    .get("/batch-calculate", { params: { value: valueInCsv } })
    .then((resp) => {
      return resp.data;
    });
};

export const getCalculationApi = (batchOptions: BatchOptions) => {
  return MicroBatcher<number, Response>(calculateApi)
    .batchResolver(async (payloadList: number[][]) => {
      console.log(payloadList);
      return await batchCalculateApi(payloadList.join(","));
    }, batchOptions)
    .build();
};
