import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [headingTop, setHeadingTop] = useState(false);
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [floors, setFloors] = useState("");
  const [lengthUnit, setLengthUnit] = useState("m");
  const [widthUnit, setWidthUnit] = useState("m");

  useEffect(() => {
    const timer = setTimeout(() => setHeadingTop(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    navigate("/floorData", {
      state: { length, width, floors, lengthUnit, widthUnit },
    });
  };

  // Button ko disable karne ke liye condition
  const isNextDisabled = !length || !width || !floors;

  return (
    <div className="home-container">
      <h1 className={`home-heading ${headingTop ? "top" : ""}`}>
        Design Your Home
      </h1>

      <div className="input-section">
        <div className="input-row">
          <input
            type="number"
            placeholder="House Length"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          />
          <select
            value={lengthUnit}
            onChange={(e) => setLengthUnit(e.target.value)}
          >
            <option value="m">m</option>
            <option value="ft">ft</option>
          </select>
        </div>

        <div className="input-row">
          <input
            type="number"
            placeholder="House Width"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
          <select
            value={widthUnit}
            onChange={(e) => setWidthUnit(e.target.value)}
          >
            <option value="m">m</option>
            <option value="ft">ft</option>
          </select>
        </div>

        <input
          type="number"
          placeholder="Number of Floors"
          value={floors}
          onChange={(e) => setFloors(e.target.value)}
        />

        <button
          onClick={handleNext}
          className="next-btn"
          disabled={isNextDisabled}
          style={{ opacity: isNextDisabled ? 0.5 : 1, cursor: isNextDisabled ? "not-allowed" : "pointer" }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default HomePage;
  