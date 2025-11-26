import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  MapPin,
  CheckCircle,
  Activity,
  Filter,
  Globe,
} from "lucide-react";
import {
  MAQASID,
  AVAILABLE_SDGS,
  SDG_DETAILS,
  type Project,
} from "../data/mockData";
import { fetchProjects } from "../utils/api";
import { MaqasidIcon, SdgBadge } from "../components/ui/Badges";

const ProjectsPage = () => {
  const [projectsData, setProjectsData] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      const data = await fetchProjects();
      setProjectsData(data);
    };
    loadProjects();
  }, []);

  const [selectedMaqasid, setSelectedMaqasid] = useState<string[]>(
    Object.keys(MAQASID)
  );
  const [selectedSdgs, setSelectedSdgs] = useState<string[]>(AVAILABLE_SDGS);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMaqasid = (id: string) => {
    setSelectedMaqasid((prev) =>
      prev.includes(id)
        ? prev.map((d) => d.toString()).filter((p) => p !== id)
        : [...prev, id]
    );
  };

  const toggleSdg = (num: string) => {
    setSelectedSdgs((prev) =>
      prev.includes(num) ? prev.filter((p) => p !== num) : [...prev, num]
    );
  };

  const filteredProjects = useMemo(() => {
    return projectsData.filter((project) => {
      const hasMaqasid = project.maqasid.some((m) =>
        selectedMaqasid.includes(m)
      );

      const hasSdg = project.sdgs.some((s) => selectedSdgs.includes(s));
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.address
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return hasMaqasid && hasSdg && matchesSearch;
    });
  }, [projectsData, selectedMaqasid, selectedSdgs, searchQuery]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Verified Waqf Projects
            </h1>
            <p className="text-gray-500 mt-2">
              Invest in the sustainable sharia-based projects
            </p>
          </div>
          <div className="flex space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-full md:w-64"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 shrink-0 space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <Filter size={12} className="mr-1" /> Maqasid Filter
              </h3>
              <div className="space-y-3">
                {Object.entries(MAQASID).map(([key, m]) => (
                  <label
                    key={key}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mr-3 rounded text-green-600 focus:ring-green-500 cursor-pointer w-4 h-4 border-gray-300"
                      checked={selectedMaqasid.includes(key)}
                      onChange={() => toggleMaqasid(key)}
                    />
                    <span className="flex-1">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <Globe size={12} className="mr-1" /> SDG Goals
              </h3>
              <div className="space-y-3">
                {AVAILABLE_SDGS.map((sdg) => (
                  <label
                    key={sdg}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mr-3 rounded text-green-600 focus:ring-green-500 cursor-pointer w-4 h-4 border-gray-300"
                      checked={selectedSdgs.includes(sdg)}
                      onChange={() => toggleSdg(sdg)}
                    />
                    <div className="flex items-center flex-1">
                      <SdgBadge number={sdg} />
                      <span className="ml-2 text-xs text-gray-500 truncate">
                        {SDG_DETAILS[sdg]?.title || `SDG ${sdg}`}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Project List */}
          <div className="flex-1">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <Filter size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">
                  No projects match the selected filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedMaqasid(Object.keys(MAQASID));
                    setSelectedSdgs(AVAILABLE_SDGS);
                    setSearchQuery("");
                  }}
                  className="mt-2 text-green-600 text-sm hover:underline"
                >
                  filter
                </button>
                <button
                  onClick={() => {
                    // reset memory state
                  }}
                  className="mt-2 text-green-600 text-sm hover:underline"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Project Info */}
                      <div className="p-6 md:w-5/12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            {project.verified && (
                              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold w-fit mb-2">
                                <CheckCircle size={14} />
                                <span>Verified</span>
                              </div>
                            )}
                          </div>
                          <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {project.title}
                          </h2>
                          <div className="flex items-center text-gray-500 text-sm mb-4">
                            <MapPin size={14} className="mr-1" />{" "}
                            {project.location.address}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.maqasid.map((m) => (
                              <MaqasidIcon key={m} type={m} />
                            ))}
                          </div>
                          <div className="flex space-x-1">
                            {project.sdgs.map((s) => (
                              <SdgBadge key={s} number={s} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Metrics */}
                      <div className="p-6 md:w-4/12 bg-gray-50 flex flex-col justify-center space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Target
                            </div>
                            <div className="font-bold text-gray-900 text-lg">
                              Rp {project.quickMetrics.needed.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Impact
                            </div>
                            <div className="font-bold text-gray-900 text-lg">
                              {project.quickMetrics.beneficiaries.toLocaleString()}{" "}
                              ppl
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                              <div
                                className="bg-green-600 h-2.5 rounded-full"
                                style={{ width: "45%" }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>IDR 67,500 raised</span>
                              <span>45%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action */}
                      <div className="p-6 md:w-3/12 flex items-center justify-center bg-white">
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center">
                          Donate Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
