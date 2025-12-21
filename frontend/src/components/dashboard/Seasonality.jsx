import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COMMODITIES, COUNTRY_ANALYSIS } from '../../data/mockData';
import './Seasonality.css';

const generateSeasonalData = (commodityId, country) => {
    const patterns = {
        wheat: {
            Russia: [-8, -5, 2, 8, 12, 15, 8, -2, -12, -15, -8, -3],
            India: [-12, -8, 15, 18, 12, 5, -5, -8, -12, -18, -15, -5],
            USA: [-5, -2, 8, 12, 15, 12, 5, -8, -15, -12, -8, -2],
            Ukraine: [-15, -12, -5, 8, 15, 18, 12, 5, -8, -18, -15, -12],
            Australia: [15, 12, 8, -5, -12, -15, -18, -12, -5, 8, 12, 18]
        },
        rice: {
            India: [-15, -12, -8, 5, 12, 15, 18, 12, 5, -8, -18, -15],
            Thailand: [-12, -8, -5, 8, 15, 18, 12, 5, -5, -12, -15, -8],
            Vietnam: [-8, -5, 2, 12, 18, 15, 8, -2, -8, -15, -12, -5],
            Pakistan: [-10, -5, 8, 15, 18, 12, 5, -5, -12, -18, -15, -8]
        },
        corn: {
            USA: [-12, -8, -2, 8, 15, 18, 12, 5, -8, -15, -18, -12],
            Brazil: [12, 15, 18, 8, -5, -12, -15, -18, -8, 5, 12, 15],
            Argentina: [18, 15, 8, -5, -12, -18, -15, -8, 5, 12, 18, 15],
            Ukraine: [-15, -12, -5, 8, 15, 18, 12, 5, -8, -18, -15, -12]
        },
        soybean: {
            USA: [-8, -5, 2, 12, 18, 15, 8, -2, -12, -18, -15, -8],
            Brazil: [15, 18, 12, 5, -8, -15, -18, -12, -5, 8, 15, 18],
            Argentina: [18, 12, 5, -8, -15, -18, -12, -5, 8, 15, 18, 12],
            Paraguay: [12, 8, 2, -5, -12, -15, -12, -8, -2, 8, 12, 15]
        }
    };
    return patterns[commodityId]?.[country] || [0,0,0,0,0,0,0,0,0,0,0,0];
};

const getSeasonalInsights = (commodityId, country) => {
    const data = generateSeasonalData(commodityId, country);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const minIdx = data.indexOf(Math.min(...data));
    const maxIdx = data.indexOf(Math.max(...data));
    return {
        bestBuyMonth: months[minIdx],
        bestSellMonth: months[maxIdx],
        buyDiscount: Math.abs(Math.min(...data)),
        sellPremium: Math.max(...data),
        seasonalSpread: Math.max(...data) - Math.min(...data)
    };
};

const Seasonality = () => {
    const [selectedCommodity, setSelectedCommodity] = useState('wheat');
    const [selectedCountries, setSelectedCountries] = useState(['Russia', 'India', 'USA']);

    const availableCommodities = COMMODITIES.filter(c => COUNTRY_ANALYSIS[c.id]);
    const availableCountries = COUNTRY_ANALYSIS[selectedCommodity] || [];

    const handleCountryToggle = (country) => {
        setSelectedCountries(prev => 
            prev.includes(country) 
                ? prev.filter(c => c !== country)
                : [...prev, country].slice(0, 4) // Max 4 countries
        );
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate chart data
    const chartData = months.map((month, idx) => {
        const dataPoint = { month };
        selectedCountries.forEach(country => {
            const seasonalData = generateSeasonalData(selectedCommodity, country);
            dataPoint[country] = seasonalData[idx];
        });
        return dataPoint;
    });

    const colors = ['#1976d2', '#4caf50', '#ff9800', '#f44336'];

    return (
        <div className="seasonality-view">
            <div className="seasonality-header">
                <div className="header-content">
                    <Calendar size={32} />
                    <div>
                        <h1>Price Seasonality Analysis</h1>
                        <p>Historical seasonal patterns and optimal trading windows</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="seasonality-controls">
                <div className="control-group">
                    <label>Commodity</label>
                    <select 
                        value={selectedCommodity}
                        onChange={(e) => {
                            setSelectedCommodity(e.target.value);
                            setSelectedCountries([]);
                        }}
                    >
                        {availableCommodities.map(commodity => (
                            <option key={commodity.id} value={commodity.id}>
                                {commodity.icon} {commodity.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="control-group">
                    <label>Countries (Max 4)</label>
                    <div className="country-chips">
                        {availableCountries.map(countryData => (
                            <button
                                key={countryData.country}
                                className={`country-chip ${selectedCountries.includes(countryData.country) ? 'selected' : ''}`}
                                onClick={() => handleCountryToggle(countryData.country)}
                                disabled={!selectedCountries.includes(countryData.country) && selectedCountries.length >= 4}
                            >
                                {countryData.country}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {selectedCountries.length > 0 && (
                <>
                    {/* Seasonal Chart */}
                    <div className="seasonality-section">
                        <h2>Seasonal Price Patterns</h2>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis label={{ value: 'Price Deviation (%)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip formatter={(value) => [`${value}%`, 'Price vs Average']} />
                                    <Legend />
                                    {selectedCountries.map((country, idx) => (
                                        <Line
                                            key={country}
                                            type="monotone"
                                            dataKey={country}
                                            stroke={colors[idx]}
                                            strokeWidth={3}
                                            dot={{ r: 5 }}
                                            activeDot={{ r: 7 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Heatmap */}
                    <div className="seasonality-section">
                        <h2>Monthly Price Heatmap</h2>
                        <div className="heatmap-container">
                            {selectedCountries.map(country => {
                                const seasonalData = generateSeasonalData(selectedCommodity, country);
                                return (
                                    <div key={country} className="heatmap-row">
                                        <div className="heatmap-label">
                                            <span className="country-name">{country}</span>
                                        </div>
                                        <div className="heatmap-cells">
                                            {months.map((month, idx) => {
                                                const value = seasonalData[idx];
                                                const intensity = Math.abs(value) / 20;
                                                const isPositive = value > 0;
                                                
                                                return (
                                                    <div 
                                                        key={month}
                                                        className="heatmap-cell"
                                                        style={{
                                                            backgroundColor: isPositive 
                                                                ? `rgba(244, 67, 54, ${intensity})` 
                                                                : `rgba(76, 175, 80, ${intensity})`,
                                                            color: intensity > 0.5 ? 'white' : '#333'
                                                        }}
                                                        title={`${month}: ${value > 0 ? '+' : ''}${value}% vs average`}
                                                    >
                                                        <div className="cell-month">{month}</div>
                                                        <div className="cell-value">{value > 0 ? '+' : ''}{value}%</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="heatmap-legend">
                            <span className="legend-item">
                                <div className="legend-color green"></div>
                                Below Average (Buy Opportunity)
                            </span>
                            <span className="legend-item">
                                <div className="legend-color red"></div>
                                Above Average (Sell Opportunity)
                            </span>
                        </div>
                    </div>

                    {/* Trading Insights */}
                    <div className="seasonality-section">
                        <h2>Trading Insights</h2>
                        <div className="insights-grid">
                            {selectedCountries.map(country => {
                                const insights = getSeasonalInsights(selectedCommodity, country);
                                const commodity = COMMODITIES.find(c => c.id === selectedCommodity);
                                
                                return (
                                    <div key={country} className="insight-card">
                                        <div className="insight-header">
                                            <span className="commodity-icon">{commodity?.icon}</span>
                                            <div>
                                                <h3>{commodity?.name}</h3>
                                                <p>{country}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="insight-metrics">
                                            <div className="metric buy">
                                                <TrendingDown size={16} />
                                                <div>
                                                    <span className="metric-label">Best Buy</span>
                                                    <span className="metric-value">{insights.bestBuyMonth}</span>
                                                    <span className="metric-detail">{insights.buyDiscount}% below avg</span>
                                                </div>
                                            </div>
                                            
                                            <div className="metric sell">
                                                <TrendingUp size={16} />
                                                <div>
                                                    <span className="metric-label">Best Sell</span>
                                                    <span className="metric-value">{insights.bestSellMonth}</span>
                                                    <span className="metric-detail">{insights.sellPremium}% above avg</span>
                                                </div>
                                            </div>
                                            
                                            <div className="metric spread">
                                                <Calendar size={16} />
                                                <div>
                                                    <span className="metric-label">Seasonal Spread</span>
                                                    <span className="metric-value">{insights.seasonalSpread}%</span>
                                                    <span className="metric-detail">Annual range</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {selectedCountries.length === 0 && (
                <div className="empty-state">
                    <Calendar size={48} />
                    <h3>Select Countries to Analyze</h3>
                    <p>Choose up to 4 countries to compare seasonal price patterns</p>
                </div>
            )}
        </div>
    );
};

export default Seasonality;