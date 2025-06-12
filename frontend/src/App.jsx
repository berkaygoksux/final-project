import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login"; // Bu dosyanın oluşturulması gerekebilir
import Register from "./Register"; // Bu dosyanın oluşturulması gerekebilir
import Genarator from "./Genarator"; // Bizim kodumuz buraya gelecek
import Training from "./Training";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/generator" element={<Genarator />} />
        <Route path="/training" element={<Training />} />
      </Routes>
    </Router>
  );
}

export default App;
