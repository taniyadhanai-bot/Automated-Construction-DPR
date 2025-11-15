import React, { useState } from "react";
import Step1Plot from "./Step1Plot";
import Step2FloorForm from "./Step2FloorForm";
import Step3Result from "./Step3Result";
import "./HomePage.css";


export default function Predefined() {
  const [step, setStep] = useState(1);

  // Predefined plot data
  const [plotData, setPlotData] = useState({ length: 50, width: 60, floors: 2 });

  // Predefined floor data (example: fixed rooms per floor)
  const predefinedFloorData = [
    { Bedroom: 0, Hall: 0, Dining: 0, Kitchen: 0, Washroom: 0, Puja: 0 },
    { Bedroom: 0, Hall: 0, Dining: 0, Kitchen: 0, Washroom: 0, Puja: 0 },
  ];

  const [floorData, setFloorData] = useState(predefinedFloorData);

  const [costLevel, setCostLevel] = useState("Medium");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">
          Predefined Multi-Floor House Estimator
        </h1>

        <div className="mb-6 text-center">
          <span className={`mx-2 ${step >= 1 ? "font-bold" : "text-gray-400"}`}>Step 1</span> ›
          <span className={`mx-2 ${step >= 2 ? "font-bold" : "text-gray-400"}`}>Step 2</span> ›
          <span className={`mx-2 ${step >= 3 ? "font-bold" : "text-gray-400"}`}>Step 3</span>
        </div>

        {step === 1 && (
          <Step1Plot plotData={plotData} setPlotData={setPlotData} nextStep={() => setStep(2)} />
        )}
        {step === 2 && (
          // Step2FloorForm will show predefined rooms (disable editing)
          <Step2FloorForm
            floors={plotData.floors}
            floorData={floorData}
            setFloorData={setFloorData}
            prevStep={() => setStep(1)}
            nextStep={() => setStep(3)}
            readOnly={true} // we will pass a prop to disable editing
          />
        )}
        {step === 3 && (
          <Step3Result
            floorData={floorData}
            costLevel={costLevel}
            setCostLevel={setCostLevel}
            prevStep={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}
