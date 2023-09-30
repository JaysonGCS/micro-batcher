import { useEffect, useState } from "react";
import { Response } from "../apis";

interface Props {
  value: number;
  shouldFail: boolean;
  calculationApi: (value: number) => Promise<Response>;
}

const Tick = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100"
      height="100"
      viewBox="0 0 48 48"
    >
      <path
        fill="#c8e6c9"
        d="M36,42H12c-3.314,0-6-2.686-6-6V12c0-3.314,2.686-6,6-6h24c3.314,0,6,2.686,6,6v24C42,39.314,39.314,42,36,42z"
      ></path>
      <path
        fill="#4caf50"
        d="M34.585 14.586L21.014 28.172 15.413 22.584 12.587 25.416 21.019 33.828 37.415 17.414z"
      ></path>
    </svg>
  );
};

const Cross = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100"
      height="100"
      viewBox="0 0 48 48"
    >
      <path
        fill="#F44336"
        d="M21.5 4.5H26.501V43.5H21.5z"
        transform="rotate(45.001 24 24)"
      ></path>
      <path
        fill="#F44336"
        d="M21.5 4.5H26.5V43.501H21.5z"
        transform="rotate(135.008 24 24)"
      ></path>
    </svg>
  );
};

export const Box = (props: Props) => {
  const { value, calculationApi } = props;
  const [result, setResult] = useState<Response>({
    color: "",
    value: -1,
  });
  useEffect(() => {
    calculationApi(value).then((result) => {
      setResult(result);
    });
    return () => {
      setResult({
        color: "",
        value: -1,
      });
    };
  }, [calculationApi, value]);

  const isCorrect: boolean = value * 2 === result.value;
  return (
    <div
      style={{
        backgroundColor: result.color,
        display: "flex",
        justifyContent: "center",
        width: "200px",
        border: "black solid 1px",
      }}
    >
      <div>
        <p>Original: {value}</p>
        <p>Result: {result.value}</p>
      </div>
      <div> {isCorrect ? <Tick /> : <Cross />}</div>
    </div>
  );
};
