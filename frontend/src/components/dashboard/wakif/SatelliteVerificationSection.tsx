import React, { useState, useEffect, useRef } from "react";
import {
  Satellite,
  Clock,
  Scan,
  CheckSquare,
  ShieldCheck,
  Map as MapIcon,
  Layers,
  Sun,
  Droplets,
  Sprout,
  Target,
  Globe,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { projectUpdates, verificationMetrics } from "../../../data/mockData";
import type { SelectedProject } from "../../../types/dashboard";

// Fix for transpilation issues with Mapbox GL JS in some build environments
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
// mapboxgl.workerClass =
//   require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

interface SatelliteVerificationSectionProps {
  currentProject: SelectedProject | null;
  allProjects: SelectedProject[];
  onSelectProject: (project: SelectedProject) => void;
}

const SatelliteVerificationSection: React.FC<
  SatelliteVerificationSectionProps
> = ({ currentProject, allProjects, onSelectProject }) => {
  // Satellite & Map State
  const [viewMode, setViewMode] = useState<"gallery" | "map">("gallery");
  const [galleryMode, setGalleryMode] = useState<"original" | "ai">("ai");

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

  // Helper to get image URL
  const getImageUrl = (
    project: SelectedProject,
    type: "before" | "after" | "meta"
  ) => {
    let url = "";
    if (type === "before") url = project.beforeTrain;
    else if (type === "after") url = project.afterTrain;
    else if (type === "meta") url = project.metadata.imageFile;

    if (!url) return "";
    if (url.startsWith("http")) return url;

    const collectionId =
      type === "meta" ? project.metadata.collectionId : project.collectionId;
    const recordId = type === "meta" ? project.metadata.id : project.id;

    return `https://hackathon22.pocketbase.bocindonesia.com/api/files/${collectionId}/${recordId}/${url}`;
  };

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

  const mapCenter: [number, number] = currentProject?.metadata.location
    ? [
        currentProject.metadata.location.lon,
        currentProject.metadata.location.lat,
      ]
    : [116.0439, -8.3405];

  const displayImage = currentProject
    ? galleryMode === "ai" &&
      currentProject.isTrained &&
      currentProject.afterTrain
      ? getImageUrl(currentProject, "after")
      : getImageUrl(currentProject, "before") ||
        getImageUrl(currentProject, "meta")
    : "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop";

  useEffect(() => {
    if (viewMode === "map" && mapContainer.current && MAPBOX_TOKEN) {
      if (!map.current) {
        // Initialize map
        try {
          mapboxgl.accessToken = MAPBOX_TOKEN;
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/satellite-streets-v12",
            center: mapCenter,
            zoom: 15,
          });

          marker.current = new mapboxgl.Marker({ color: "#22c55e" })
            .setLngLat(mapCenter)
            .addTo(map.current);

          map.current.addControl(
            new mapboxgl.NavigationControl(),
            "bottom-right"
          );
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      } else {
        // Update map center if it already exists
        map.current.flyTo({ center: mapCenter });
        if (marker.current) {
          marker.current.setLngLat(mapCenter);
        }
      }
    }

    // Cleanup on unmount (but keep map instance if switching views might be expensive?
    // No, existing logic removes it on viewMode change)
    return () => {
      if (viewMode !== "map" && map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, [viewMode, MAPBOX_TOKEN, mapCenter[0], mapCenter[1]]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Live Updates Column (Now Project List) */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <div className="flex items-center space-x-2 mb-6">
          <Satellite className="text-green-600" size={20} />
          <h3 className="font-bold text-gray-800">Active Projects</h3>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3 custom-scrollbar">
          {allProjects.length > 0 ? (
            allProjects.map((project) => (
              <div
                key={project.id}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 group ${
                  currentProject?.id === project.id
                    ? "border-green-500 bg-green-50 shadow-sm"
                    : "border-gray-100 hover:border-green-300 hover:bg-gray-50"
                }`}
                onClick={() => onSelectProject(project)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4
                    className={`font-bold text-sm ${
                      currentProject?.id === project.id
                        ? "text-green-800"
                        : "text-gray-800"
                    }`}
                  >
                    {project.metadata.title}
                  </h4>
                  {project.isTrained && (
                    <Scan
                      size={14}
                      className="text-green-500 shrink-0 mt-0.5"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">
                  {project.metadata.quickMetrics?.allocation ||
                    project.metadata.type}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {project.metadata.maqasid?.slice(0, 3).map((m, i) => (
                    <span
                      key={`mq-${i}`}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      {m}
                    </span>
                  ))}
                  {project.metadata.sgds?.slice(0, 3).map((s, i) => (
                    <span
                      key={`sdg-${i}`}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-100"
                    >
                      SDG {s}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Fallback / Loading
            <div className="space-y-6 relative">
              <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-gray-100"></div>
              {projectUpdates.map((update) => (
                <div key={update.id} className="relative pl-10 opacity-60">
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
                </div>
              ))}
              <div className="text-center text-gray-400 text-xs mt-4">
                Loading real-time data...
              </div>
            </div>
          )}
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
              <span>
                Updated:{" "}
                {currentProject
                  ? new Date(currentProject.updated).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "10m ago"}
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-1 rounded border flex items-center ${
                currentProject?.metadata.verified
                  ? "bg-green-900 text-green-300 border-green-700"
                  : "bg-gray-800 text-gray-400 border-gray-700"
              }`}
            >
              <CheckSquare size={10} className="mr-1" />{" "}
              {currentProject?.metadata.verified ? "VERIFIED" : "UNVERIFIED"}
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
                    disabled={!currentProject?.isTrained && !currentProject}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md border flex items-center transition-all ${
                      galleryMode === "ai"
                        ? "bg-green-500/20 border-green-500 text-green-400 shadow-lg"
                        : "bg-black/50 border-gray-600 text-gray-400 hover:bg-black/70"
                    } ${
                      !currentProject?.isTrained && currentProject
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <Scan size={12} className="mr-1" /> AI Analysis
                  </button>
                </div>

                {/* Image */}
                <img
                  src={displayImage}
                  alt="Satellite Feed"
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                />

                {/* AI Overlays - Only show if not using real image with baked in boxes, or if we decide to add overlay logic later */}
                {galleryMode === "ai" && !currentProject && (
                  <>
                    {/* Using mock overlays when no project is selected */}
                    <div
                      className="absolute border-2 border-green-500 bg-green-500/10 flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                      style={{
                        left: "20%",
                        top: "35%",
                        width: "12%",
                        height: "18%",
                      }}
                    >
                      <span className="text-[10px] font-mono bg-black/80 px-1.5 py-0.5 rounded text-green-400 -mt-8 border border-green-500/30">
                        PV Array 1
                      </span>
                    </div>
                  </>
                )}

                {galleryMode === "ai" && (
                  <div className="absolute bottom-4 left-4 bg-black/80 border border-green-500 px-3 py-1.5 rounded-lg text-xs text-green-400 flex items-center backdrop-blur-md shadow-lg">
                    <Scan size={14} className="mr-2 animate-spin-slow" />
                    <div>
                      <div className="font-bold">Computer Vision Analysis</div>
                      {currentProject && !currentProject.isTrained && (
                        <div className="text-[10px] opacity-80 text-yellow-500">
                          Processing Pending
                        </div>
                      )}
                    </div>
                  </div>
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
            {currentProject ? (
              <>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                    <span>Project Value (Target)</span>
                    <span>
                      {currentProject.metadata.neededFund
                        ? `Rp ${currentProject.metadata.neededFund.toLocaleString()}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    {/* Visual bar just for decoration or ratio if we had currentFund */}
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{
                        width: `${
                          (currentProject.metadata.currentFund /
                            currentProject.metadata.neededFund) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                    <span>
                      Funded: Rp{" "}
                      {currentProject.metadata.currentFund
                        ? currentProject.metadata.currentFund.toLocaleString()
                        : "N/A"}
                    </span>
                    <span>
                      {(
                        (currentProject.metadata.currentFund /
                          currentProject.metadata.neededFund) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                    <span>Key Metrics</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 p-2 rounded border border-gray-700">
                      <div className="text-[10px] text-gray-400">
                        Carbon Offset
                      </div>
                      <div className="text-sm font-bold text-green-400">
                        {currentProject.metadata.metrics.co2Yearly} t/Year
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-2 rounded border border-gray-700">
                      <div className="text-[10px] text-gray-400">
                        Trees Planted
                      </div>
                      <div className="text-sm font-bold text-green-400">
                        {currentProject.metadata.metrics.trees}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-2 rounded border border-gray-700">
                      <div className="text-[10px] text-gray-400">
                        Beneficiaries
                      </div>
                      <div className="text-sm font-bold text-blue-400">
                        {currentProject.metadata.quickMetrics.beneficiaries}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-2 rounded border border-gray-700">
                      <div className="text-[10px] text-gray-400">
                        Multiplier
                      </div>
                      <div className="text-sm font-bold text-yellow-400">
                        {currentProject.metadata.metrics.multiplier}x
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 flex items-start space-x-3 backdrop-blur-sm">
                  <ShieldCheck
                    className={`${
                      currentProject.metadata.verified
                        ? "text-green-400"
                        : "text-red-400"
                    } mt-0.5 shrink-0`}
                    size={18}
                  />
                  <div>
                    <div className="text-sm font-bold text-green-100 mb-1">
                      {currentProject.metadata.verified
                        ? "Impact Verified"
                        : "Impact Unverified"}
                    </div>
                    <div className="text-xs text-gray-400 leading-relaxed">
                      {currentProject.metadata.verified
                        ? "Satellite / pyhsical imagery confirms physical asset existence."
                        : "Satellite imagery does not confirm physical asset existence."}
                      <br />
                      <span className="text-gray-500 mt-1 block">
                        Coords: {currentProject.metadata.location.lat},{" "}
                        {currentProject.metadata.location.lon}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Fallback to old layout if no project selected
              <>
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
                {/* ... other parts of old layout ... */}
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
                      Satellite imagery confirms physical asset existence.
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteVerificationSection;
