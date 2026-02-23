import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import HomePage from "./Your Choice/HomePage";
import FloorData from "./Your Choice/FloorData";
import CalculateRoom from "./Your Choice/CalculateRooms";
import OurSuggestionPage from "./Our Suggestion/HomePage";

function Home() {
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const goToHomepage = () => {
    navigate("/homepage");
  };

  const goToSuggestion = () => {
    navigate("/suggestion");
  };

  return (
    <div className="container">
      
      <h1 className={`heading ${animate ? "heading-animate" : ""}`}>Welcome to Automated Construction DPR</h1>
      <div className={`boxes ${animate ? "boxes-show" : ""}`}>
        <div className="box" onClick={goToSuggestion}>Quick Estimation </div>
        <div className="box" onClick={goToHomepage}>Detailed Estimation</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/floorData" element={<FloorData />} />
        <Route path="/calculate" element={<CalculateRoom />} />
        <Route path="/suggestion" element={<OurSuggestionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
