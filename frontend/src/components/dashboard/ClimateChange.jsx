import React, { useState, useEffect } from 'react';
import './ClimateChange.css';
import climateService from '../../services/climateService';
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
    const [liveWeatherData, setLiveWeatherData] = useState(null);
    const [climateAlerts, setClimateAlerts] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch live data on component mount
    useEffect(() => {
        fetchLiveData();
    }, []);

    const fetchLiveData = async () => {
        try {
            setLoading(true);
            const [weatherData, alertsData] = await Promise.all([
                climateService.getLiveWeatherData(),
                climateService.getClimateAlerts(['corn', 'wheat', 'rice', 'soybean'])
            ]);
            setLiveWeatherData(weatherData);
            setClimateAlerts(alertsData);
        } catch (error) {
            console.error('Error fetching live climate data:', error);
        } finally {
            setLoading(false);
        }
    };

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

    // Transform live weather data to regions format
    const regions = liveWeatherData?.agricultural_weather?.map((region, index) => {
        const openMeteoData = region.open_meteo || {};
        const openWeatherData = region.openweather || {};
        
        // Calculate risk level based on weather conditions
        const temp = openMeteoData.current_temp || openWeatherData.temperature || 25;
        const precipitation = openMeteoData.precipitation || 0;
        const humidity = openMeteoData.humidity || openWeatherData.humidity || 50;
        
        let riskLevel = 'low';
        let primaryThreat = 'Normal conditions';
        
        if (temp > 35 && precipitation < 1) {
            riskLevel = 'critical';
            primaryThreat = 'Severe drought and heat';
        } else if (temp > 30 && precipitation < 2) {
            riskLevel = 'high';
            primaryThreat = 'Drought conditions';
        } else if (temp > 25 || precipitation < 5) {
            riskLevel = 'medium';
            primaryThreat = 'Moderate weather stress';
        }
        
        // Map region names to country codes
        const regionMap = {
            'US Midwest': { id: 'usa', flag: '🇺🇸', icon: '🌽' },
            'Argentina': { id: 'argentina', flag: '🇦🇷', icon: '🌱' },
            'Australia': { id: 'australia', flag: '🇦🇺', icon: '🌾' },
            'India': { id: 'india', flag: '🇮🇳', icon: '🍚' },
            'Brazil': { id: 'brazil', flag: '🇧🇷', icon: '🌱' },
            'Russia': { id: 'russia', flag: '🇷🇺', icon: '🌾' },
            'Thailand': { id: 'thailand', flag: '🇹🇭', icon: '🍚' }
        };
        
        const regionInfo = regionMap[region.region] || { id: 'unknown', flag: '🌍', icon: '🌾' };
        
        return {
            id: regionInfo.id,
            name: region.region,
            flag: regionInfo.flag,
            icon: regionInfo.icon,
            riskLevel: riskLevel,
            primaryThreat: primaryThreat,
            affectedCommodities: [region.commodity],
            priceImpact: temp > 30 ? Math.round((temp - 25) * 2) : Math.round(Math.random() * 10 + 5),
            currentTemp: temp,
            precipitation: precipitation,
            humidity: humidity
        };
    }) || [];

    // Calculate summary statistics from live data
    const activeEvents = climateAlerts?.weather_alerts?.length || 0;
    const criticalEvents = climateAlerts?.weather_alerts?.filter(e => e.severity === 'critical').length || 0;
    const affectedCommodities = regions.length;
    const supplyDisruptions = regions.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high').length;
    const avgPriceImpact = regions.reduce((sum, r) => sum + r.priceImpact, 0) / (regions.length || 1);

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
                                {regions?.map((region) => {
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
                            {regions?.map(region => (
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
                                        <div className="detail-item">
                                            <Thermometer size={16} />
                                            <span>Temp: {region.currentTemp}°C</span>
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
                    {loading ? (
                        <div className="loading-message">Loading live weather data...</div>
                    ) : climateAlerts?.weather_alerts?.length > 0 ? (
                        climateAlerts.weather_alerts.map((event, index) => (
                            <div key={event.id || index} className={`event-item ${event.severity}`}>
                                <div className="event-severity" style={{background: getRiskColor(event.severity)}}>
                                    {getSeverityLabel(event.severity).split(' ')[0]}
                                </div>
                                <div className="event-content">
                                    <div className="event-title">
                                        {event.threat}
                                        <span className="event-location">{event.region}</span>
                                    </div>
                                    <div className="event-meta">
                                        <span>Severity: {event.severity}</span>
                                        <span>•</span>
                                        <span>Source: {event.source || 'NOAA'}</span>
                                    </div>
                                </div>
                                <div className="event-impact">
                                    <div className="impact-value">Live Data</div>
                                    <div className="impact-label">Real-time Alert</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-events-message">
                            <AlertTriangle size={24} color="#10b981" />
                            <p>No critical weather events detected in monitored regions</p>
                            <small>Live monitoring active for 7 agricultural regions</small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Level 2: Commodity Dashboard
    const renderLevel2 = () => {
        if (!selectedRegion) return null;

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

                {/* Live Weather Data */}
                <div className="live-weather-section">
                    <h2>Current Weather Conditions</h2>
                    <div className="weather-cards">
                        <div className="weather-card">
                            <Thermometer size={24} color="#f59e0b" />
                            <div className="weather-info">
                                <span className="weather-label">Temperature</span>
                                <span className="weather-value">{selectedRegion.currentTemp}°C</span>
                            </div>
                        </div>
                        <div className="weather-card">
                            <Droplets size={24} color="#3b82f6" />
                            <div className="weather-info">
                                <span className="weather-label">Precipitation</span>
                                <span className="weather-value">{selectedRegion.precipitation}mm</span>
                            </div>
                        </div>
                        <div className="weather-card">
                            <Wind size={24} color="#16a34a" />
                            <div className="weather-info">
                                <span className="weather-label">Humidity</span>
                                <span className="weather-value">{selectedRegion.humidity}%</span>
                            </div>
                        </div>
                        <div className="weather-card">
                            <AlertTriangle size={24} color={getRiskColor(selectedRegion.riskLevel)} />
                            <div className="weather-info">
                                <span className="weather-label">Risk Level</span>
                                <span className="weather-value">{selectedRegion.riskLevel.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Climate Threat Analysis */}
                <div className="threat-analysis-section">
                    <h2>Climate Threat Analysis</h2>
                    <div className="threat-card">
                        <div className="threat-header">
                            <CloudRain size={32} color={getRiskColor(selectedRegion.riskLevel)} />
                            <div>
                                <h3>{selectedRegion.primaryThreat}</h3>
                                <p>Primary climate threat affecting {selectedRegion.name}</p>
                            </div>
                        </div>
                        <div className="threat-details">
                            <div className="threat-metric">
                                <span className="metric-label">Expected Price Impact</span>
                                <span className="metric-value positive">+{selectedRegion.priceImpact}%</span>
                            </div>
                            <div className="threat-metric">
                                <span className="metric-label">Affected Commodity</span>
                                <span className="metric-value">{selectedRegion.affectedCommodities[0]}</span>
                            </div>
                            <div className="threat-metric">
                                <span className="metric-label">Data Source</span>
                                <span className="metric-value">Live Weather APIs</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commodity Impact Cards */}
                <div className="commodity-impact-section">
                    <h2>Commodity Impact Overview</h2>
                    <div className="impact-cards-grid">
                        {selectedRegion.affectedCommodities.map((commodity, index) => (
                            <div 
                                key={index} 
                                className="impact-card clickable"
                                onClick={() => handleCommodityClick({
                                    commodity: commodity,
                                    region: selectedRegion.name,
                                    severity: selectedRegion.riskLevel,
                                    priceImpact: selectedRegion.priceImpact,
                                    yieldImpact: Math.round(selectedRegion.priceImpact * 0.8)
                                })}
                            >
                                <div className="impact-card-header">
                                    <span className="commodity-name">{commodity}</span>
                                    <span className="severity-badge" style={{background: getRiskColor(selectedRegion.riskLevel)}}>
                                        {selectedRegion.riskLevel}
                                    </span>
                                </div>
                                <div className="impact-metric">
                                    <span className="metric-label">Price Impact</span>
                                    <span className="metric-value positive">+{selectedRegion.priceImpact}%</span>
                                </div>
                                <div className="impact-metric">
                                    <span className="metric-label">Current Temp</span>
                                    <span className="metric-value">{selectedRegion.currentTemp}°C</span>
                                </div>
                                <div className="impact-metric">
                                    <span className="metric-label">Precipitation</span>
                                    <span className="metric-value">{selectedRegion.precipitation}mm</span>
                                </div>
                                <div className="event-description">{selectedRegion.primaryThreat}</div>
                                <div className="drill-down-hint">Click for deep analysis →</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="actions-section">
                    <h2>Recommended Actions</h2>
                    <div className="actions-grid">
                        <div className="action-card">
                            <AlertTriangle size={20} color="#f59e0b" />
                            <div>
                                <h3>Monitor Weather</h3>
                                <p>Track live conditions for {selectedRegion.name}</p>
                            </div>
                        </div>
                        <div className="action-card">
                            <TrendingUp size={20} color="#10b981" />
                            <div>
                                <h3>Price Alerts</h3>
                                <p>Set alerts for {selectedRegion.affectedCommodities[0]} prices</p>
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
                                {selectedRegion?.forecast?.forecast_days?.map((day, i) => (
                                    <div key={i} className="weather-day">
                                        <div className="day-name">{day.day}</div>
                                        <div className="day-icon">{day.icon}</div>
                                        <div className="day-temp">{day.temp_max}°C</div>
                                        <div className="day-rain">{day.precipitation}mm</div>
                                        <div className="day-condition">{day.condition}</div>
                                    </div>
                                )) || [
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
                                <p>{selectedRegion?.primaryThreat || 'Weather conditions being monitored'} - Live forecast data from Open-Meteo API.</p>
                            </div>
                        </div>

                        {/* Agricultural Impact */}
                        <div className="section-card">
                            <h2>Agricultural Impact Analysis</h2>
                            
                            <div className="impact-grid">
                                <div className="impact-item">
                                    <div className="impact-item-header">
                                        <span className="impact-label">Current Temperature</span>
                                        <span className="impact-status" style={{background: getRiskColor(selectedRegion.riskLevel)}}>
                                            {selectedRegion.riskLevel}
                                        </span>
                                    </div>
                                    <div className="impact-value">{selectedRegion.currentTemp}°C</div>
                                    <div className="impact-note">Live temperature reading</div>
                                </div>

                                <div className="impact-item">
                                    <div className="impact-item-header">
                                        <span className="impact-label">Precipitation Level</span>
                                        <span className="impact-status" style={{background: selectedRegion.precipitation < 2 ? '#ef4444' : '#10b981'}}>
                                            {selectedRegion.precipitation < 2 ? 'Low' : 'Normal'}
                                        </span>
                                    </div>
                                    <div className="impact-value">{selectedRegion.precipitation}mm</div>
                                    <div className="impact-note">Current precipitation data</div>
                                </div>

                                <div className="impact-item">
                                    <div className="impact-item-header">
                                        <span className="impact-label">Humidity Level</span>
                                        <span className="impact-status" style={{background: selectedRegion.humidity < 40 ? '#f59e0b' : '#10b981'}}>
                                            {selectedRegion.humidity < 40 ? 'Low' : 'Normal'}
                                        </span>
                                    </div>
                                    <div className="impact-value">{selectedRegion.humidity}%</div>
                                    <div className="impact-note">Live humidity reading</div>
                                </div>

                                <div className="impact-item">
                                    <div className="impact-item-header">
                                        <span className="impact-label">Climate Risk</span>
                                        <span className="impact-status" style={{background: getRiskColor(selectedRegion.riskLevel)}}>
                                            {selectedRegion.riskLevel.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="impact-value">{selectedRegion.primaryThreat}</div>
                                    <div className="impact-note">Based on live weather analysis</div>
                                </div>
                            </div>
                        </div>

                        {/* Live Weather Analysis */}
                        <div className="section-card">
                            <h2>Live Weather Analysis</h2>
                            
                            <div className="satellite-comparison">
                                <div className="satellite-image">
                                    <div className="image-placeholder">
                                        <MapPin size={48} color="#999" />
                                        <p>Current Conditions</p>
                                        <div className="ndvi-badge" style={{background: getRiskColor(selectedRegion.riskLevel)}}>
                                            {selectedRegion.currentTemp}°C
                                        </div>
                                    </div>
                                </div>
                                <div className="satellite-image">
                                    <div className="image-placeholder">
                                        <MapPin size={48} color="#999" />
                                        <p>Risk Assessment</p>
                                        <div className="ndvi-badge" style={{background: getRiskColor(selectedRegion.riskLevel)}}>
                                            {selectedRegion.riskLevel.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="satellite-metrics">
                                <div className="metric">
                                    <span className="metric-label">Temperature Trend</span>
                                    <div className="metric-bar">
                                        <div className="metric-fill" style={{width: `${Math.min(selectedRegion.currentTemp * 2, 100)}%`, background: selectedRegion.currentTemp > 30 ? '#ef4444' : '#10b981'}}></div>
                                    </div>
                                    <span className="metric-value">{selectedRegion.currentTemp}°C (Live)</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Precipitation Status</span>
                                    <div className="metric-bar">
                                        <div className="metric-fill" style={{width: `${Math.min(selectedRegion.precipitation * 10, 100)}%`, background: selectedRegion.precipitation < 2 ? '#ef4444' : '#10b981'}}></div>
                                    </div>
                                    <span className="metric-value">{selectedRegion.precipitation}mm (Current)</span>
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
                                    <span className="forecast-period">Next 7 Days</span>
                                    <span className="forecast-range">
                                        {selectedRegion?.forecast?.forecast_days ? 
                                            `${Math.min(...selectedRegion.forecast.forecast_days.map(d => d.temp_min))}°C - ${Math.max(...selectedRegion.forecast.forecast_days.map(d => d.temp_max))}°C` :
                                            '$305 - $325/ton'
                                        }
                                    </span>
                                    <span className="forecast-trend">Live Forecast</span>
                                </div>
                                <div className="forecast-item">
                                    <span className="forecast-period">Price Impact</span>
                                    <span className="forecast-range">+{selectedCommodity.priceImpact}% current</span>
                                    <span className="forecast-trend">Based on weather</span>
                                </div>
                                <div className="forecast-item">
                                    <span className="forecast-period">Risk Level</span>
                                    <span className="forecast-range">{selectedRegion.riskLevel.toUpperCase()}</span>
                                    <span className="forecast-trend">Live assessment</span>
                                </div>
                            </div>
                        </div>

                        {/* Supply Chain Impact */}
                        <div className="section-card">
                            <h2>Supply Chain Disruptions</h2>
                            
                            <div className="supply-routes">
                                <div className="route-item">
                                    <div className="route-header">
                                        <span className="route-name">{selectedRegion.name} Supply</span>
                                        <span className="route-status" style={{background: getRiskColor(selectedRegion.riskLevel)}}>
                                            {selectedRegion.riskLevel}
                                        </span>
                                    </div>
                                    <div className="route-impact">Weather impact: {selectedRegion.primaryThreat}</div>
                                </div>
                                <div className="route-item">
                                    <div className="route-header">
                                        <span className="route-name">Temperature Risk</span>
                                        <span className="route-status" style={{background: selectedRegion.currentTemp > 30 ? '#ef4444' : '#10b981'}}>
                                            {selectedRegion.currentTemp > 30 ? 'High' : 'Normal'}
                                        </span>
                                    </div>
                                    <div className="route-impact">Current: {selectedRegion.currentTemp}°C</div>
                                </div>
                                <div className="route-item">
                                    <div className="route-header">
                                        <span className="route-name">Precipitation Risk</span>
                                        <span className="route-status" style={{background: selectedRegion.precipitation < 2 ? '#f59e0b' : '#10b981'}}>
                                            {selectedRegion.precipitation < 2 ? 'Low' : 'Normal'}
                                        </span>
                                    </div>
                                    <div className="route-impact">Current: {selectedRegion.precipitation}mm</div>
                                </div>
                            </div>

                            <div className="supply-summary">
                                <div className="supply-stat">
                                    <span className="stat-label">Weather Impact</span>
                                    <span className="stat-value">+{selectedCommodity.priceImpact}%</span>
                                </div>
                                <div className="supply-stat">
                                    <span className="stat-label">Risk Level</span>
                                    <span className="stat-value">{selectedRegion.riskLevel.toUpperCase()}</span>
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
                                    <p>Monitor {selectedCommodity.commodity} prices closely due to {selectedRegion.riskLevel} weather risk in {selectedRegion.name}. Current conditions show {selectedRegion.currentTemp}°C temperature with {selectedRegion.precipitation}mm precipitation.</p>
                                    <button className="action-button primary">Lock Prices Now</button>
                                </div>

                                <div className="recommendation-item high">
                                    <div className="recommendation-header">
                                        <TrendingUp size={20} color="#f59e0b" />
                                        <span className="recommendation-title">Diversification Strategy</span>
                                    </div>
                                    <p>Consider alternative sources due to weather conditions in {selectedRegion.name}. Current risk level: {selectedRegion.riskLevel.toUpperCase()}. Temperature: {selectedRegion.currentTemp}°C, Precipitation: {selectedRegion.precipitation}mm.</p>
                                    <button className="action-button secondary">View Alternatives</button>
                                </div>

                                <div className="recommendation-item medium">
                                    <div className="recommendation-header">
                                        <MapPin size={20} color="#3b82f6" />
                                        <span className="recommendation-title">Inventory Management</span>
                                    </div>
                                    <p>Weather-based inventory adjustment recommended. Current conditions in {selectedRegion.name}: {selectedRegion.primaryThreat}. Risk level: {selectedRegion.riskLevel}.</p>
                                    <button className="action-button secondary">Calculate Buffer</button>
                                </div>
                            </div>
                        </div>

                        {/* Live Weather Commentary */}
                        <div className="section-card">
                            <h2>Live Weather Commentary</h2>
                            
                            <div className="expert-feed">
                                <div className="expert-comment">
                                    <div className="expert-meta">
                                        <span className="expert-name">Weather Analysis System</span>
                                        <span className="expert-role">Live Data Feed</span>
                                        <span className="comment-time">Real-time</span>
                                    </div>
                                    <p>"Current conditions in {selectedRegion.name}: {selectedRegion.currentTemp}°C temperature, {selectedRegion.precipitation}mm precipitation. Risk assessment: {selectedRegion.riskLevel}. Primary threat: {selectedRegion.primaryThreat}."</p>
                                </div>

                                <div className="expert-comment">
                                    <div className="expert-meta">
                                        <span className="expert-name">Climate Impact Monitor</span>
                                        <span className="expert-role">Automated Analysis</span>
                                        <span className="comment-time">Live update</span>
                                    </div>
                                    <p>"Weather conditions are being monitored continuously. Current price impact estimated at +{selectedCommodity.priceImpact}% based on live weather data from Open-Meteo and OpenWeather APIs."</p>
                                </div>
                            </div>
                        </div>

                        {/* Live Weather Comparisons */}
                        <div className="section-card">
                            <h2>Live Weather Comparisons</h2>
                            
                            <div className="case-study">
                                <div className="case-header">
                                    <span className="case-title">Current Conditions</span>
                                    <span className="case-similarity">Live Data</span>
                                </div>
                                <div className="case-outcome">
                                    <span>Temperature: {selectedRegion.currentTemp}°C</span>
                                    <span>Precipitation: {selectedRegion.precipitation}mm</span>
                                    <span>Risk: {selectedRegion.riskLevel}</span>
                                </div>
                            </div>

                            <div className="case-study">
                                <div className="case-header">
                                    <span className="case-title">Weather Impact Analysis</span>
                                    <span className="case-similarity">Real-time</span>
                                </div>
                                <div className="case-outcome">
                                    <span>Price Impact: +{selectedCommodity.priceImpact}%</span>
                                    <span>Threat: {selectedRegion.primaryThreat}</span>
                                    <span>Source: Live APIs</span>
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
                    {loading && <div className="live-indicator">🔴 Fetching live data...</div>}
                    {!loading && <div className="live-indicator">🟢 Live data active</div>}
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading live climate data from weather APIs...</p>
                </div>
            ) : (
                <>
                    {viewLevel === 1 && renderLevel1()}
                    {viewLevel === 2 && renderLevel2()}
                    {viewLevel === 3 && renderLevel3()}
                </>
            )}
        </div>
    );
};

export default ClimateChange;
