

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FloorInput.css";

const FloorInput = () => {
  const [floors, setFloors] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    if (!floors || floors <= 0) {
      alert("Please enter a valid number of floors!");
      return;
    }

    // ✅ Send floors value to FloorData page
    navigate("/floordata", { state: { floors: Number(floors) } });
  };

  return (
    <div className="floor-input-container">
      <h1>Enter Number of Floors</h1>
      <input
        type="number"
        placeholder="Number of floors"
        value={floors}
        onChange={(e) => setFloors(e.target.value)}
      />
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

export default FloorInput;
