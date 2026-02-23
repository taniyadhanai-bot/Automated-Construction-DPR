import React, { useState } from "react";
import "./BrickCementCalculator.css";

const BrickCementCalculator = () => {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [thickness, setThickness] = useState(0.75); // 9 inch default
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!length || !width || !height) {
      alert("Please enter all dimensions");
      return;
    }

    // Convert ft to meters (1 ft = 0.3048 m)
    const lengthM = length * 0.3048;
    const widthM = width * 0.3048;
    const heightM = height * 0.3048;
    const thicknessM = thickness * 0.3048;

    // Perimeter in meters
    const perimeterM = 2 * (lengthM + widthM);

    // Wall volume in m³
    const wallVolume = perimeterM * heightM * thicknessM;

    // Bricks calculation (approx 825 bricks per m³)
    const bricks = Math.round(wallVolume * 825);

    // Cement bags (~8 bags per m³) 
    const cementBags = Math.round(wallVolume * 8);  //7.5 to 8

    // Sand (~0.3 m³ per m³ wall)
    const sand = (wallVolume * 0.42).toFixed(2);   //0.3 to 0.42

    // Cost estimate
    const brickCost = bricks * 10; // ₹9 per brick avg  (9 to 10)
    const cementCost = cementBags * 400;     // (350 to 400)
    const sandCost = sand * 2000;

    const totalCost = brickCost + cementCost + sandCost;

    setResults({
      wallVolume: wallVolume.toFixed(2),
      bricks,
      cementBags,
      sand,
      totalCost,
    });
  };

  return (
    <div className="calculator-container">
      <h1>Brick & Cement Calculator</h1>
      <div className="input-section">
        <input
          type="number"
          placeholder="Room Length (ft)"
          value={length}
          onChange={(e) => setLength(e.target.value)}
        />
        <input
          type="number"
          placeholder="Room Width (ft)"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
        />
        <input
          type="number"
          placeholder="Room Height (ft)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
        <select
          value={thickness}
          onChange={(e) => setThickness(parseFloat(e.target.value))}
        >
          <option value={0.33}>4 inch wall</option>
          <option value={0.5}>6 inch wall</option>
          <option value={0.75}>9 inch wall</option>
        </select>

        <button onClick={handleCalculate}>Calculate</button>
      </div>

      {results && (
        <div className="results-section">
          <h2>Results</h2>
          <p>Wall Volume: {results.wallVolume} m³</p>
          <p>Bricks Required: {results.bricks}</p>
          <p>Cement Bags: {results.cementBags}</p>
          <p>Sand Required: {results.sand} m³</p>
          <p>Total Approx Cost: ₹{results.totalCost}</p>
        </div>
      )}
    </div>
  );
};

export default BrickCementCalculator;
