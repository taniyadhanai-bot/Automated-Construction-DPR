
import React, { useState } from "react";
import "./Step2FloorForm.css";

export default function Step2FloorForm({ floors, floorData, setFloorData, prevStep, nextStep }) {
  const [currentFloor, setCurrentFloor] = useState(0);
  const initialRooms = { Bedroom: 2, Hall: 1, Dining: 1, Kitchen: 1, Washroom: 2, Puja: 0 };
  const [rooms, setRooms] = useState(floorData[0] || initialRooms);

  const handleChange = (room, value) => setRooms({ ...rooms, [room]: parseInt(value) || 0 });

  const handleNextFloor = () => {
    const newData = [...floorData];
    newData[currentFloor] = rooms;
    setFloorData(newData);

    if (currentFloor + 1 < floors) {
      setCurrentFloor(currentFloor + 1);
      setRooms(floorData[currentFloor + 1] || initialRooms);
    } else nextStep();
  };

  const handlePrevFloor = () => {
    if (currentFloor > 0) {
      const newData = [...floorData];
      newData[currentFloor] = rooms;
      setFloorData(newData);
      setCurrentFloor(currentFloor - 1);
      setRooms(floorData[currentFloor - 1]);
    } else prevStep();
  };

  return (
    <div className="step2-container">
      <h2>Floor {currentFloor + 1} Room Details</h2>

      <div className="step2-grid">
        {Object.keys(rooms).map((room) => (
          <div key={room}>
            <label>{room}</label>
            <input
              type="number"
              value={rooms[room]}
              onChange={(e) => handleChange(room, e.target.value)}
              placeholder={`Enter ${room} count`}
            />
          </div>
        ))}
      </div>

      <div className="step2-buttons">
        <button className="prev-btn" onClick={handlePrevFloor}>Previous</button>
        <button className="next-btn" onClick={handleNextFloor}>
          {currentFloor + 1 === floors ? "Calculate" : "Next Floor"}
        </button>
      </div>
    </div>
  );
}
