import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3Geo from 'd3-geo';
import * as d3Scale from 'd3-scale';
import * as d3Zoom from 'd3-zoom';
import { select } from 'd3-selection';
import { Home, Droplets, Zap, Train, Car, Building, ExternalLink } from 'lucide-react';
import rewind from "@turf/rewind";

const normalizeStateName = (name) => {
  if (!name) return "";
  let n = name.trim().toLowerCase();
  n = n.replace(/&/g, "and");
  if (n === "orissa") return "odisha";
  if (n === "pondicherry") return "puducherry";
  if (n.includes("andaman")) return "andaman and nicobar islands";
  if (n === "uttaranchal") return "uttarakhand";
  if (n === "nct of delhi") return "delhi";
  if (n === "dadra and nagar haveli and daman and diu") return "dadra and nagar haveli and daman and diu";
  return n;
};

const SECTOR_ICONS = {
  "Housing": Home,
  "Irrigation": Droplets,
  "Power/Transmission": Zap,
  "Railways": Train,
  "Roads": Car,
  "Urban Metro": Building
};

const SECTOR_COLORS = {
  "Housing": "#3b82f6",
  "Irrigation": "#0ea5e9",
  "Power/Transmission": "#eab308",
  "Railways": "#ef4444",
  "Roads": "#8b5cf6",
  "Urban Metro": "#ec4899",
  "All": "#ffffff"
};

const RiskHeatmap = () => {
  const [data, setData] = useState([]);
  const [indiaGeoJson, setIndiaGeoJson] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [mapError, setMapError] = useState(null);

  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  const [metric, setMetric] = useState('risk'); // 'risk' | 'delay'
  const [hoveredState, setHoveredState] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  const [stateCases, setStateCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [activeSector, setActiveSector] = useState("All");

  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch GeoJSON
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch("/india-states.json");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const json = await response.json();
        if (json.type !== "FeatureCollection") {
          throw new Error("JSON parse error: not a FeatureCollection");
        }
        if (!json.features || json.features.length === 0) {
          throw new Error("0 features found in GeoJSON");
        }
        const fixed = rewind(json, { reverse: true });
        setIndiaGeoJson(fixed);
      } catch (err) {
        console.error("GeoJSON load failed:", err);
        setMapError(err.message);
      } finally {
        setLoadingMap(false);
      }
    };
    fetchGeoJSON();
  }, []);

  // Fetch API Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/analytics/state-risk');
        if (!response.ok) throw new Error('Failed to fetch data');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setDataError(err.message);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Fetch Cases for selected state
  useEffect(() => {
    if (selectedState) {
      const fetchCases = async () => {
        setLoadingCases(true);
        try {
          const response = await fetch(`http://127.0.0.1:8000/analytics/state-cases?state=${encodeURIComponent(selectedState.state)}&limit=10`);
          if (response.ok) {
            const json = await response.json();
            setStateCases(json);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingCases(false);
        }
      };
      fetchCases();
      setActiveSector("All");
    } else {
      setStateCases([]);
    }
  }, [selectedState]);

  // Merge Data
  const matchedData = useMemo(() => {
    if (!indiaGeoJson || data.length === 0) return [];
    
    const dataMap = {};
    data.forEach(row => {
      dataMap[normalizeStateName(row.state)] = row;
    });

    const matched = [];
    let unmatchedCount = 0;
    indiaGeoJson.features.forEach(feature => {
      const name = feature.properties.name || feature.properties.ST_NM || feature.properties.NAME_1 || "";
      const normName = normalizeStateName(name);
      const stateData = dataMap[normName];
      if (stateData) {
        matched.push({ ...stateData, feature });
      }
    });
    
    return matched;
  }, [indiaGeoJson, data]);


  const metricKey = metric === 'risk' ? 'avg_risk_pct' : 'avg_delay_days';
  const minVal = matchedData.length > 0 ? Math.min(...matchedData.map(d => d[metricKey])) : 0;
  const maxVal = matchedData.length > 0 ? Math.max(...matchedData.map(d => d[metricKey])) : 100;

  const colorScale = useMemo(() => {
    if (metric === 'risk') {
      return d3Scale.scaleLinear()
        .domain([minVal, minVal + (maxVal - minVal) * 0.33, minVal + (maxVal - minVal) * 0.66, maxVal])
        .range(['#34d399', '#facc15', '#fb923c', '#ec4899']);
    } else {
      return d3Scale.scaleLinear()
        .domain([minVal, minVal + (maxVal - minVal) * 0.5, maxVal])
        .range(['#facc15', '#fb923c', '#ef4444']);
    }
  }, [metric, minVal, maxVal]);

  const top5 = [...data].sort((a, b) => b[metricKey] - a[metricKey]).slice(0, 5);
  const top5Names = new Set(top5.map(d => d.state));

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);
    const zoom = d3Zoom.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        svg.select('g.map-group').attr('transform', event.transform);
      });
    svg.call(zoom);
  }, [indiaGeoJson]);

  const handleZoomIn = () => select(svgRef.current).transition().call(d3Zoom.zoom().scaleBy, 1.5);
  const handleZoomOut = () => select(svgRef.current).transition().call(d3Zoom.zoom().scaleBy, 0.75);
  const handleResetZoom = () => select(svgRef.current).transition().call(d3Zoom.zoom().transform, d3Zoom.zoomIdentity);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setSelectedState(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Use a fallback of 800x600 if the container is hidden or 0
        setDimensions({ 
          width: rect.width > 0 ? rect.width : 800, 
          height: rect.height > 0 ? rect.height : 600 
        });
      }
    };
    updateSize();
    // Use setTimeout to ensure we get the dimensions after the browser paints
    const timer = setTimeout(updateSize, 100);
    window.addEventListener('resize', updateSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const projection = useMemo(() => {
    if (!indiaGeoJson?.features) return null;
    const w = dimensions.width || 800;
    const h = dimensions.height || 600;
    return d3Geo.geoMercator().fitSize([w, h], indiaGeoJson);
  }, [dimensions, indiaGeoJson]);

  const pathGenerator = projection ? d3Geo.geoPath().projection(projection) : null;

  useEffect(() => {
    // Debug logs removed.
  }, [indiaGeoJson, dimensions, pathGenerator]);

  const handleOpenCase = (c) => {
    // Fill the React form inputs by triggering native setter and dispatching event
    const setInputValue = (name, value) => {
      const el = document.querySelector(`input[name="${name}"], select[name="${name}"]`);
      if (el) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set
          || Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")?.set;
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(el, value);
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    };
    setInputValue("case_id", c.case_id);
    setInputValue("state", selectedState.state);
    setInputValue("sector", c.sector);

    // Scroll to the Action/prediction form
    const riskSection = document.getElementById("risk");
    if (riskSection) {
      riskSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loadingMap || loadingData) {
    return (
      <div className="w-full h-[420px] lg:h-[600px] flex items-center justify-center bg-[#0b1220]/70 border border-white/10 rounded-[20px] animate-pulse">
        <div className="text-[#8b93b8] flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 mb-4 text-[#4dd0ff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Loading Heatmap Data...
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="w-full h-[420px] lg:h-[600px] flex items-center justify-center bg-[#0b1220]/70 border border-[#ec4899]/20 rounded-[20px]">
        <div className="text-[#ec4899] text-sm text-center">
          <strong className="block text-lg mb-2">Map Boundary Data Missing</strong>
          {mapError}
        </div>
      </div>
    );
  }

  const getDelay = (feature) => {
    if (!pathGenerator) return 0;
    const centroid = pathGenerator.centroid(feature);
    if (!centroid || isNaN(centroid[1])) return 0;
    const yPct = centroid[1] / dimensions.height;
    return yPct * 1.5;
  };

  const filteredCases = activeSector === "All" ? stateCases : stateCases.filter(c => c.sector === activeSector);

  // Sector stats
  let totalCasesInState = 0;
  const sectorCounts = {};
  if (selectedState && selectedState.sector_breakdown) {
    selectedState.sector_breakdown.forEach(s => {
      sectorCounts[s.sector] = s.cases;
      totalCasesInState += s.cases;
    });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full mt-12 mb-12 animate-in fade-in duration-1000">
      {/* Left Column: Map */}
      <div
        ref={containerRef}
        className="flex-1 bg-[#0b1220] border border-white/10 rounded-[20px] overflow-hidden relative shadow-2xl flex flex-col h-[420px] lg:h-[600px]"
      >
        <div className="absolute top-4 right-4 z-10 bg-[#0b1220]/90 backdrop-blur border border-white/10 p-1 rounded-full flex shadow-lg">
          <button
            onClick={() => setMetric('risk')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${metric === 'risk' ? 'bg-[#ec4899] text-white' : 'text-[#8b93b8] hover:text-white'}`}
          >
            Avg Risk %
          </button>
          <button
            onClick={() => setMetric('delay')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${metric === 'delay' ? 'bg-[#ec4899] text-white' : 'text-[#8b93b8] hover:text-white'}`}
          >
            Avg Delay Days
          </button>
        </div>

        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
          <button onClick={handleZoomIn} className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20">+</button>
          <button onClick={handleZoomOut} className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20">-</button>
          <button onClick={handleResetZoom} className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 text-xs">R</button>
        </div>

        <div className="absolute bottom-4 left-4 z-10 bg-[#0b1220]/90 backdrop-blur border border-white/10 p-4 rounded-xl shadow-lg pointer-events-none w-48">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3 border-b border-white/10 pb-2">{metric === 'risk' ? 'Risk Severity' : 'Delay Severity'}</h4>
          <div className="h-2 w-full rounded bg-gradient-to-r" style={{
            backgroundImage: metric === 'risk' ? 'linear-gradient(to right, #34d399, #facc15, #fb923c, #ec4899)' : 'linear-gradient(to right, #facc15, #fb923c, #ef4444)'
          }}></div>
          <div className="flex justify-between mt-2 text-[10px] text-[#8b93b8] font-bold">
            <span>{metric === 'risk' ? `${minVal.toFixed(1)}%` : `${minVal.toFixed(0)}d`}</span>
            <span>{metric === 'risk' ? `${maxVal.toFixed(1)}%` : `${maxVal.toFixed(0)}d`}</span>
          </div>
        </div>

        <svg
          ref={svgRef}
          width="100%"
          height="600px"
          viewBox={dimensions.width > 0 && dimensions.height > 0 ? `0 0 ${dimensions.width} ${dimensions.height}` : "0 0 800 600"}
          preserveAspectRatio="xMidYMid meet"
          className={`bg-[#0b1220] cursor-grab active:cursor-grabbing ${!isInView ? 'paused-animations' : ''}`}
          onMouseMove={(e) => {
            if (tooltipRef.current && containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              tooltipRef.current.style.top = `${e.clientY - rect.top - 10}px`;
              tooltipRef.current.style.left = `${e.clientX - rect.left + 20}px`;
            }
          }}
        >
          <defs>
            <style>
              {`
                @keyframes pulse-fill {
                  0% { opacity: 0.8; }
                  50% { opacity: 1; filter: drop-shadow(0 0 8px rgba(236,72,153,0.8)); }
                  100% { opacity: 0.8; }
                }
                .state-pulse {
                  animation: pulse-fill 3s infinite;
                }
                .paused-animations .state-pulse {
                  animation-play-state: paused;
                }
              `}
            </style>
          </defs>

          <g className="map-group">
            {pathGenerator && indiaGeoJson?.features?.map((feature, i) => {
              const matched = matchedData.find(d => d.feature === feature);
              if (matched) return null;
              return (
                <path
                  key={`unmatched-${i}`}
                  d={pathGenerator(feature)}
                  fill="#1f2937"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="0.5"
                  style={{ opacity: 1 }}
                />
              );
            })}

            {matchedData.map((d) => {
              const rank = top5.findIndex(s => s.state === d.state) + 1;
              const isTop5 = rank > 0;
              const isSelected = selectedState?.state === d.state;
              const isHovered = hoveredState?.state === d.state;

              const fill = colorScale(d[metricKey]);

              const styleObj = {
                animationDelay: `${getDelay(d.feature)}s`,
                fill: isHovered || isSelected ? '#ffffff' : fill,
                opacity: isSelected ? 1 : (selectedState ? 0.4 : 1),
                transition: 'fill 0.3s, opacity 1s, stroke-width 0.2s',
              };

              if (!pathGenerator) return null;
              const center = pathGenerator.centroid(d.feature);

              return (
                <g key={d.state}>
                  <path
                    d={pathGenerator(d.feature)}
                    style={styleObj}
                    stroke={isHovered || isSelected ? '#ffffff' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isHovered || isSelected ? "1.5" : "0.5"}
                    className={`${isTop5 && !selectedState ? 'state-pulse' : ''} outline-none cursor-pointer`}
                    onMouseEnter={() => setHoveredState(d)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedState(isSelected ? null : data.find(s => s.state === d.state));
                    }}
                  />
                  {isTop5 && !isNaN(center[0]) && (
                    <g style={{ opacity: 1, pointerEvents: 'none' }}>
                      <circle cx={center[0]} cy={center[1] - 8} r="6" fill="#000" opacity="0.6" />
                      <text x={center[0]} y={center[1] - 5} textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">
                        {rank}
                      </text>
                      <text x={center[0]} y={center[1] + 4} textAnchor="middle" fill="#ffffff" fontSize="8" style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}>
                        {d.state}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {hoveredState && !selectedState && (
          <div
            ref={tooltipRef}
            className="absolute z-50 pointer-events-none bg-white text-[#0b1220] p-3 rounded-xl shadow-2xl border border-white/20 min-w-[200px]"
            style={{ top: 0, left: 0 }}
          >
            <h3 className="font-bold text-sm mb-2 pb-1 border-b border-gray-200">{hoveredState.state}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="text-gray-500">Total Cases</div>
              <div className="font-bold text-right">{hoveredState.cases}</div>
              <div className="text-gray-500">Avg Risk</div>
              <div className="font-bold text-right text-[#ec4899]">{hoveredState.avg_risk_pct.toFixed(1)}%</div>
              <div className="text-gray-500">Avg Delay</div>
              <div className="font-bold text-right">{hoveredState.avg_delay_days.toFixed(0)} days</div>
              <div className="text-gray-500 col-span-2 mt-1 border-t border-gray-100 pt-1">Top Bottleneck</div>
              <div className="font-bold col-span-2 text-blue-600 truncate">{hoveredState.top_bottleneck}</div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Priority Queue */}
      <div className="lg:w-[400px] flex flex-col gap-4 shrink-0">
        <div className="bg-[#0b1220]/70 backdrop-blur-md border border-white/10 rounded-[20px] p-6 shadow-xl flex-1 flex flex-col transition-all duration-300 relative overflow-hidden">
          
          {selectedState ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
              <button onClick={() => setSelectedState(null)} className="absolute top-4 right-4 text-[#8b93b8] hover:text-white">✕</button>
              <h3 className="text-xs font-bold text-[#4dd0ff] uppercase tracking-widest mb-1">State Intelligence</h3>
              <h2 className="text-2xl font-bold text-white mb-4">{selectedState.state}</h2>

              {/* Stats row */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-[#8b93b8] uppercase tracking-wider mb-1">Avg Risk</div>
                  <div className="text-xl font-black text-[#ec4899]">{selectedState.avg_risk_pct.toFixed(1)}%</div>
                </div>
                <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-[#8b93b8] uppercase tracking-wider mb-1">High Risk Cases</div>
                  <div className="text-xl font-bold text-white">{selectedState.high_risk_cases}</div>
                </div>
              </div>

              {/* Sector Stacked Bar */}
              {selectedState.sector_breakdown && totalCasesInState > 0 && (
                <div className="mb-4">
                  <div className="flex w-full h-2 rounded-full overflow-hidden bg-white/5 mb-2">
                    {selectedState.sector_breakdown.map(s => (
                      <div 
                        key={s.sector} 
                        style={{ 
                          width: `${(s.cases / totalCasesInState) * 100}%`,
                          backgroundColor: SECTOR_COLORS[s.sector] || "#94a3b8"
                        }}
                        title={`${s.sector}: ${s.cases} cases`}
                      />
                    ))}
                  </div>
                  {/* Chips */}
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setActiveSector("All")}
                      className={`text-[10px] px-2 py-1 rounded-full border ${activeSector === "All" ? 'bg-white/20 border-white text-white' : 'border-white/10 text-[#8b93b8] hover:bg-white/10'}`}
                    >
                      All ({totalCasesInState})
                    </button>
                    {selectedState.sector_breakdown.map(s => {
                      const Icon = SECTOR_ICONS[s.sector];
                      return (
                        <button 
                          key={s.sector}
                          onClick={() => setActiveSector(s.sector)}
                          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border transition-colors ${activeSector === s.sector ? 'bg-white/20 text-white' : 'border-white/10 text-[#8b93b8] hover:bg-white/10'}`}
                          style={{ borderColor: activeSector === s.sector ? SECTOR_COLORS[s.sector] : '' }}
                        >
                          {Icon && <Icon size={10} style={{ color: SECTOR_COLORS[s.sector] }} />}
                          {s.sector} ({s.cases})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <h4 className="text-sm font-bold text-white uppercase tracking-widest mt-2 mb-3 border-b border-white/10 pb-2">Cases to review first</h4>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {loadingCases ? (
                  <div className="text-center text-[#8b93b8] py-8 text-sm animate-pulse">Loading priority queue...</div>
                ) : filteredCases.length === 0 ? (
                  <div className="text-center text-[#8b93b8] py-8 text-sm bg-white/5 rounded-xl border border-white/5">No cases found for this filter.</div>
                ) : (
                  filteredCases.map((c, idx) => {
                    const SectorIcon = SECTOR_ICONS[c.sector];
                    let pillColor = 'bg-[#34d399]/20 text-[#34d399]';
                    if (c.risk_level === 'Critical') pillColor = 'bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30';
                    else if (c.risk_level === 'High') pillColor = 'bg-[#f97316]/20 text-[#f97316] border-[#f97316]/30';
                    else if (c.risk_level === 'Medium') pillColor = 'bg-[#facc15]/20 text-[#facc15] border-[#facc15]/30';
                    
                    return (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/30 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#8b93b8] opacity-50 w-3">{idx + 1}</span>
                            <span className="text-white text-sm font-bold">{c.case_id}</span>
                            {SectorIcon && <SectorIcon size={14} style={{ color: SECTOR_COLORS[c.sector] }} className="ml-1" title={c.sector} />}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pillColor}`}>
                            {c.risk_pct.toFixed(1)}% {c.risk_level}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#8b93b8] mb-3 ml-5">
                          <span>Delay: <strong className="text-white">{c.expected_delay_days}d</strong></span>
                          <span className="truncate" title={c.top_driver}>Driver: <strong className="text-white">{c.top_driver}</strong></span>
                        </div>
                        <button 
                          onClick={() => handleOpenCase(c)}
                          className="ml-5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#4dd0ff] hover:text-white transition-colors"
                        >
                          <ExternalLink size={12} /> Open Case
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300 h-full flex flex-col">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                Top 5 States to review first
              </h3>

              <div className="space-y-4 flex-1">
                {top5.map((state, idx) => (
                  <div
                    key={state.state}
                    onClick={() => setSelectedState(state)}
                    className="group cursor-pointer bg-white/5 border border-white/5 rounded-xl p-4 hover:border-[#4dd0ff]/40 hover:bg-[#4dd0ff]/5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-[#8b93b8] opacity-50 w-3">{idx + 1}</span>
                        <span className="text-white text-sm font-bold group-hover:text-[#4dd0ff] transition-colors">{state.state}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded bg-[#05070f] ${metric === 'risk' ? 'text-[#ec4899]' : 'text-[#f97316]'}`}>
                        {metric === 'risk' ? `${state.avg_risk_pct.toFixed(1)}%` : `${state.avg_delay_days.toFixed(0)}d`}
                      </span>
                    </div>
                    <div className="pl-6 mb-2">
                      <span className="text-[10px] text-[#8b93b8]">High Risk Cases: <strong className="text-white">{state.high_risk_cases}</strong></span>
                    </div>
                    <div className="w-full bg-black/40 h-1.5 rounded-full mt-2 relative overflow-hidden ml-6" style={{ width: 'calc(100% - 1.5rem)' }}>
                      <div className="absolute h-full rounded-full" style={{ width: `${state.avg_risk_pct}%`, backgroundColor: colorScale(state.avg_risk_pct) }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-[9px] text-[#8b93b8] italic text-center leading-relaxed">
              Based on synthetic data (n = {data.length > 0 ? data.reduce((s, d) => s + d.cases, 0) : 0} cases). Risk attribution is analytical, not a legal determination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskHeatmap;
