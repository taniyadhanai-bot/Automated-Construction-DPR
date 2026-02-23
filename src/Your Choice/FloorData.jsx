import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FloorData.css";

const FloorData = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const floors = location.state?.floors || 1;

  const [floorData, setFloorData] = useState([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const initialData = Array.from({ length: floors }, (_, i) => ({
      floorNumber: i + 1,
      rooms: [{ length: "", width: "" }],
    }));
    setFloorData(initialData);
  }, [floors]);

  // ✅ Validation: check if all rooms have length & width
  useEffect(() => {
    const valid = floorData.every(floor =>
      floor.rooms.length > 0 && floor.rooms.every(room => room.length && room.width)
    );
    setIsValid(valid);
  }, [floorData]);

  const handleRoomChange = (floorIndex, roomIndex, field, value) => {
    const updated = [...floorData];
    updated[floorIndex].rooms[roomIndex][field] = value;
    setFloorData(updated);
  };

  const addRoom = (floorIndex) => {
    const updated = [...floorData];
    updated[floorIndex].rooms.push({ length: "", width: "" });
    setFloorData(updated);
  };

  const handleCalculate = () => {
    const result = {};
    floorData.forEach((floor) => {
      const floorKey = `Floor${floor.floorNumber}`;
      result[floorKey] = {};
      floor.rooms.forEach((room, idx) => {
        result[floorKey][`Room${idx + 1}`] = {
          length: room.length,
          width: room.width,
        };
      });
    });

    console.log("📏 Floor & Room Data:", result);
    navigate("/calculate", { state: { result } });
  };

  if (floorData.length === 0) return <h2>Loading floors...</h2>;

  return (
    <div className="floor-container">
      <h1>Floor & Room Data</h1>

      {floorData.map((floor, floorIndex) => (
        <div className="floor-section" key={floorIndex}>
          <h2>Floor {floor.floorNumber}</h2>
          {floor.rooms.map((room, roomIndex) => (
            <div className="room-row" key={roomIndex}>
              <label>Room {roomIndex + 1}:</label>
              <input
                type="number"
                placeholder="Length"
                value={room.length}
                onChange={(e) =>
                  handleRoomChange(floorIndex, roomIndex, "length", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Width"
                value={room.width}
                onChange={(e) =>
                  handleRoomChange(floorIndex, roomIndex, "width", e.target.value)
                }
              />
            </div>
          ))}
          <button className="add-room-btn" onClick={() => addRoom(floorIndex)}>
            + Add Room
          </button>
        </div>
      ))}

      <button
        className="calculate-btn"
        onClick={handleCalculate}
        disabled={!isValid} // ✅ disable until valid
        style={{ opacity: isValid ? 1 : 0.5, cursor: isValid ? "pointer" : "not-allowed" }}
      >
        Calculate
      </button>
    </div>
  );
};

export default FloorData;
