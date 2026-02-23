import React, { useState, useEffect } from "react";
import "./Step1Plot.css";

export default function Step1Plot({ plotData, setPlotData, nextStep }) {
  const [length, setLength] = useState(plotData.length || "");
  const [width, setWidth] = useState(plotData.width || "");
  const [floors, setFloors] = useState(plotData.floors || "");

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Button enable only if all inputs have values
    if (length && width && floors) setIsValid(true);
    else setIsValid(false);
  }, [length, width, floors]);

  const handleNext = () => {
    setPlotData({ length, width, floors });
    nextStep();
  };

  return (
    <div className="step1-container">
      <h2>Step 1: Enter Plot Details</h2>
      <div className="step1-grid">
        <div>
          <label>Length (ft)</label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="Enter length"
          />
        </div>
        <div>
          <label>Width (ft)</label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="Enter width"
          />
        </div>
        <div>
          <label>Floors</label>
          <input
            type="number"
            value={floors}
            onChange={(e) => setFloors(e.target.value)}
            placeholder="Enter number of floors"
          />
        </div>
      </div>
      <button onClick={handleNext} disabled={!isValid}>
        Next
      </button>
    </div>
  );
}

