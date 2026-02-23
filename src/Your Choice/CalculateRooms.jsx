
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CalculateRoom.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// 🖨️ Print function
const handlePrint = () => {
  window.print();
};

// 📄 PDF Download function
const downloadPDF = () => {
  const input = document.querySelector(".output-page");
  input.classList.add("print-mode");

  html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Construction_Estimation.pdf");

    input.classList.remove("print-mode");
  });
};

const CalculateRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  const [totalArea, setTotalArea] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [foundationData, setFoundationData] = useState({});
  const [roofCost, setRoofCost] = useState(0);
  const [beamData, setBeamData] = useState({});
  const [materialData, setMaterialData] = useState({});
  const [detailedData, setDetailedData] = useState({});
  const [plumbingData, setPlumbingData] = useState({});

  const DEFAULT_HEIGHT = 9; // ft

  useEffect(() => {
    if (!result || Object.keys(result).length === 0) return;

    // ✅ Variables
    let totalBuildingArea = 0;
    const floorDetails = {};

    const COST_PER_SQFT = 1500;
    const ROOF_COST_PER_SQFT = 250;

    const floorCount = Object.keys(result).length;

    // ✅ Foundation & Beam setup based on floor count
    let foundationType = "";
    let foundationCostPerSqft = 0;
    let beamCountPer1000 = 0;
    let beamCostPerBeam = 0;

    if (floorCount === 1) {
      foundationType = "Shallow Footing";
      foundationCostPerSqft = 350;
      beamCountPer1000 = 7;
      beamCostPerBeam = 15000;
    } else if (floorCount === 2) {
      foundationType = "RCC Isolated Footing";
      foundationCostPerSqft = 500;
      beamCountPer1000 = 9;
      beamCostPerBeam = 20000;
    } else if (floorCount === 3) {
      foundationType = "Raft Foundation";
      foundationCostPerSqft = 700;
      beamCountPer1000 = 11;
      beamCostPerBeam = 25000;
    } else {
      foundationType = "Pile Foundation";
      foundationCostPerSqft = 900;
      beamCountPer1000 = 13;
      beamCostPerBeam = 40000;
    }

    // 🏢 FLOOR-WISE AREA & COST CALCULATION
    Object.entries(result).forEach(([floorName, rooms]) => {
      let floorArea = 0;
      Object.entries(rooms).forEach(([roomName, { length, width }]) => {
        const area = Number(length) * Number(width);
        floorArea += area;
      });

      floorDetails[floorName] = {
        floorArea,
        floorCost: floorArea * COST_PER_SQFT,
        roofCost: floorArea * ROOF_COST_PER_SQFT,
      };

      totalBuildingArea += floorArea; // ✅ sum all floors
    });

    // ✅ Major cost components
    const foundationCost = totalBuildingArea * foundationCostPerSqft;
    const totalRoofCost = Object.values(floorDetails).reduce(
      (sum, f) => sum + f.roofCost,
      0
    );
    const totalBuildingCost = totalBuildingArea * COST_PER_SQFT;

    // ✅ Beam estimation
    const estimatedBeams = Math.round((totalBuildingArea / 1000) * beamCountPer1000);
    const totalBeamCost = estimatedBeams * beamCostPerBeam;

    // ✅ Material cost (based on total building area)
    const materialRates = {
      cement: { usagePer100: 40, costPerUnit: 350, unit: "bag" },
      sand: { usagePer100: 0.5, costPerUnit: 1500, unit: "cum" },
      steel: { usagePer100: 50, costPerUnit: 80, unit: "kg" },
      bricks: { usagePer100: 500, costPerUnit: 7, unit: "pcs" },
      flooring: { usagePer100: 20, costPerUnit: 150, unit: "sq.ft" },
      paint: { usagePer100: 15, costPerUnit: 120, unit: "sq.ft" },
      aggregate: { usagePer100: 1.5, costPerUnit: 2000, unit: "cum" },
    };

    const materials = {};
    Object.entries(materialRates).forEach(([name, info]) => {
      const usage = (totalBuildingArea / 100) * info.usagePer100;
      const cost = usage * info.costPerUnit;
      materials[name] = {
        usage: usage.toFixed(2),
        cost: cost.toFixed(2),
        unit: info.unit,
      };
    });

    const totalMaterialCost = Object.values(materials).reduce(
      (sum, m) => sum + Number(m.cost),
      0
    );

    // ✅ Plumbing estimation
    const PLUMBING_RATE_PER_SQFT = 350;
    const basePlumbingCost = (totalBuildingArea / 1000) * PLUMBING_RATE_PER_SQFT;

    const plumbingPoints = Math.round(totalBuildingArea / 100);
    const pipeCost = plumbingPoints * 500;
    const fixtureCost = plumbingPoints * 1200;
    const tankCost = 5000;
    const labourCost = basePlumbingCost * 0.25;

    const totalPlumbingCost =
      basePlumbingCost + pipeCost + fixtureCost + tankCost + labourCost;

    // ✅ Final total cost
    const total =
      foundationCost +
      totalRoofCost +
      totalBuildingCost +
      totalBeamCost +
      totalMaterialCost +
      totalPlumbingCost;

    // ✅ Update states
    setTotalArea(totalBuildingArea);
    setTotalCost(total);
    setRoofCost(totalRoofCost);
    setDetailedData(floorDetails);
    setFoundationData({ foundationType, foundationCost, foundationCostPerSqft });
    setBeamData({
      estimatedBeams,
      beamCostPerBeam,
      totalBeamCost,
      beamCountPer1000,
    });
    setMaterialData({ materials, totalMaterialCost });
    setPlumbingData({
      basePlumbingCost,
      plumbingPoints,
      pipeCost,
      fixtureCost,
      tankCost,
      labourCost,
      totalPlumbingCost,
    });
  }, [result]);

  // 🧭 if no data
  if (!result || Object.keys(result).length === 0) {
    return (
      <div className="output-page">
        <h2>No data found 😅</h2>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  // ✅ UI Rendering
  return (
    <div className="output-page">
      <h1>🏗️ Construction Cost Estimation</h1>

      {/* Summary */}
      <div className="floor-summary">
        <h2>📊 Total Building Summary</h2>
        <table>
          <tbody>
            <tr>
              <th>Total Area</th>
              <td>{totalArea.toFixed(2)} sq.ft</td>
            </tr>
            <tr>
              <th>Total Estimated Cost</th>
              <td>₹{totalCost.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Floor-wise details */}
      <h2>🏢 Floor-Wise Room Details</h2>
      {Object.entries(detailedData).map(([floor, data]) => (
        <div key={floor} className="floor-summary">
          <h3>{floor}</h3>
          <table>
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Length (ft)</th>
                <th>Width (ft)</th>
                <th>Volume (cu.ft)</th>
                <th>Area (sq.ft)</th>
                <th>Cost (₹)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result[floor]).map(([roomName, room]) => {
                const area = Number(room.length) * Number(room.width);
                const volume = area * DEFAULT_HEIGHT;
                const cost = area * 1500;
                return (
                  <tr key={roomName}>
                    <td>{roomName}</td>
                    <td>{room.length}</td>
                    <td>{room.width}</td>
                    <td>{volume.toFixed(2)}</td>
                    <td>{area.toFixed(2)}</td>
                    <td>{cost.toLocaleString()}</td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={3}><strong>Floor Total</strong></td>
                <td>-</td>
                <td><strong>{data.floorArea.toFixed(2)}</strong></td>
                <td><strong>₹{data.floorCost.toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      {/* Foundation */}
      <h2>🧱 Foundation Details</h2>
      <div className="floor-summary">
        <table>
          <tbody>
            <tr>
              <th>Type</th>
              <td>{foundationData.foundationType}</td>
            </tr>
            <tr>
              <th>Rate</th>
              <td>₹{foundationData.foundationCostPerSqft} per sq.ft</td>
            </tr>
            <tr>
              <th>Total Foundation Cost</th>
              <td>₹{foundationData.foundationCost?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Beam */}
      <h2>🪵 Beam Estimation</h2>
      <div className="floor-summary">
        <table>
          <tbody>
            <tr>
              <th>Building Area</th>
              <td>{totalArea.toFixed(2)} sq.ft</td>
            </tr>
            <tr>
              <th>Floors</th>
              <td>{Object.keys(result).length}</td>
            </tr>
            <tr>
              <th>Beams per 1000 sq.ft</th>
              <td>{beamData.beamCountPer1000} nos</td>
            </tr>
            <tr>
              <th>Beam Cost (each)</th>
              <td>₹{beamData.beamCostPerBeam?.toLocaleString()}</td>
            </tr>
            <tr>
              <th>Estimated Beams Required</th>
              <td>{beamData.estimatedBeams} nos</td>
            </tr>
            <tr>
              <th>Total Beam Cost</th>
              <td>₹{beamData.totalBeamCost?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Material */}
      <h2>🧰 Material Usage & Cost</h2>
      <div className="floor-summary">
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Usage</th>
              <th>Unit</th>
              <th>Cost (₹)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(materialData.materials || {}).map(([name, info]) => (
              <tr key={name}>
                <td>{name.toUpperCase()}</td>
                <td>{info.usage}</td>
                <td>{info.unit}</td>
                <td>{Number(info.cost).toLocaleString()}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={3}><strong>Total Material Cost</strong></td>
              <td><strong>₹{materialData.totalMaterialCost?.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Plumbing */}
      <h2>🚰 Plumbing Estimation</h2>
      <div className="floor-summary">
        <table>
          <tbody>
            <tr>
              <th>Total Area</th>
              <td>{totalArea.toFixed(2)} sq.ft</td>
            </tr>
            <tr>
              <th>Plumbing Base Cost</th>
              <td>₹{plumbingData.basePlumbingCost?.toLocaleString()}</td>
            </tr>
            <tr>
              <th>Plumbing Points</th>
              <td>{plumbingData.plumbingPoints}</td>
            </tr>
            <tr>
              <th>Pipes Cost</th>
              <td>₹{plumbingData.pipeCost?.toLocaleString()}</td>
            </tr>
            <tr>
              <th>Fixtures Cost</th>
              <td>₹{plumbingData.fixtureCost?.toLocaleString()}</td>
            </tr>
            <tr>
              <th>Water Tank Cost</th>
              <td>₹{plumbingData.tankCost?.toLocaleString()}</td>
            </tr>
            <tr>
              <th>Labour Cost</th>
              <td>₹{plumbingData.labourCost?.toLocaleString()}</td>
            </tr>
            <tr>
              <th><strong>Total Plumbing Cost</strong></th>
              <td><strong>₹{plumbingData.totalPlumbingCost?.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Buttons */}
      <div className="button-row">
        <button onClick={() => navigate("/step2")}>⬅️ Back to Step 2</button>
        <button onClick={downloadPDF}>📄 Download as PDF</button>
        <button onClick={handlePrint}>🖨️ Print</button>
        <button onClick={() => navigate("/")}>🏠 Go to Home</button>
      </div>
    </div>
  );
};

export default CalculateRoom;
