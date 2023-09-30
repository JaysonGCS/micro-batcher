import { useMemo, useState } from "react";
import "./App.css";
import { Box } from "./components/Box";
import { getCalculationApi } from "./apis";

function App() {
  const [payloadWindowSizeLimit, setPayloadWindowSizeLimit] = useState(5);

  const calculationApi = useMemo(
    () => getCalculationApi({ payloadWindowSizeLimit: payloadWindowSizeLimit }),
    [payloadWindowSizeLimit]
  );

  const boxes = useMemo(() => {
    const boxes = [];
    for (let index = 1; index < 10; index++) {
      boxes.push(
        <Box
          key={index}
          value={index}
          shouldFail={false}
          calculationApi={calculationApi}
        />
      );
    }
    return <div style={{ display: "flex" }}>{boxes}</div>;
  }, [calculationApi]);

  return (
    <>
      <h1>MicroBatcher Test Tool</h1>
      <div className="card" style={{ display: "flex", gap: "10px" }}>
        <p>payloadWindowSizeLimit: {payloadWindowSizeLimit}</p>
        <button
          onClick={() =>
            setPayloadWindowSizeLimit((count) => {
              return count === 1 ? count : count - 1;
            })
          }
        >
          payloadWindowSizeLimit - 1
        </button>
        <button onClick={() => setPayloadWindowSizeLimit((count) => count + 1)}>
          payloadWindowSizeLimit + 1
        </button>
      </div>
      {boxes}
    </>
  );
}

export default App;
