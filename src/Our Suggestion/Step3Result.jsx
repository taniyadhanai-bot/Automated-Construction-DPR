
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Step3Result.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const handlePrint = () => window.print();

const downloadPDF = () => {
  const input = document.querySelector(".output-page");
  input.classList.add("print-mode");

  html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("RoomCount_Estimation.pdf");
    input.classList.remove("print-mode");
  });
};

export default function CalculateRoomCount({ floorData: propFloorData, floors: propFloors } = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const loc = location.state || {};
  const locFloorData = loc.floorData;
  const locFloors = loc.floors;
  // final values: prefer props, then location.state
  const fd = propFloorData || locFloorData || [];
  const fl = propFloors || locFloors || (Array.isArray(fd) ? fd.length : 0);

  const [summary, setSummary] = useState({});
  const [totalArea, setTotalArea] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [materialData, setMaterialData] = useState({});
  const [foundationData, setFoundationData] = useState({});
  const [beamData, setBeamData] = useState({});
  const [plumbingData, setPlumbingData] = useState({});

  // 📏 Predefined area per room type (average ft²)
  const ROOM_AREAS = {
    Bedroom: 150,
    Hall: 200,
    Dining: 120,
    Kitchen: 100,
    Washroom: 50,
    Puja: 30,
  };

  const COST_PER_SQFT = 1500;
  const ROOF_COST_PER_SQFT = 250;

  useEffect(() => {
    if (!fd || fd.length === 0) return;

    let floorSummary = {};
    let totalBuildingArea = 0;

    // ✅ Each floor calculation
  fd.forEach((rooms, i) => {
      let floorArea = 0;

      Object.keys(rooms).forEach((room) => {
        const areaPerRoom = ROOM_AREAS[room] || 0;
        floorArea += areaPerRoom * (rooms[room] || 0);
      });

      const floorCost = floorArea * COST_PER_SQFT;
      const roofCost = floorArea * ROOF_COST_PER_SQFT;

      floorSummary[`Floor ${i + 1}`] = { ...rooms, floorArea, floorCost, roofCost };
      totalBuildingArea += floorArea;
    });

    // ✅ Foundation setup based on floors
    let foundationType = "";
    let foundationCostPerSqft = 0;
    let beamCountPer1000 = 0;
    let beamCostPerBeam = 0;

  if (fl === 1) {
      foundationType = "Shallow Footing";
      foundationCostPerSqft = 350;
      beamCountPer1000 = 7;
      beamCostPerBeam = 15000;
  } else if (fl === 2) {
      foundationType = "RCC Isolated Footing";
      foundationCostPerSqft = 500;
      beamCountPer1000 = 9;
      beamCostPerBeam = 20000;
  } else if (fl === 3) {
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

    const foundationCost = totalBuildingArea * foundationCostPerSqft;
    const totalRoofCost = totalBuildingArea * ROOF_COST_PER_SQFT;

    const estimatedBeams = Math.round((totalBuildingArea / 1000) * beamCountPer1000);
    const totalBeamCost = estimatedBeams * beamCostPerBeam;

    // 🧱 Material Cost
    const materialRates = {
      cement: { usagePer100: 5, costPerUnit: 350, unit: "bag" },
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

    // 🚰 Plumbing
    const PLUMBING_RATE_PER_SQFT = 350;
    const basePlumbingCost = (totalBuildingArea / 1000) * PLUMBING_RATE_PER_SQFT;

    const plumbingPoints = Math.round(totalBuildingArea / 100);
    const pipeCost = plumbingPoints * 500;
    const fixtureCost = plumbingPoints * 1200;
    const tankCost = 5000;
    const labourCost = basePlumbingCost * 0.25;

    const totalPlumbingCost =
      basePlumbingCost + pipeCost + fixtureCost + tankCost + labourCost;

    // 💰 Final total
    const total =
      foundationCost +
      totalRoofCost +
      totalBeamCost +
      totalMaterialCost +
      totalPlumbingCost +
      totalBuildingArea * COST_PER_SQFT;

    // ✅ Update states
    setSummary(floorSummary);
    setTotalArea(totalBuildingArea);
    setTotalCost(total);
    setFoundationData({ foundationType, foundationCost, foundationCostPerSqft });
    setBeamData({
      estimatedBeams,
      beamCountPer1000,
      beamCostPerBeam,
      totalBeamCost,
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
  }, [fd, fl]);

  if (!fd || fd.length === 0) {
    return (
      <div className="output-page">
        <h2>No data found 😅</h2>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  // Main render when data exists
  return (
    <div className="output-page">
      <h1>🏗️ Construction Estimation (Room Count Based)</h1>

      {/* ✅ USER INPUT: Floor-wise room details */}
      <div className="floor-summary">
        <h2>🏢 Floor-wise Room Details (User Input)</h2>
        {fd.map((floor, i) => (
          <div key={i} className="user-floor">
            <h3>Floor {i + 1}</h3>
            <table>
              <thead>
                <tr>
                  <th>Room Type</th>
                  <th>Count</th>
                  <th>Area / Room (ft²)</th>
                  <th>Total Area (ft²)</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(floor).map((room) => (
                  <tr key={room}>
                    <td>{room}</td>
                    <td>{floor[room]}</td>
                    <td>{ROOM_AREAS[room] || "-"}</td>
                    <td>
                      {floor[room] && ROOM_AREAS[room]
                        ? (ROOM_AREAS[room] * floor[room]).toFixed(2)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* ✅ BUILDING SUMMARY */}
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

      {/* ✅ CALCULATED FLOOR-WISE SUMMARY */}
      <h2>🏢 Floor-Wise Calculated Summary</h2>
      {Object.entries(summary).map(([floor, data]) => (
        <div key={floor} className="floor-summary">
          <h3>{floor}</h3>
          <table>
            <thead>
              <tr>
                <th>Room Type</th>
                <th>Count</th>
                <th>Area per Room</th>
                <th>Total Area</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(ROOM_AREAS).map((room) => (
                <tr key={room}>
                  <td>{room}</td>
                  <td>{data[room]}</td>
                  <td>{ROOM_AREAS[room]}</td>
                  <td>{(ROOM_AREAS[room] * data[room]).toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3}><strong>Floor Total</strong></td>
                <td><strong>{data.floorArea.toFixed(2)} sq.ft</strong></td>
              </tr>
              <tr>
                <td colSpan={3}><strong>Floor Cost</strong></td>
                <td><strong>₹{data.floorCost.toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      {/* ✅ FOUNDATION DETAILS */}
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

      {/* ✅ BEAM DETAILS */}
      <h2>🪵 Beam Estimation</h2>
      <div className="floor-summary">
        <table>
          <tbody>
            <tr>
              <th>Building Area</th>
              <td>{totalArea.toFixed(2)} sq.ft</td>
            </tr>
            <tr>
              <th>Beams per 1000 sq.ft</th>
              <td>{beamData.beamCountPer1000}</td>
            </tr>
            <tr>
              <th>Beam Cost (each)</th>
              <td>₹{beamData.beamCostPerBeam?.toLocaleString()}</td>
            </tr>
            <tr>
              <th>Estimated Beams Required</th>
              <td>{beamData.estimatedBeams}</td>
            </tr>
            <tr>
              <th>Total Beam Cost</th>
              <td>₹{beamData.totalBeamCost?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ✅ MATERIAL DETAILS */}
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

      {/* ✅ PLUMBING DETAILS */}
      <h2>🚰 Plumbing Estimation</h2>
      <div className="floor-summary">
        <table>
          <tbody>
            <tr><th>Plumbing Points</th><td>{plumbingData.plumbingPoints}</td></tr>
            <tr><th>Pipes Cost</th><td>₹{plumbingData.pipeCost?.toLocaleString()}</td></tr>
            <tr><th>Fixtures Cost</th><td>₹{plumbingData.fixtureCost?.toLocaleString()}</td></tr>
            <tr><th>Tank Cost</th><td>₹{plumbingData.tankCost?.toLocaleString()}</td></tr>
            <tr><th>Labour Cost</th><td>₹{plumbingData.labourCost?.toLocaleString()}</td></tr>
            <tr><th>Total Plumbing Cost</th><td><strong>₹{plumbingData.totalPlumbingCost?.toLocaleString()}</strong></td></tr>
          </tbody>
        </table>
      </div>

      {/* ✅ ACTION BUTTONS */}
      <div className="button-row">
        <button onClick={() => navigate(-1)}>⬅️ Back</button>
        <button onClick={downloadPDF}>📄 Download PDF</button>
        <button onClick={handlePrint}>🖨️ Print</button>
        <button onClick={() => navigate("/")}>🏠 Home</button>
      </div>
    </div>
  );

//     return (
//       <div className="output-page">
//         <h2>No Data Found 😅</h2>
//         <button onClick={() => navigate("/")}>Go Back</button>
//       </div>
//     );

//   return (
//     <div className="output-page">
//       <h1>🏗️ Construction Estimation (Room Count Based)</h1>

//       <div className="floor-summary">
//         <h2>📊 Total Building Summary</h2>
//         <table>
//           <tbody>
//             <tr>
//               <th>Total Area</th>
//               <td>{totalArea.toFixed(2)} sq.ft</td>
//             </tr>
//             <tr>
//               <th>Total Estimated Cost</th>
//               <td>₹{totalCost.toLocaleString()}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       <h2>🏢 Floor-Wise Summary</h2>
//       {Object.entries(summary).map(([floor, data]) => (
//         <div key={floor} className="floor-summary">
//           <h3>{floor}</h3>
//           <table>
//             <thead>
//               <tr>
//                 <th>Room Type</th>
//                 <th>Count</th>
//                 <th>Area per Room</th>
//                 <th>Total Area</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.keys(ROOM_AREAS).map((room) => (
//                 <tr key={room}>
//                   <td>{room}</td>
//                   <td>{data[room]}</td>
//                   <td>{ROOM_AREAS[room]}</td>
//                   <td>{(ROOM_AREAS[room] * data[room]).toFixed(2)}</td>
//                 </tr>
//               ))}
//               <tr>
//                 <td colSpan={3}>
//                   <strong>Floor Total</strong>
//                 </td>
//                 <td>
//                   <strong>{data.floorArea.toFixed(2)} sq.ft</strong>
//                 </td>
//               </tr>
//               <tr>
//                 <td colSpan={3}>
//                   <strong>Floor Cost</strong>
//                 </td>
//                 <td>
//                   <strong>₹{data.floorCost.toLocaleString()}</strong>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       ))}

//       <h2>🧱 Foundation Details</h2>
//       <div className="floor-summary">
//         <table>
//           <tbody>
//             <tr>
//               <th>Type</th>
//               <td>{foundationData.foundationType}</td>
//             </tr>
//             <tr>
//               <th>Rate</th>
//               <td>₹{foundationData.foundationCostPerSqft} per sq.ft</td>
//             </tr>
//             <tr>
//               <th>Total Foundation Cost</th>
//               <td>₹{foundationData.foundationCost?.toLocaleString()}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       <h2>🪵 Beam Estimation</h2>
//       <div className="floor-summary">
//         <table>
//           <tbody>
//             <tr>
//               <th>Building Area</th>
//               <td>{totalArea.toFixed(2)} sq.ft</td>
//             </tr>
//             <tr>
//               <th>Beams per 1000 sq.ft</th>
//               <td>{beamData.beamCountPer1000}</td>
//             </tr>
//             <tr>
//               <th>Beam Cost (each)</th>
//               <td>₹{beamData.beamCostPerBeam?.toLocaleString()}</td>
//             </tr>
//             <tr>
//               <th>Estimated Beams Required</th>
//               <td>{beamData.estimatedBeams}</td>
//             </tr>
//             <tr>
//               <th>Total Beam Cost</th>
//               <td>₹{beamData.totalBeamCost?.toLocaleString()}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       <h2>🧰 Material Usage & Cost</h2>
//       <div className="floor-summary">
//         <table>
//           <thead>
//             <tr>
//               <th>Material</th>
//               <th>Usage</th>
//               <th>Unit</th>
//               <th>Cost (₹)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {Object.entries(materialData.materials || {}).map(([name, info]) => (
//               <tr key={name}>
//                 <td>{name.toUpperCase()}</td>
//                 <td>{info.usage}</td>
//                 <td>{info.unit}</td>
//                 <td>{Number(info.cost).toLocaleString()}</td>
//               </tr>
//             ))}
//             <tr>
//               <td colSpan={3}><strong>Total Material Cost</strong></td>
//               <td><strong>₹{materialData.totalMaterialCost?.toLocaleString()}</strong></td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       <h2>🚰 Plumbing Estimation</h2>
//       <div className="floor-summary">
//         <table>
//           <tbody>
//             <tr>
//               <th>Plumbing Points</th>
//               <td>{plumbingData.plumbingPoints}</td>
//             </tr>
//             <tr>
//               <th>Pipes Cost</th>
//               <td>₹{plumbingData.pipeCost?.toLocaleString()}</td>
//             </tr>
//             <tr>
//               <th>Fixtures Cost</th>
//               <td>₹{plumbingData.fixtureCost?.toLocaleString()}</td>
//             </tr>
//             <tr>
//               <th>Tank Cost</th>
//               <td>₹{plumbingData.tankCost?.toLocaleString()}</td>
//             </tr>
//             <tr>
//               <th>Labour Cost</th>
//               <td>₹{plumbingData.labourCost?.toLocaleString()}</td>
//             </tr>
//             <tr>
//               <th>Total Plumbing Cost</th>
//               <td><strong>₹{plumbingData.totalPlumbingCost?.toLocaleString()}</strong></td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       <div className="button-row">
//         <button onClick={() => navigate(-1)}>⬅️ Back</button>
//         <button onClick={downloadPDF}>📄 Download PDF</button>
//         <button onClick={handlePrint}>🖨️ Print</button>
//         <button onClick={() => navigate("/")}>🏠 Home</button>
//       </div>
//     </div>
//   );
// }

}
