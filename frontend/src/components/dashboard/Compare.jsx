import React, { useState } from 'react';
import { X, Plus, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COMMODITIES, COUNTRY_ANALYSIS, COUNTRY_PRICE_HISTORY } from '../../data/mockData';
import './Compare.css';

const Compare = () => {
    const [comparisons, setComparisons] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCommodity, setSelectedCommodity] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [availableCountries, setAvailableCountries] = useState([]);
    const [timeRange, setTimeRange] = useState('2month'); // week, month, 3month, 6month

    // Filter commodities that have country data
    const availableCommodities = COMMODITIES.filter(c => COUNTRY_ANALYSIS[c.id] && COUNTRY_ANALYSIS[c.id].length > 0);

    const handleCommodityChange = (e) => {
        const commodity = e.target.value;
        setSelectedCommodity(commodity);
        setSelectedCountry('');
        if (commodity) {
            setAvailableCountries(COUNTRY_ANALYSIS[commodity] || []);
        } else {
            setAvailableCountries([]);
        }
    };

    const handleAddComparison = () => {
        if (selectedCommodity && selectedCountry && comparisons.length < 5) {
            const commodity = COMMODITIES.find(c => c.id === selectedCommodity);
            const countryData = COUNTRY_ANALYSIS[selectedCommodity]?.find(
                c => c.country === selectedCountry
            );

            if (commodity && countryData) {
                const newComparison = {
                    id: `${selectedCommodity}-${selectedCountry}-${Date.now()}`,
                    commodity: commodity,
                    country: countryData
                };

                setComparisons([...comparisons, newComparison]);
                setSelectedCommodity('');
                setSelectedCountry('');
                setAvailableCountries([]);
            }
        }
    };

    const handleRemoveComparison = (id) => {
        setComparisons(comparisons.filter(comp => comp.id !== id));
    };

    const getBestValue = (metric) => {
        if (comparisons.length === 0) return null;
        
        switch(metric) {
            case 'price':
                return Math.min(...comparisons.map(c => c.country.price));
            case 'reliability':
                return Math.max(...comparisons.map(c => c.country.reliabilityScore));
            case 'leadTime':
                return Math.min(...comparisons.map(c => parseInt(c.country.leadTime)));
            case 'production':
                return Math.max(...comparisons.map(c => c.country.productionCapacity));
            case 'exports':
                return Math.max(...comparisons.map(c => c.country.exportVolume));
            default:
                return null;
        }
    };

    const isBestValue = (comparison, metric, value) => {
        const best = getBestValue(metric);
        if (best === null) return false;
        
        switch(metric) {
            case 'price':
            case 'leadTime':
                return value === best;
            case 'reliability':
            case 'production':
            case 'exports':
                return Math.abs(value - best) < 0.01;
            default:
                return false;
        }
    };

    const getRiskColor = (level) => {
        switch(level) {
            case 'Low': return '#4caf50';
            case 'Medium': return '#ff9800';
            case 'High': return '#f44336';
            case 'Very High': return '#d32f2f';
            default: return '#666';
        }
    };

    const getRecommendation = () => {
        if (comparisons.length === 0) return null;

        const bestPrice = comparisons.reduce((prev, curr) => 
            prev.country.price < curr.country.price ? prev : curr
        );

        const bestReliability = comparisons.reduce((prev, curr) => 
            prev.country.reliabilityScore > curr.country.reliabilityScore ? prev : curr
        );

        const lowestRisk = comparisons.reduce((prev, curr) => {
            const riskOrder = { 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4 };
            return riskOrder[prev.country.riskLevel] < riskOrder[curr.country.riskLevel] ? prev : curr;
        });

        return { bestPrice, bestReliability, lowestRisk };
    };

    // Filter price history based on selected time range
    const filterPriceHistory = (priceHistory) => {
        if (!priceHistory || priceHistory.length === 0) return [];
        
        const now = new Date('2025-12-01');
        let cutoffDate;
        
        switch(timeRange) {
            case 'week':
                cutoffDate = new Date(now);
                cutoffDate.setDate(cutoffDate.getDate() - 7);
                break;
            case 'month':
                cutoffDate = new Date(now);
                cutoffDate.setMonth(cutoffDate.getMonth() - 1);
                break;
            case '3month':
                cutoffDate = new Date(now);
                cutoffDate.setMonth(cutoffDate.getMonth() - 3);
                break;
            case '6month':
                cutoffDate = new Date(now);
                cutoffDate.setMonth(cutoffDate.getMonth() - 6);
                break;
            default:
                cutoffDate = new Date(now);
                cutoffDate.setMonth(cutoffDate.getMonth() - 2);
        }
        
        return priceHistory.filter(point => new Date(point.date) >= cutoffDate);
    };

    const recommendation = getRecommendation();

    return (
        <div className="compare-view">
            <div className="compare-header">
                <h1>Compare Commodities & Countries</h1>
                <p>Select up to 5 commodity-country pairs to compare side-by-side</p>
            </div>

            {/* Selection Section */}
            <div className="comparison-builder">
                <div className="builder-form">
                    <div className="form-group">
                        <label>Select Commodity</label>
                        <select 
                            className="compare-select"
                            value={selectedCommodity}
                            onChange={handleCommodityChange}
                        >
                            <option value="">Choose a commodity...</option>
                            {availableCommodities.map(commodity => (
                                <option key={commodity.id} value={commodity.id}>
                                    {commodity.icon} {commodity.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Select Country</label>
                        <select 
                            className="compare-select"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            disabled={!selectedCommodity || availableCountries.length === 0}
                        >
                            <option value="">
                                {!selectedCommodity 
                                    ? 'First select a commodity...' 
                                    : availableCountries.length === 0 
                                    ? 'No countries available' 
                                    : 'Choose a country...'}
                            </option>
                            {availableCountries.map(country => (
                                <option key={country.country} value={country.country}>
                                    {country.country}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        className="add-comparison-btn"
                        onClick={handleAddComparison}
                        disabled={!selectedCommodity || !selectedCountry || comparisons.length >= 5}
                    >
                        <Plus size={18} />
                        Add to Compare ({comparisons.length}/5)
                    </button>
                </div>

                {/* Selected Comparisons Pills */}
                {comparisons.length > 0 && (
                    <div className="comparison-pills">
                        {comparisons.map(comp => (
                            <div key={comp.id} className="comparison-pill">
                                <span className="pill-icon">{comp.commodity.icon}</span>
                                <div className="pill-content">
                                    <span className="pill-commodity">{comp.commodity.name}</span>
                                    <span className="pill-country">{comp.country.country}</span>
                                    <span className="pill-price">${comp.country.price}/{comp.country.currency.split('/')[1]}</span>
                                </div>
                                <button 
                                    className="pill-remove"
                                    onClick={() => handleRemoveComparison(comp.id)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Comparison Results */}
            {comparisons.length > 0 && (
                <>
                    {/* Key Metrics Table */}
                    <div className="comparison-section">
                        <h2>Key Metrics Comparison</h2>
                        <div className="comparison-table-wrapper">
                            <table className="comparison-table">
                                <thead>
                                    <tr>
                                        <th className="metric-header">Metric</th>
                                        {comparisons.map(comp => (
                                            <th key={comp.id} className="country-header">
                                                <div className="header-content">
                                                    <span className="header-icon">{comp.commodity.icon}</span>
                                                    <div className="header-text">
                                                        <div className="header-commodity">{comp.commodity.name}</div>
                                                        <div className="header-country">{comp.country.country}</div>
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="metric-name">Price</td>
                                        {comparisons.map(comp => (
                                            <td key={comp.id} className={isBestValue(comp, 'price', comp.country.price) ? 'best-value' : ''}>
                                                ${comp.country.price}/{comp.country.currency.split('/')[1]}
                                                {isBestValue(comp, 'price', comp.country.price) && <CheckCircle size={14} className="check-icon" />}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="metric-name">Risk Level</td>
                                        {comparisons.map(comp => (
                                            <td key={comp.id}>
                                                <span className="risk-badge" style={{background: getRiskColor(comp.country.riskLevel)}}>
                                                    {comp.country.riskLevel}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="metric-name">Reliability Score</td>
                                        {comparisons.map(comp => (
                                            <td key={comp.id} className={isBestValue(comp, 'reliability', comp.country.reliabilityScore) ? 'best-value' : ''}>
                                                {comp.country.reliabilityScore}%
                                                {isBestValue(comp, 'reliability', comp.country.reliabilityScore) && <CheckCircle size={14} className="check-icon" />}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="metric-name">Lead Time</td>
                                        {comparisons.map(comp => (
                                            <td key={comp.id} className={isBestValue(comp, 'leadTime', parseInt(comp.country.leadTime)) ? 'best-value' : ''}>
                                                {comp.country.leadTime}
                                                {isBestValue(comp, 'leadTime', parseInt(comp.country.leadTime)) && <CheckCircle size={14} className="check-icon" />}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="metric-name">Quality Grade</td>
                                        {comparisons.map(comp => (
                                            <td key={comp.id}>
                                                <span className="quality-badge">{comp.country.qualityGrade}</span>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="metric-name">Production Capacity</td>
                                        {comparisons.map(comp => (
                                            <td key={comp.id} className={isBestValue(comp, 'production', comp.country.productionCapacity) ? 'best-value' : ''}>
                                                {comp.country.productionCapacity} {comp.country.productionUnit}
                                                {isBestValue(comp, 'production', comp.country.productionCapacity) && <CheckCircle size={14} className="check-icon" />}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="metric-name">Export Volume</td>
                                        {comparisons.map(comp => (
                                            <td key={comp.id} className={isBestValue(comp, 'exports', comp.country.exportVolume) ? 'best-value' : ''}>
                                                {comp.country.exportVolume} Million MT
                                                {isBestValue(comp, 'exports', comp.country.exportVolume) && <CheckCircle size={14} className="check-icon" />}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="metric-name">Port Access</td>
                                        {comparisons.map(comp => (
                                            <td key={comp.id}>
                                                {comp.country.portAccess.join(', ')}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="metric-name">Seasonality</td>
                                        {comparisons.map(comp => (
                                            <td key={comp.id}>{comp.country.seasonality}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="metric-name">Price Trend</td>
                                        {comparisons.map(comp => (
                                            <td key={comp.id}>
                                                <div className="trend-cell">
                                                    {comp.country.trend === 'up' && <TrendingUp size={16} className="trend-up" />}
                                                    {comp.country.trend === 'down' && <TrendingDown size={16} className="trend-down" />}
                                                    <span className={`trend-${comp.country.trend}`}>
                                                        {comp.country.priceChange > 0 ? '+' : ''}{comp.country.priceChange}%
                                                    </span>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Price Comparison Chart */}
                    <div className="comparison-section">
                        <h2>Price Comparison</h2>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={comparisons.map(comp => ({
                                    name: `${comp.commodity.icon} ${comp.country.country}`,
                                    price: comp.country.price
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="price" fill="#1976d2" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Price History Line Chart */}
                    <div className="comparison-section">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                            <div>
                                <h2 style={{marginBottom: '0.25rem'}}>Price History Comparison</h2>
                                <p style={{fontSize: '0.875rem', color: '#666', margin: 0}}>
                                    Historical price trends
                                </p>
                            </div>
                            <div className="time-range-selector">
                                <button 
                                    className={timeRange === 'week' ? 'active' : ''}
                                    onClick={() => setTimeRange('week')}
                                >
                                    Week
                                </button>
                                <button 
                                    className={timeRange === 'month' ? 'active' : ''}
                                    onClick={() => setTimeRange('month')}
                                >
                                    Month
                                </button>
                                <button 
                                    className={timeRange === '3month' ? 'active' : ''}
                                    onClick={() => setTimeRange('3month')}
                                >
                                    3 Month
                                </button>
                                <button 
                                    className={timeRange === '6month' ? 'active' : ''}
                                    onClick={() => setTimeRange('6month')}
                                >
                                    6 Month
                                </button>
                            </div>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        type="category"
                                        allowDuplicatedCategory={false}
                                    />
                                    <YAxis 
                                        label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    {comparisons.map((comp, index) => {
                                        const colors = ['#1976d2', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];
                                        const priceHistory = COUNTRY_PRICE_HISTORY[comp.commodity.id]?.[comp.country.country] || [];
                                        const filteredHistory = filterPriceHistory(priceHistory);
                                        
                                        return (
                                            <Line
                                                key={comp.id}
                                                data={filteredHistory}
                                                type="monotone"
                                                dataKey="price"
                                                name={`${comp.commodity.icon} ${comp.country.country}`}
                                                stroke={colors[index % colors.length]}
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        );
                                    })}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recommendations */}
                    {recommendation && (
                        <div className="comparison-section">
                            <h2>Smart Recommendations</h2>
                            <div className="recommendations-grid">
                                <div className="recommendation-card best-price">
                                    <div className="rec-icon">💰</div>
                                    <h3>Best Price</h3>
                                    <div className="rec-details">
                                        <span className="rec-commodity">{recommendation.bestPrice.commodity.icon} {recommendation.bestPrice.commodity.name}</span>
                                        <span className="rec-country">{recommendation.bestPrice.country.country}</span>
                                        <span className="rec-value">${recommendation.bestPrice.country.price}/{recommendation.bestPrice.country.currency.split('/')[1]}</span>
                                    </div>
                                    {recommendation.bestPrice.country.riskLevel !== 'Low' && (
                                        <div className="rec-warning">
                                            <AlertCircle size={14} />
                                            <span>{recommendation.bestPrice.country.riskLevel} risk level</span>
                                        </div>
                                    )}
                                </div>

                                <div className="recommendation-card best-reliability">
                                    <div className="rec-icon">✅</div>
                                    <h3>Most Reliable</h3>
                                    <div className="rec-details">
                                        <span className="rec-commodity">{recommendation.bestReliability.commodity.icon} {recommendation.bestReliability.commodity.name}</span>
                                        <span className="rec-country">{recommendation.bestReliability.country.country}</span>
                                        <span className="rec-value">{recommendation.bestReliability.country.reliabilityScore}% reliability</span>
                                    </div>
                                    <div className="rec-info">
                                        Quality: {recommendation.bestReliability.country.qualityGrade}
                                    </div>
                                </div>

                                <div className="recommendation-card lowest-risk">
                                    <div className="rec-icon">🛡️</div>
                                    <h3>Lowest Risk</h3>
                                    <div className="rec-details">
                                        <span className="rec-commodity">{recommendation.lowestRisk.commodity.icon} {recommendation.lowestRisk.commodity.name}</span>
                                        <span className="rec-country">{recommendation.lowestRisk.country.country}</span>
                                        <span className="rec-value">{recommendation.lowestRisk.country.riskLevel} risk</span>
                                    </div>
                                    <div className="rec-info">
                                        Lead time: {recommendation.lowestRisk.country.leadTime}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {comparisons.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>No Comparisons Yet</h3>
                    <p>Select a commodity and country above to start comparing</p>
                </div>
            )}
        </div>
    );
};

export default Compare;
