import React, { useState, useEffect, useRef } from "react";
import {
  Satellite,
  Clock,
  Scan,
  CheckSquare,
  AlertCircle,
  ShieldCheck,
  Map as MapIcon,
  Layers,
  Sun,
  Droplets,
  Sprout,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { projectUpdates, verificationMetrics } from "../../../data/mockData";

// Fix for transpilation issues with Mapbox GL JS in some build environments
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
// mapboxgl.workerClass =
//   require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const SatelliteVerificationSection = () => {
  // Satellite & Map State
  const [viewMode, setViewMode] = useState<"gallery" | "map">("gallery");
  const [galleryMode, setGalleryMode] = useState<"original" | "ai">("ai");

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

  const detectionBoxes = [
    { id: 1, x: 20, y: 35, w: 12, h: 18, label: "PV Array 1" },
    { id: 2, x: 35, y: 35, w: 12, h: 18, label: "PV Array 2" },
    { id: 3, x: 50, y: 35, w: 12, h: 18, label: "PV Array 3" },
    { id: 4, x: 65, y: 35, w: 12, h: 18, label: "PV Array 4" },
  ];

  const getIcon = (name: string) => {
    switch (name) {
      case "Sun":
        return <Sun size={14} />;
      case "Droplets":
        return <Droplets size={14} />;
      case "Sprout":
        return <Sprout size={14} />;
      default:
        return <Sun size={14} />;
    }
  };

  useEffect(() => {
    if (viewMode === "map" && mapContainer.current && MAPBOX_TOKEN) {
      if (map.current) return; // initialize map only once

      mapboxgl.accessToken = MAPBOX_TOKEN;

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/satellite-streets-v12",
          center: [116.0439, -8.3405],
          zoom: 15,
        });

        new mapboxgl.Marker({ color: "#22c55e" })
          .setLngLat([116.0439, -8.3405])
          .addTo(map.current);

        map.current.addControl(
          new mapboxgl.NavigationControl(),
          "bottom-right"
        );
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }

    // Cleanup on unmount or view change
    return () => {
      if (viewMode !== "map" && map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [viewMode, MAPBOX_TOKEN]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Live Updates Column */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Satellite className="text-green-600" size={20} />
          <h3 className="font-bold text-gray-800">Project Live Updates</h3>
        </div>
        <div className="space-y-6 relative">
          {/* Vertical Line */}
          <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-gray-100"></div>

          {projectUpdates.map((update) => (
            <div key={update.id} className="relative pl-10">
              <div
                className={`absolute left-0 top-0 w-7 h-7 rounded-full bg-white border-2 border-${update.color}-500 flex items-center justify-center z-10`}
              >
                <div className={`text-${update.color}-600`}>
                  {getIcon(update.iconName)}
                </div>
              </div>
              <div className="text-xs text-gray-400 mb-0.5 flex items-center">
                <Clock size={10} className="mr-1" /> {update.time}
              </div>
              <div className={`font-bold text-sm text-${update.color}-600`}>
                {update.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">{update.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Satellite Verification Column */}
      <div className="lg:col-span-2 bg-gray-900 text-white rounded-2xl shadow-lg border border-gray-800 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div className="flex space-x-6">
            <button
              onClick={() => setViewMode("gallery")}
              className={`flex items-center space-x-2 text-sm font-bold pb-2 -mb-4 border-b-2 transition-colors ${
                viewMode === "gallery"
                  ? "border-green-500 text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              <Layers size={16} />
              <span>Live Feed</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center space-x-2 text-sm font-bold pb-2 -mb-4 border-b-2 transition-colors ${
                viewMode === "map"
                  ? "border-green-500 text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              <MapIcon size={16} />
              <span>Location</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded text-xs text-gray-400">
              <Clock size={12} />
              <span>Updated: 10m ago</span>
            </div>
            <span className="bg-green-900 text-green-300 text-[10px] px-2 py-1 rounded border border-green-700 flex items-center">
              <CheckSquare size={10} className="mr-1" /> VERIFIED
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-[350px]">
          {/* Main Visual Area */}
          <div className="w-full md:w-3/5 relative bg-black border-r border-gray-800 group overflow-hidden">
            {viewMode === "gallery" ? (
              <div className="h-full relative w-full">
                {/* Controls */}
                <div className="absolute top-4 left-4 z-10 flex space-x-2">
                  <button
                    onClick={() => setGalleryMode("original")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md border transition-all ${
                      galleryMode === "original"
                        ? "bg-white/20 border-white text-white shadow-lg"
                        : "bg-black/50 border-gray-600 text-gray-400 hover:bg-black/70"
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setGalleryMode("ai")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md border flex items-center transition-all ${
                      galleryMode === "ai"
                        ? "bg-green-500/20 border-green-500 text-green-400 shadow-lg"
                        : "bg-black/50 border-gray-600 text-gray-400 hover:bg-black/70"
                    }`}
                  >
                    <Scan size={12} className="mr-1" /> AI Analysis
                  </button>
                </div>

                {/* Image */}
                <img
                  src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop"
                  alt="Satellite Feed"
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                />

                {/* AI Overlays */}
                {galleryMode === "ai" && (
                  <>
                    {detectionBoxes.map((box) => (
                      <div
                        key={box.id}
                        className="absolute border-2 border-green-500 bg-green-500/10 flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                        style={{
                          left: `${box.x}%`,
                          top: `${box.y}%`,
                          width: `${box.w}%`,
                          height: `${box.h}%`,
                        }}
                      >
                        <span className="text-[10px] font-mono bg-black/80 px-1.5 py-0.5 rounded text-green-400 -mt-8 border border-green-500/30">
                          {box.label}
                        </span>
                      </div>
                    ))}
                    <div className="absolute bottom-4 left-4 bg-black/80 border border-green-500 px-3 py-1.5 rounded-lg text-xs text-green-400 flex items-center backdrop-blur-md shadow-lg">
                      <Scan size={14} className="mr-2 animate-spin-slow" />
                      <div>
                        <div className="font-bold">
                          Computer Vision Analysis
                        </div>
                        {/* <div className="text-[10px] opacity-80">
                          Confidence Score: 98.5%
                        </div> */}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="h-full w-full bg-gray-800 relative">
                {MAPBOX_TOKEN ? (
                  <div
                    ref={mapContainer}
                    id="map-container"
                    className="h-full w-full"
                  ></div>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-900">
                    <div className="bg-gray-800 p-4 rounded-full mb-4">
                      <MapIcon size={32} className="opacity-50" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-300 mb-2">
                      Map Visualization
                    </h4>
                    <p className="text-sm mb-4 max-w-xs">
                      To view the interactive map, please configure your Mapbox
                      token in the environment variables.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verification Stats */}
          <div className="w-full md:w-2/5 p-6 flex flex-col justify-center space-y-8 bg-gradient-to-br from-gray-900 to-gray-800">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                <span>Reported Area (Whitepaper)</span>
                <span>{verificationMetrics.reportedArea} Ha</span>
              </div>
              <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gray-600 h-full rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                <span>AI Verified Area (Satellite)</span>
                <span className="text-green-400 font-bold">
                  {verificationMetrics.verifiedArea} Ha
                </span>
              </div>
              <div className="w-full bg-gray-800 h-2.5 rounded-full relative overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full absolute top-0 left-0 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  style={{ width: `${verificationMetrics.matchPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-[10px] text-gray-500">
                  Source: Sentinel-2 Satellite
                </div>
                <div className="text-right text-xs font-bold text-green-500">
                  {verificationMetrics.matchPercentage}% Match
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 flex items-start space-x-3 backdrop-blur-sm">
              <ShieldCheck
                className="text-green-400 mt-0.5 shrink-0"
                size={18}
              />
              <div>
                <div className="text-sm font-bold text-green-100 mb-1">
                  Anti-Greenwashing Verified
                </div>
                <div className="text-xs text-gray-400 leading-relaxed">
                  Satellite imagery confirms physical asset existence. Heat
                  signature analysis validates active energy generation at
                  coordinates{" "}
                  <span className="text-gray-300 font-mono">
                    {-8.34}, {116.04}
                  </span>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteVerificationSection;
