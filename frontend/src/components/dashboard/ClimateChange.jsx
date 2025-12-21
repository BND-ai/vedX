import React, { useState } from 'react';
import './ClimateChange.css';
import { CLIMATE_DATA } from '../../data/mockData';
import { 
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup
} from 'react-simple-maps';
import { 
    MapPin, 
    AlertTriangle, 
    TrendingUp, 
    Droplets,
    Sun,
    Wind,
    Thermometer,
    CloudRain,
    Activity,
    X
} from 'lucide-react';

const ClimateChange = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedCommodity, setSelectedCommodity] = useState(null);
    const [viewLevel, setViewLevel] = useState(1); // 1: Map, 2: Commodity Dashboard, 3: Deep Dive
    const [mapProjection, setMapProjection] = useState('geoEqualEarth'); // Map projection type
    const [hoveredRegion, setHoveredRegion] = useState(null); // For tooltip

    // World map topology URL - using CDN
    const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

    // Country coordinates for markers
    const countryCoordinates = {
        'russia': [100, 60],
        'india': [78, 20],
        'brazil': [-51, -14],
        'usa': [-95, 37],
        'australia': [133, -27],
        'argentina': [-63, -38],
        'vietnam': [108, 14],
        'ukraine': [31, 49]
    };

    // Calculate summary statistics
    const activeEvents = CLIMATE_DATA.events?.filter(e => e.status === 'active').length || 0;
    const criticalEvents = CLIMATE_DATA.events?.filter(e => e.severity === 'critical').length || 0;
    const affectedCommodities = [...new Set(CLIMATE_DATA.events?.map(e => e.commodity))].length || 0;
    const supplyDisruptions = CLIMATE_DATA.events?.filter(e => e.supplyImpact === 'high').length || 0;
    const avgPriceImpact = CLIMATE_DATA.events?.reduce((sum, e) => sum + (e.priceImpact || 0), 0) / (CLIMATE_DATA.events?.length || 1);

    // Map projection configurations
    const projectionConfigs = {
        geoEqualEarth: { scale: 160, center: [0, 10] },
        geoMercator: { scale: 110, center: [0, 30] },
        geoNaturalEarth1: { scale: 150, center: [0, 0] },
        geoOrthographic: { scale: 240, center: [0, 0], rotate: [-30, -30, 0] }
    };

    // Map styling based on projection
    const getMapStyle = () => {
        switch(mapProjection) {
            case 'geoOrthographic':
                return {
                    geography: {
                        fill: '#3b7d3b', // Forest green for land
                        stroke: '#2d5f2d',
                        strokeWidth: 0.5
                    },
                    background: '#1e3a8a', // Deep ocean blue
                    ocean: true
                };
            case 'geoMercator':
                return {
                    geography: {
                        fill: '#5a9f5a', // Light green terrain
                        stroke: '#4a8f4a',
                        strokeWidth: 0.5
                    },
                    background: '#3b82f6', // Bright ocean blue
                    ocean: true
                };
            case 'geoNaturalEarth1':
                return {
                    geography: {
                        fill: '#7fb97f', // Natural earth green
                        stroke: '#6a9f6a',
                        strokeWidth: 0.5
                    },
                    background: '#60a5fa', // Sky blue ocean
                    ocean: true
                };
            default: // geoEqualEarth
                return {
                    geography: {
                        fill: '#6db66d', // Grass green
                        stroke: '#5da65d',
                        strokeWidth: 0.5
                    },
                    background: '#2563eb', // Ocean blue
                    ocean: true
                };
        }
    };

    const mapStyle = getMapStyle();

    const handleRegionClick = (region) => {
        setSelectedRegion(region);
        setViewLevel(2);
    };

    const handleCommodityClick = (commodity) => {
        setSelectedCommodity(commodity);
        setViewLevel(3);
    };

    const handleBack = () => {
        if (viewLevel === 3) {
            setViewLevel(2);
            setSelectedCommodity(null);
        } else if (viewLevel === 2) {
            setViewLevel(1);
            setSelectedRegion(null);
        }
    };

    const getRiskColor = (severity) => {
        switch(severity) {
            case 'critical': return '#ef4444';
            case 'high': return '#f97316';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getSeverityLabel = (severity) => {
        switch(severity) {
            case 'critical': return '🔴 Critical';
            case 'high': return '🟠 High';
            case 'medium': return '🟡 Medium';
            case 'low': return '🟢 Low';
            default: return '⚪ Unknown';
        }
    };

    // Level 1: Global Climate Risk Heatmap
    const renderLevel1 = () => (
        <div className="climate-level-1">
            {/* Stats Cards */}
            <div className="climate-stats-grid">
                <div className="climate-stat-card">
                    <div className="stat-icon" style={{background: '#fee2e2'}}>
                        <AlertTriangle size={18} color="#ef4444" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Active Weather Events</div>
                        <div className="stat-value">
                            {activeEvents} ongoing
                            <span className="stat-badge critical">{criticalEvents} critical</span>
                        </div>
                    </div>
                </div>

                <div className="climate-stat-card">
                    <div className="stat-icon" style={{background: '#fef3c7'}}>
                        <Activity size={18} color="#f59e0b" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Commodities at Risk</div>
                        <div className="stat-value">
                            {affectedCommodities} commodities
                            <span className="stat-subtext">Wheat, Rice, Corn, Soybean</span>
                        </div>
                    </div>
                </div>

                <div className="climate-stat-card">
                    <div className="stat-icon" style={{background: '#ffedd5'}}>
                        <MapPin size={18} color="#f97316" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Supply Chain Disruptions</div>
                        <div className="stat-value">
                            {supplyDisruptions} regions affected
                            <span className="stat-subtext">High impact areas</span>
                        </div>
                    </div>
                </div>

                <div className="climate-stat-card">
                    <div className="stat-icon" style={{background: '#dcfce7'}}>
                        <TrendingUp size={18} color="#10b981" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Price Impact This Month</div>
                        <div className="stat-value">
                            +{avgPriceImpact.toFixed(1)}%
                            <span className="stat-subtext">Average increase</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* World Map Section */}
            <div className="climate-map-section">
                <div className="section-header">
                    <div>
                        <h2>🌍 Global Climate Risk Map</h2>
                        <p>Click on a region to view detailed climate impact analysis</p>
                    </div>
                    <div className="map-view-selector">
                        <label htmlFor="projection-select">Map View:</label>
                        <select 
                            id="projection-select"
                            value={mapProjection} 
                            onChange={(e) => setMapProjection(e.target.value)}
                            className="projection-dropdown"
                        >
                            <option value="geoEqualEarth">Equal Earth (Default)</option>
                            <option value="geoMercator">Mercator</option>
                            <option value="geoNaturalEarth1">Natural Earth</option>
                            <option value="geoOrthographic">Globe View</option>
                        </select>
                    </div>
                </div>

                <div className="world-map-container">
                    {/* Risk Legend */}
                    <div className="map-legend">
                        <div className="legend-item">
                            <span className="legend-color" style={{background: '#ef4444'}}></span>
                            <span>Critical Risk</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{background: '#f97316'}}></span>
                            <span>High Risk</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{background: '#f59e0b'}}></span>
                            <span>Moderate Risk</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{background: '#10b981'}}></span>
                            <span>Stable</span>
                        </div>
                    </div>

                    {/* Interactive World Map */}
                    <div className="world-map" style={{background: mapStyle.background}}>
                        <ComposableMap
                            projection={mapProjection}
                            projectionConfig={projectionConfigs[mapProjection]}
                            width={800}
                            height={400}
                            style={{
                                width: "100%",
                                height: "auto"
                            }}
                        >
                            <ZoomableGroup zoom={1}>
                                <Geographies geography={geoUrl}>
                                    {({ geographies }) =>
                                        geographies.map((geo) => (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={mapStyle.geography.fill}
                                                stroke={mapStyle.geography.stroke}
                                                strokeWidth={mapStyle.geography.strokeWidth}
                                                style={{
                                                    default: { 
                                                        fill: mapStyle.geography.fill,
                                                        stroke: mapStyle.geography.stroke,
                                                        strokeWidth: mapStyle.geography.strokeWidth,
                                                        outline: 'none' 
                                                    },
                                                    hover: { 
                                                        fill: mapProjection === 'geoOrthographic' ? '#4a9f4a' : 
                                                              mapProjection === 'geoMercator' ? '#6ab96a' :
                                                              mapProjection === 'geoNaturalEarth1' ? '#8fc98f' : '#7dc97d',
                                                        stroke: mapStyle.geography.stroke,
                                                        strokeWidth: mapStyle.geography.strokeWidth,
                                                        outline: 'none' 
                                                    },
                                                    pressed: { 
                                                        fill: mapStyle.geography.fill,
                                                        stroke: mapStyle.geography.stroke,
                                                        strokeWidth: mapStyle.geography.strokeWidth,
                                                        outline: 'none' 
                                                    },
                                                }}
                                            />
                                        ))
                                    }
                                </Geographies>

                                {/* Climate Risk Markers */}
                                {CLIMATE_DATA.regions?.map((region) => {
                                    const coordinates = countryCoordinates[region.id];
                                    if (!coordinates) return null;

                                    return (
                                        <Marker
                                            key={region.id}
                                            coordinates={coordinates}
                                            onClick={() => handleRegionClick(region)}
                                            onMouseEnter={() => setHoveredRegion(region)}
                                            onMouseLeave={() => setHoveredRegion(null)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <circle
                                                r={8}
                                                fill={getRiskColor(region.riskLevel)}
                                                stroke="#fff"
                                                strokeWidth={1.5}
                                                style={{
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.setAttribute('r', 11);
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.setAttribute('r', 8);
                                                }}
                                            />
                                            <text
                                                textAnchor="middle"
                                                y={3}
                                                style={{
                                                    fontSize: '10px',
                                                    pointerEvents: 'none',
                                                    userSelect: 'none'
                                                }}
                                            >
                                                {region.icon}
                                            </text>
                                        </Marker>
                                    );
                                })}
                            </ZoomableGroup>
                        </ComposableMap>

                        {/* Tooltip on hover */}
                        {hoveredRegion && (
                            <div className="map-tooltip">
                                <div className="tooltip-header">
                                    <span className="tooltip-flag">{hoveredRegion.flag}</span>
                                    <span className="tooltip-name">{hoveredRegion.name}</span>
                                    <span 
                                        className="tooltip-risk" 
                                        style={{background: getRiskColor(hoveredRegion.riskLevel)}}
                                    >
                                        {hoveredRegion.riskLevel.toUpperCase()}
                                    </span>
                                </div>
                                <div className="tooltip-content">
                                    <div className="tooltip-item">
                                        <div className="tooltip-label">Climate Threat</div>
                                        <div className="tooltip-value">{hoveredRegion.primaryThreat}</div>
                                    </div>
                                    <div className="tooltip-item">
                                        <div className="tooltip-label">Affected Crops</div>
                                        <div className="tooltip-value">{hoveredRegion.affectedCommodities.join(', ')}</div>
                                    </div>
                                    <div className="tooltip-item">
                                        <div className="tooltip-label">Price Impact</div>
                                        <div className="tooltip-value impact-positive">+{hoveredRegion.priceImpact}%</div>
                                    </div>
                                </div>
                                <div className="tooltip-footer">
                                    Click for detailed analysis →
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Region Cards Below Map */}
                    <div className="region-cards-grid">
                            {CLIMATE_DATA.regions?.map(region => (
                                <div 
                                    key={region.id}
                                    className="region-card"
                                    onClick={() => handleRegionClick(region)}
                                    style={{borderLeft: `4px solid ${getRiskColor(region.riskLevel)}`}}
                                >
                                    <div className="region-header">
                                        <div className="region-flag">{region.flag}</div>
                                        <div className="region-info">
                                            <h3>{region.name}</h3>
                                            <span className="risk-badge" style={{background: getRiskColor(region.riskLevel)}}>
                                                {getSeverityLabel(region.riskLevel)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="region-details">
                                        <div className="detail-item">
                                            <CloudRain size={16} />
                                            <span>{region.primaryThreat}</span>
                                        </div>
                                        <div className="detail-item">
                                            <Activity size={16} />
                                            <span>{region.affectedCommodities.join(', ')}</span>
                                        </div>
                                        <div className="detail-item">
                                            <TrendingUp size={16} />
                                            <span>Price Impact: +{region.priceImpact}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            {/* Active Events Feed */}
            <div className="active-events-section">
                <h2>⚡ Active Climate Events</h2>
                <div className="events-list">
                    {CLIMATE_DATA.events?.filter(e => e.status === 'active').map(event => (
                        <div key={event.id} className="event-item">
                            <div className="event-severity" style={{background: getRiskColor(event.severity)}}>
                                {getSeverityLabel(event.severity).split(' ')[0]}
                            </div>
                            <div className="event-content">
                                <div className="event-title">
                                    {event.title}
                                    <span className="event-location">{event.region}</span>
                                </div>
                                <div className="event-meta">
                                    <span>{event.commodity}</span>
                                    <span>•</span>
                                    <span>Yield Impact: {event.yieldImpact}%</span>
                                    <span>•</span>
                                    <span>Started {event.daysAgo} days ago</span>
                                </div>
                            </div>
                            <div className="event-impact">
                                <div className="impact-value">+{event.priceImpact}%</div>
                                <div className="impact-label">Price Impact</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Level 2: Commodity Dashboard (to be built next)
    const renderLevel2 = () => {
        if (!selectedRegion) return null;

        // Get events for this region
        const regionEvents = CLIMATE_DATA.events?.filter(e => 
            e.region.toLowerCase().includes(selectedRegion.name.toLowerCase())
        ) || [];

        return (
            <div className="climate-level-2">
                <button className="back-button" onClick={handleBack}>
                    ← Back to Map
                </button>

                {/* Region Header */}
                <div className="level2-header">
                    <div className="header-left">
                        <span className="header-flag">{selectedRegion.flag}</span>
                        <div>
                            <h1>{selectedRegion.name} Climate Analysis</h1>
                            <p>Real-time climate events and commodity impacts</p>
                        </div>
                    </div>
                    <span 
                        className="header-risk-badge" 
                        style={{background: getRiskColor(selectedRegion.riskLevel)}}
                    >
                        {selectedRegion.riskLevel.toUpperCase()} RISK
                    </span>
                </div>

                {/* Event Timeline */}
                <div className="timeline-section">
                    <h2>Climate Event Timeline</h2>
                    <div className="timeline-container">
                        {regionEvents.map((event, index) => (
                            <div key={event.id} className="timeline-item">
                                <div className="timeline-marker" style={{background: getRiskColor(event.severity)}}></div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <h3>{event.title}</h3>
                                        <span className="timeline-date">{event.daysAgo} days ago</span>
                                    </div>
                                    <p className="timeline-description">{event.description}</p>
                                    <div className="timeline-forecast">
                                        <strong>Forecast:</strong> {event.forecast}
                                    </div>
                                    <div className="timeline-metrics">
                                        <div className="timeline-metric">
                                            <span>Yield:</span>
                                            <strong>{event.yieldImpact}%</strong>
                                        </div>
                                        <div className="timeline-metric">
                                            <span>Price:</span>
                                            <strong>+{event.priceImpact}%</strong>
                                        </div>
                                        <div className="timeline-metric">
                                            <span>Status:</span>
                                            <strong>{event.status}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Climate Indicators */}
                <div className="indicators-section">
                    <h2>Climate Indicators - {selectedRegion.name} Agricultural Belt</h2>
                    <div className="indicators-grid">
                        <div className="indicator-card">
                            <div className="indicator-icon" style={{background: '#fef3c7'}}>
                                <Thermometer size={24} color="#f59e0b" />
                            </div>
                            <div className="indicator-content">
                                <span className="indicator-label">Temperature Anomaly</span>
                                <span className="indicator-value">+1.8°C to +3.2°C</span>
                                <span className="indicator-subtext">Affected growing regions</span>
                            </div>
                        </div>
                        <div className="indicator-card">
                            <div className="indicator-icon" style={{background: '#dbeafe'}}>
                                <Droplets size={24} color="#3b82f6" />
                            </div>
                            <div className="indicator-content">
                                <span className="indicator-label">Precipitation Deficit</span>
                                <span className="indicator-value">-30% to -45%</span>
                                <span className="indicator-subtext">Critical agricultural zones</span>
                            </div>
                        </div>
                        <div className="indicator-card">
                            <div className="indicator-icon" style={{background: '#dcfce7'}}>
                                <Wind size={24} color="#16a34a" />
                            </div>
                            <div className="indicator-content">
                                <span className="indicator-label">Soil Moisture</span>
                                <span className="indicator-value">22% Below Normal</span>
                                <span className="indicator-subtext">Major crop areas</span>
                            </div>
                        </div>
                        <div className="indicator-card">
                            <div className="indicator-icon" style={{background: '#fce7f3'}}>
                                <Sun size={24} color="#ec4899" />
                            </div>
                            <div className="indicator-content">
                                <span className="indicator-label">Heat Stress Days</span>
                                <span className="indicator-value">18 days</span>
                                <span className="indicator-subtext">Above 35°C this month</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commodity Impact Cards */}
                <div className="commodity-impact-section">
                    <h2>Commodity Impact Overview</h2>
                    <div className="impact-cards-grid">
                        {selectedRegion.affectedCommodities.map((commodity, index) => {
                            const event = regionEvents.find(e => e.commodity.toLowerCase() === commodity.toLowerCase());
                            return (
                                <div key={index} className="impact-card" onClick={() => handleCommodityClick(event)}>
                                    <div className="impact-card-header">
                                        <span className="commodity-name">{commodity}</span>
                                        {event && (
                                            <span className="severity-badge" style={{background: getRiskColor(event.severity)}}>
                                                {event.severity}
                                            </span>
                                        )}
                                    </div>
                                    {event && (
                                        <>
                                            <div className="impact-metric">
                                                <span className="metric-label">Yield Impact</span>
                                                <span className="metric-value negative">{event.yieldImpact}%</span>
                                            </div>
                                            <div className="impact-metric">
                                                <span className="metric-label">Price Impact</span>
                                                <span className="metric-value positive">+{event.priceImpact}%</span>
                                            </div>
                                            <div className="impact-metric">
                                                <span className="metric-label">Supply Impact</span>
                                                <span className="metric-value">{event.supplyImpact}</span>
                                            </div>
                                            <div className="event-description">{event.description}</div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="actions-section">
                    <h2>Recommended Actions</h2>
                    <div className="actions-grid">
                        <div className="action-card">
                            <AlertTriangle size={20} color="#f59e0b" />
                            <div>
                                <h3>Monitor Daily</h3>
                                <p>Set up alerts for weather changes</p>
                            </div>
                        </div>
                        <div className="action-card">
                            <TrendingUp size={20} color="#10b981" />
                            <div>
                                <h3>Lock Prices</h3>
                                <p>Consider futures contracts now</p>
                            </div>
                        </div>
                        <div className="action-card">
                            <MapPin size={20} color="#3b82f6" />
                            <div>
                                <h3>Alternative Sources</h3>
                                <p>Explore backup suppliers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Level 3: Deep Intelligence View
    const renderLevel3 = () => {
        if (!selectedCommodity) return null;

        return (
            <div className="climate-level-3">
                <button className="back-button" onClick={handleBack}>
                    ← Back to Dashboard
                </button>

                {/* Header */}
                <div className="level3-header">
                    <div className="header-left">
                        <div className="commodity-icon-large">{selectedRegion?.icon}</div>
                        <div>
                            <h1>{selectedCommodity.commodity} Deep Intelligence</h1>
                            <p>{selectedRegion?.name} • {selectedCommodity.region}</p>
                        </div>
                    </div>
                    <div className="severity-badge-large" style={{background: getRiskColor(selectedCommodity.severity)}}>
                        {selectedCommodity.severity.toUpperCase()} EVENT
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="level3-grid">
                    {/* Left Panel: Climate Science */}
                    <div className="level3-left-panel">
                        {/* Weather Timeline */}
                        <div className="section-card">
                            <h2>Weather Timeline & Forecast</h2>
                            
                            <div className="forecast-tabs">
                                <button className="forecast-tab active">7-Day</button>
                                <button className="forecast-tab">30-Day</button>
                                <button className="forecast-tab">90-Day</button>
                            </div>

                            <div className="weather-timeline">
                                {[
                                    {day: 'Mon', temp: '38°C', rain: '0mm', icon: '☀️', condition: 'Clear'},
                                    {day: 'Tue', temp: '39°C', rain: '0mm', icon: '☀️', condition: 'Hot'},
                                    {day: 'Wed', temp: '37°C', rain: '2mm', icon: '⛅', condition: 'Partly Cloudy'},
                                    {day: 'Thu', temp: '35°C', rain: '5mm', icon: '🌧️', condition: 'Light Rain'},
                                    {day: 'Fri', temp: '33°C', rain: '12mm', icon: '🌧️', condition: 'Rain'},
                                    {day: 'Sat', temp: '31°C', rain: '8mm', icon: '⛅', condition: 'Clearing'},
                                    {day: 'Sun', temp: '32°C', rain: '3mm', icon: '⛅', condition: 'Partly Cloudy'}
                                ].map((day, i) => (
                                    <div key={i} className="weather-day">
                                        <div className="day-name">{day.day}</div>
                                        <div className="day-icon">{day.icon}</div>
                                        <div className="day-temp">{day.temp}</div>
                                        <div className="day-rain">{day.rain}</div>
                                        <div className="day-condition">{day.condition}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="forecast-summary">
                                <AlertTriangle size={16} color="#f59e0b" />
                                <p>Extended heat wave continues. Minimal rainfall expected through week 2.</p>
                            </div>
                        </div>

                        {/* Agricultural Impact */}
                        <div className="section-card">
                            <h2>Agricultural Impact Analysis</h2>
                            
                            <div className="impact-grid">
                                <div className="impact-item">
                                    <div className="impact-item-header">
                                        <span className="impact-label">Crop Growth Stage</span>
                                        <span className="impact-status critical">Critical</span>
                                    </div>
                                    <div className="impact-value">Flowering / Grain Fill</div>
                                    <div className="impact-note">Most vulnerable stage to heat stress</div>
                                </div>

                                <div className="impact-item">
                                    <div className="impact-item-header">
                                        <span className="impact-label">Water Stress Index</span>
                                        <span className="impact-status high">High</span>
                                    </div>
                                    <div className="impact-value">7.8 / 10</div>
                                    <div className="impact-note">Severe moisture deficit in root zone</div>
                                </div>

                                <div className="impact-item">
                                    <div className="impact-item-header">
                                        <span className="impact-label">Soil Condition</span>
                                        <span className="impact-status high">Poor</span>
                                    </div>
                                    <div className="impact-value">18% Moisture Content</div>
                                    <div className="impact-note">35% below optimal for this stage</div>
                                </div>

                                <div className="impact-item">
                                    <div className="impact-item-header">
                                        <span className="impact-label">Harvest Delays</span>
                                        <span className="impact-status medium">Likely</span>
                                    </div>
                                    <div className="impact-value">2-3 Weeks Expected</div>
                                    <div className="impact-note">Quality degradation anticipated</div>
                                </div>
                            </div>
                        </div>

                        {/* Satellite Imagery */}
                        <div className="section-card">
                            <h2>Satellite Analysis</h2>
                            
                            <div className="satellite-comparison">
                                <div className="satellite-image">
                                    <div className="image-placeholder">
                                        <MapPin size={48} color="#999" />
                                        <p>Before: April 2025</p>
                                        <div className="ndvi-badge green">NDVI: 0.78</div>
                                    </div>
                                </div>
                                <div className="satellite-image">
                                    <div className="image-placeholder">
                                        <MapPin size={48} color="#999" />
                                        <p>Current: Nov 2025</p>
                                        <div className="ndvi-badge red">NDVI: 0.42</div>
                                    </div>
                                </div>
                            </div>

                            <div className="satellite-metrics">
                                <div className="metric">
                                    <span className="metric-label">Vegetation Health</span>
                                    <div className="metric-bar">
                                        <div className="metric-fill" style={{width: '42%', background: '#ef4444'}}></div>
                                    </div>
                                    <span className="metric-value">42% (Down from 78%)</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Affected Area</span>
                                    <div className="metric-bar">
                                        <div className="metric-fill" style={{width: '65%', background: '#f59e0b'}}></div>
                                    </div>
                                    <span className="metric-value">2.4M hectares</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Trading Intelligence */}
                    <div className="level3-right-panel">
                        {/* Price Impact Analysis */}
                        <div className="section-card">
                            <h2>Price Impact & Forecast</h2>
                            
                            <div className="price-summary">
                                <div className="current-price">
                                    <span className="price-label">Current Price</span>
                                    <span className="price-value">${(285 + selectedCommodity.priceImpact * 5).toFixed(2)}/ton</span>
                                    <span className="price-change positive">+{selectedCommodity.priceImpact}% (${selectedCommodity.priceImpact * 5}/ton)</span>
                                </div>
                            </div>

                            <div className="price-forecast">
                                <div className="forecast-item">
                                    <span className="forecast-period">Next 30 Days</span>
                                    <span className="forecast-range">$305 - $325/ton</span>
                                    <span className="forecast-trend">+8-12%</span>
                                </div>
                                <div className="forecast-item">
                                    <span className="forecast-period">Next 90 Days</span>
                                    <span className="forecast-range">$320 - $360/ton</span>
                                    <span className="forecast-trend">+15-22%</span>
                                </div>
                                <div className="forecast-item">
                                    <span className="forecast-period">Harvest Season</span>
                                    <span className="forecast-range">$340 - $380/ton</span>
                                    <span className="forecast-trend">+18-28%</span>
                                </div>
                            </div>
                        </div>

                        {/* Supply Chain Impact */}
                        <div className="section-card">
                            <h2>Supply Chain Disruptions</h2>
                            
                            <div className="supply-routes">
                                <div className="route-item">
                                    <div className="route-header">
                                        <span className="route-name">Black Sea Corridor</span>
                                        <span className="route-status high">High Risk</span>
                                    </div>
                                    <div className="route-impact">Expected delay: 2-3 weeks</div>
                                </div>
                                <div className="route-item">
                                    <div className="route-header">
                                        <span className="route-name">Rail Transport</span>
                                        <span className="route-status medium">Moderate</span>
                                    </div>
                                    <div className="route-impact">Capacity reduced 35%</div>
                                </div>
                                <div className="route-item">
                                    <div className="route-header">
                                        <span className="route-name">Port Operations</span>
                                        <span className="route-status medium">Moderate</span>
                                    </div>
                                    <div className="route-impact">Loading delays 5-7 days</div>
                                </div>
                            </div>

                            <div className="supply-summary">
                                <div className="supply-stat">
                                    <span className="stat-label">Export Volume Impact</span>
                                    <span className="stat-value negative">-{selectedCommodity.yieldImpact}%</span>
                                </div>
                                <div className="supply-stat">
                                    <span className="stat-label">Global Market Share</span>
                                    <span className="stat-value">18.5% → 13.2%</span>
                                </div>
                            </div>
                        </div>

                        {/* Trading Recommendations */}
                        <div className="section-card recommendations-card">
                            <h2>Actionable Recommendations</h2>
                            
                            <div className="recommendations-list">
                                <div className="recommendation-item urgent">
                                    <div className="recommendation-header">
                                        <AlertTriangle size={20} color="#ef4444" />
                                        <span className="recommendation-title">Immediate Action Required</span>
                                    </div>
                                    <p>Lock in forward contracts for Q1 2026 delivery at current +{selectedCommodity.priceImpact}% premium. Prices likely to surge another 15-20% within 30 days.</p>
                                    <button className="action-button primary">Lock Prices Now</button>
                                </div>

                                <div className="recommendation-item high">
                                    <div className="recommendation-header">
                                        <TrendingUp size={20} color="#f59e0b" />
                                        <span className="recommendation-title">Diversification Strategy</span>
                                    </div>
                                    <p>Secure alternative sources from Argentina (+8% capacity) and Australia (stable supply). Expect 5-8% premium but guaranteed delivery.</p>
                                    <button className="action-button secondary">View Alternatives</button>
                                </div>

                                <div className="recommendation-item medium">
                                    <div className="recommendation-header">
                                        <MapPin size={20} color="#3b82f6" />
                                        <span className="recommendation-title">Inventory Management</span>
                                    </div>
                                    <p>Increase safety stock by 45% to buffer against supply disruptions. Consider early procurement for Q2 2026 requirements.</p>
                                    <button className="action-button secondary">Calculate Buffer</button>
                                </div>
                            </div>
                        </div>

                        {/* Expert Commentary */}
                        <div className="section-card">
                            <h2>Expert Commentary</h2>
                            
                            <div className="expert-feed">
                                <div className="expert-comment">
                                    <div className="expert-meta">
                                        <span className="expert-name">Dr. Sarah Chen</span>
                                        <span className="expert-role">Agricultural Meteorologist</span>
                                        <span className="comment-time">2 hours ago</span>
                                    </div>
                                    <p>"The prolonged drought in Russia's wheat belt is unprecedented. Similar patterns in 2010 led to 40% price increases. Current trajectory suggests even more severe impact."</p>
                                </div>

                                <div className="expert-comment">
                                    <div className="expert-meta">
                                        <span className="expert-name">Michael Torres</span>
                                        <span className="expert-role">Commodity Trader, AgriGlobal</span>
                                        <span className="comment-time">5 hours ago</span>
                                    </div>
                                    <p>"We're seeing panic buying from major importers. Forward contracts for Q1 2026 are being snapped up. This is a clear signal to act now."</p>
                                </div>
                            </div>
                        </div>

                        {/* Historical Case Studies */}
                        <div className="section-card">
                            <h2>Historical Comparisons</h2>
                            
                            <div className="case-study">
                                <div className="case-header">
                                    <span className="case-title">Russia Drought 2010</span>
                                    <span className="case-similarity">82% Similar</span>
                                </div>
                                <div className="case-outcome">
                                    <span>Price Impact: +47%</span>
                                    <span>Duration: 6 months</span>
                                    <span>Yield Loss: -25%</span>
                                </div>
                            </div>

                            <div className="case-study">
                                <div className="case-header">
                                    <span className="case-title">Australia Drought 2018</span>
                                    <span className="case-similarity">65% Similar</span>
                                </div>
                                <div className="case-outcome">
                                    <span>Price Impact: +32%</span>
                                    <span>Duration: 8 months</span>
                                    <span>Yield Loss: -18%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="climate-change-container">
            <div className="climate-header">
                <div className="header-content">
                    <h1>🌡️ Climate Impact Intelligence</h1>
                    <p>Real-time climate events and their impact on commodity markets</p>
                </div>
            </div>

            {viewLevel === 1 && renderLevel1()}
            {viewLevel === 2 && renderLevel2()}
            {viewLevel === 3 && renderLevel3()}
        </div>
    );
};

export default ClimateChange;
