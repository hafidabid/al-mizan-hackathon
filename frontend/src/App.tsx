import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import ProjectsPage from "./pages/ProjectsPage";
import WakifDashboard from "./pages/WakifDashboard";
import NazirDashboard from "./pages/NazirDashboard";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/wakif" element={<WakifDashboard />} />
            <Route path="/nazir" element={<NazirDashboard />} />
          </Routes>
        </main>

        {/* Simple Footer */}
        <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-green-500">
                Al-Mizan+
              </span>
              <p className="text-gray-400 text-sm mt-1">
                Green Investment. Sharia Compliance. Scalable Impact.
              </p>
            </div>
            <div className="text-gray-500 text-sm">
              © 2025 Al-Mizan+. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
