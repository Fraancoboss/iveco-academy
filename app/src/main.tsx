import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GeneralLanding } from "./pages/GeneralLanding.js";
import { SchoolLanding } from "./pages/SchoolLanding.js";
import { InscriptionForm } from "./pages/InscriptionForm.js";
import { StudentDashboard } from "./pages/StudentDashboard.js";
import { TrainerDashboard } from "./pages/TrainerDashboard.js";
import { DirectorDashboard } from "./pages/DirectorDashboard.js";
import { Watermark } from "./components/Watermark.js";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Watermark />
      <Routes>
        <Route path="/" element={<GeneralLanding />} />
        <Route path="/school" element={<SchoolLanding />} />
        <Route path="/inscripcion" element={<InscriptionForm />} />
        <Route path="/student/:id" element={<StudentDashboard />} />
        <Route path="/trainer/:id" element={<TrainerDashboard />} />
        <Route path="/director" element={<DirectorDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
