import React, { useState, useEffect } from 'react';
import { CloudRain, AlertTriangle, TrendingUp, TrendingDown, Thermometer, Droplets, Wind, MapPin } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { COMMODITIES } from '../../data/mockData';
import climateService from '../../services/climateService';
import './ClimateImpact.css';

const ClimateImpact = ({ selectedProducts = [] }) => {
    const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
    const [loading, setLoading] = useState(false);
    const [realTimeData, setRealTimeData] = useState(null);
    
    // Get selected commodity names
    const selectedCommodityNames = COMMODITIES
        .filter(c => selectedProducts.includes(c.id))
        .map(c => c.name);
    
    // Fetch real-time data when commodities change
    useEffect(() => {
        fetchRealTimeData();
    }, [selectedCommodityNames]);
    
    const fetchRealTimeData = async () => {
        setLoading(true);
        try {
            const [dashboardData, liveWeatherData] = await Promise.all([
                climateService.getClimateDashboard(selectedCommodityNames.length > 0 ? selectedCommodityNames : ['corn', 'wheat', 'rice', 'soybean']),
                climateService.getLiveWeatherData()
            ]);
            setRealTimeData({ ...dashboardData, liveWeather: liveWeatherData });
        } catch (error) {
            console.error('Error fetching real-time climate data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Use real-time data if available, otherwise fallback to mock data
    const criticalAlerts = realTimeData 
        ? climateService.transformAlertsData(realTimeData.alerts)
        : [];

    // Supply Risk KPIs from real-time data
    const supplyRiskKPIs = realTimeData 
        ? climateService.transformSupplyRiskData(realTimeData.supply_risk)
        : [
            { metric: 'Yield Impact', value: '-15%', trend: 'down', color: '#f44336' },
            { metric: 'Production Risk', value: '78/100', trend: 'up', color: '#ff9800' },
            { metric: 'Supply Disruption', value: '12 days', trend: 'up', color: '#f44336' },
            { metric: 'Alt Sources', value: '45%', trend: 'stable', color: '#4caf50' }
        ];

    // Price Impact Matrix from real-time data
    const priceImpactData = realTimeData 
        ? climateService.transformPriceImpactMatrix(realTimeData.price_impact_matrix)
        : [];

    // Regional Risk Data - use live weather data if available
    const allRegionalRisks = realTimeData?.liveWeather?.agricultural_weather?.map(region => {
        const openMeteoData = region.open_meteo || {};
        const openWeatherData = region.openweather || {};
        
        const temp = openMeteoData.current_temp || openWeatherData.temperature || 25;
        const precipitation = openMeteoData.precipitation || 0;
        const humidity = openMeteoData.humidity || openWeatherData.humidity || 50;
        
        let overallRisk = 'Low';
        if (temp > 35 && precipitation < 1) overallRisk = 'Critical';
        else if (temp > 30 && precipitation < 2) overallRisk = 'High';
        else if (temp > 25 || precipitation < 5) overallRisk = 'Medium';
        
        return {
            region: region.region,
            drought: precipitation < 2 ? 5 : precipitation < 5 ? 3 : 1,
            flood: precipitation > 20 ? 4 : precipitation > 10 ? 2 : 1,
            temp: temp > 35 ? 5 : temp > 30 ? 4 : temp > 25 ? 3 : 2,
            overall: overallRisk,
            commodity: region.commodity,
            currentTemp: temp,
            currentPrecipitation: precipitation,
            humidity: humidity
        };
    }) || [
        { region: 'US Midwest', drought: 4, flood: 2, temp: 3, overall: 'High', commodity: 'Corn' },
        { region: 'Argentina', drought: 5, flood: 4, temp: 2, overall: 'Critical', commodity: 'Soybean' },
        { region: 'Australia', drought: 3, flood: 1, temp: 4, overall: 'Medium', commodity: 'Wheat' },
        { region: 'India', drought: 2, flood: 3, temp: 3, overall: 'Medium', commodity: 'Rice' },
        { region: 'Brazil', drought: 2, flood: 4, temp: 2, overall: 'High', commodity: 'Soybean' },
        { region: 'Russia', drought: 4, flood: 1, temp: 3, overall: 'High', commodity: 'Wheat' },
        { region: 'Thailand', drought: 2, flood: 3, temp: 2, overall: 'Medium', commodity: 'Rice' }
    ];
    
    const regionalRisks = allRegionalRisks.filter(risk => 
        selectedCommodityNames.includes(risk.commodity)
    );

    // Financial Impact Metrics from real-time data
    const financialMetrics = realTimeData 
        ? climateService.transformFinancialData(realTimeData.financial_impact)
        : [
            { metric: 'Climate Premium', value: '$45/MT', change: '+$12', trend: 'up' },
            { metric: 'Volatility Spike', value: '85%', change: '+15%', trend: 'up' },
            { metric: 'Insurance Cost', value: '+$8/MT', change: '+$3', trend: 'up' },
            { metric: 'Hedge Coverage', value: '62%', change: '-8%', trend: 'down' }
        ];

    // Weather Timeline Data
    const weatherTimeline = [
        { period: 'Next 7 days', risk: 'High', events: ['Drought continues in US', 'Heavy rain in Brazil'] },
        { period: 'Next 30 days', risk: 'Critical', events: ['La Niña strengthening', 'Monsoon delays in India'] },
        { period: 'Next 90 days', risk: 'Medium', events: ['Hurricane season peak', 'Winter wheat planting'] }
    ];

    const getSeverityColor = (severity) => {
        switch(severity) {
            case 'critical': return '#d32f2f';
            case 'high': return '#f44336';
            case 'medium': return '#ff9800';
            case 'low': return '#4caf50';
            default: return '#666';
        }
    };

    const getRiskColor = (risk) => {
        switch(risk) {
            case 'Critical': return '#d32f2f';
            case 'High': return '#f44336';
            case 'Medium': return '#ff9800';
            case 'Low': return '#4caf50';
            default: return '#666';
        }
    };

    return (
        <div className="climate-impact-view">
            {/* Header */}
            <div className="climate-header">
                <div className="header-content">
                    <CloudRain size={32} />
                    <div>
                        <h1>Climate Impact Analysis</h1>
                        <p>Real-time climate risk assessment for commodity supply chains</p>
                        {loading && <div className="live-status loading">🔴 Loading live data...</div>}
                        {!loading && <div className="live-status active">🟢 Live weather data active</div>}
                    </div>
                </div>
                <div className="timeframe-selector">
                    {['7d', '30d', '90d'].map(period => (
                        <button 
                            key={period}
                            className={selectedTimeframe === period ? 'active' : ''}
                            onClick={() => setSelectedTimeframe(period)}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* Critical Alerts Banner */}
            <div className="critical-alerts-banner">
                <h2>🔴 Critical Weather Alerts</h2>
                <div className="alerts-container">
                    {criticalAlerts.map(alert => (
                        <div key={alert.id} className={`alert-card ${alert.severity}`}>
                            <div className="alert-header">
                                <AlertTriangle size={16} />
                                <span className="alert-region">{alert.region}</span>
                                <span className="alert-days">{alert.days}d</span>
                            </div>
                            <div className="alert-content">
                                <div className="alert-commodity">{alert.commodity}</div>
                                <div className="alert-threat">{alert.threat}</div>
                                <div className="alert-impact">{alert.impact} price impact</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* KPI Dashboard */}
            <div className="kpi-grid">
                <div className="kpi-section">
                    <h3>Supply Risk Indicators</h3>
                    <div className="kpi-cards">
                        {supplyRiskKPIs.map((kpi, idx) => (
                            <div key={idx} className="kpi-card">
                                <div className="kpi-header">
                                    <span className="kpi-label">{kpi.metric}</span>
                                    {kpi.trend === 'up' && <TrendingUp size={16} style={{color: kpi.color}} />}
                                    {kpi.trend === 'down' && <TrendingDown size={16} style={{color: kpi.color}} />}
                                </div>
                                <div className="kpi-value" style={{color: kpi.color}}>{kpi.value}</div>
                                <div className="kpi-calculation">
                                    {kpi.metric === 'Yield Impact' && 'Weather severity × Regional weight'}
                                    {kpi.metric === 'Production Risk' && 'Weather risk + Supply risk + Regional concentration'}
                                    {kpi.metric === 'Supply Disruption' && 'Weather days + Logistics delays'}
                                    {kpi.metric === 'Alt Sources' && '(Total - Affected capacity) / Total capacity'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="kpi-section">
                    <h3>Financial Impact Metrics</h3>
                    <div className="kpi-cards">
                        {financialMetrics.map((metric, idx) => (
                            <div key={idx} className="kpi-card">
                                <div className="kpi-header">
                                    <span className="kpi-label">{metric.metric}</span>
                                    {metric.trend === 'up' && <TrendingUp size={16} className="trend-up" />}
                                    {metric.trend === 'down' && <TrendingDown size={16} className="trend-down" />}
                                </div>
                                <div className="kpi-value">{metric.value}</div>
                                <div className="kpi-change">{metric.change}</div>
                                <div className="kpi-formula">
                                    {metric.calculation || (
                                        metric.metric === 'Current Price' ? 'Base price + Climate premium' :
                                        metric.metric === 'Climate Premium' ? 'Weather impact × 0.3 + Supply risk × 0.2' :
                                        metric.metric === 'Volatility Index' ? '(Weather severity + Disruption days) × 12.5' :
                                        metric.metric === 'Insurance Cost' ? 'Risk score × Commodity value × 2%' :
                                        'Calculated value'
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Price Impact Matrix */}
            <div className="climate-section">
                <h2>Climate Price Impact Matrix</h2>
                <div className="price-matrix-container">
                    <div className="matrix-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Commodity</th>
                                    <th>Base Price</th>
                                    <th>Drought Impact</th>
                                    <th>Drought Price</th>
                                    <th>Flood Impact</th>
                                    <th>Flood Price</th>
                                    <th>Overall Risk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {priceImpactData.map((row, idx) => {
                                    const droughtImpact = parseFloat(row.drought_impact?.replace(/[^\d.]/g, '') || '0');
                                    const floodImpact = parseFloat(row.flood_impact?.replace(/[^\d.]/g, '') || '0');
                                    return (
                                        <tr key={idx}>
                                            <td className="commodity-cell">{row.commodity}</td>
                                            <td className="price-cell">{row.base_price_display}</td>
                                            <td className={`impact-cell ${droughtImpact > 20 ? 'high' : droughtImpact > 10 ? 'medium' : 'low'}`}>
                                                {row.drought_impact}
                                            </td>
                                            <td className="price-cell">{row.drought_target}</td>
                                            <td className={`impact-cell ${floodImpact > 20 ? 'high' : floodImpact > 10 ? 'medium' : 'low'}`}>
                                                {row.flood_impact}
                                            </td>
                                            <td className="price-cell">{row.flood_target}</td>
                                            <td className={`risk-cell ${row.overall_risk?.toLowerCase()}`}>
                                                {row.overall_risk}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Regional Risk Assessment */}
            <div className="climate-section">
                <h2>Regional Risk Assessment</h2>
                <div className="regional-risks-container">
                    {regionalRisks.map((region, idx) => (
                        <div key={idx} className="region-card">
                            <div className="region-header">
                                <MapPin size={16} />
                                <span className="region-name">{region.region}</span>
                                <span className={`risk-badge ${region.overall.toLowerCase()}`}>
                                    {region.overall}
                                </span>
                            </div>
                            <div className="region-commodity">{region.commodity}</div>
                            <div className="risk-indicators">
                                <div className="risk-item">
                                    <Droplets size={14} />
                                    <span>Drought: {region.drought}/5</span>
                                </div>
                                <div className="risk-item">
                                    <CloudRain size={14} />
                                    <span>Flood: {region.flood}/5</span>
                                </div>
                                <div className="risk-item">
                                    <Thermometer size={14} />
                                    <span>Temp: {region.temp}/5</span>
                                </div>
                                {region.currentTemp && (
                                    <div className="risk-item live-data">
                                        <span>🟢 Live: {region.currentTemp}°C, {region.currentPrecipitation}mm</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weather Timeline */}
            <div className="climate-section">
                <h2>Weather Forecast Timeline</h2>
                <div className="timeline-container">
                    {weatherTimeline.map((period, idx) => (
                        <div key={idx} className="timeline-item">
                            <div className="timeline-header">
                                <span className="timeline-period">{period.period}</span>
                                <span className={`timeline-risk ${period.risk.toLowerCase()}`}>
                                    {period.risk} Risk
                                </span>
                            </div>
                            <div className="timeline-events">
                                {period.events.map((event, eventIdx) => (
                                    <div key={eventIdx} className="timeline-event">
                                        • {event}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClimateImpact;