import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Globe, Calendar, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { COMMODITIES, PRICE_DATA, NEWS_FEED, COUNTRY_ANALYSIS } from '../../data/mockData';
import './CommodityDetail.css';

const CommodityDetail = ({ commodityId, onBack }) => {
    const [timeframe, setTimeframe] = useState('1M');
    const navigate = useNavigate();
    
    const commodity = COMMODITIES.find(c => c.id === commodityId);
    const priceHistory = PRICE_DATA[commodityId] || [];
    const relevantNews = NEWS_FEED.filter(news => 
        news.commodities.includes(commodityId)
    );

    // Get real country data from COUNTRY_ANALYSIS
    const countryData = COUNTRY_ANALYSIS[commodityId] || [];

    // Mock seasonality data
    const seasonalityData = [
        { month: 'Jan', price: 240, demand: 85 },
        { month: 'Feb', price: 238, demand: 80 },
        { month: 'Mar', price: 242, demand: 88 },
        { month: 'Apr', price: 255, demand: 95 },
        { month: 'May', price: 265, demand: 98 },
        { month: 'Jun', price: 258, demand: 92 },
        { month: 'Jul', price: 248, demand: 85 },
        { month: 'Aug', price: 245, demand: 83 },
        { month: 'Sep', price: 252, demand: 90 },
        { month: 'Oct', price: 260, demand: 94 },
        { month: 'Nov', price: 255, demand: 91 },
        { month: 'Dec', price: 250, demand: 87 },
    ];

    const latestPrice = priceHistory[priceHistory.length - 1]?.price || 0;
    const priceChange = priceHistory.length >= 2 
        ? ((latestPrice - priceHistory[priceHistory.length - 2].price) / priceHistory[priceHistory.length - 2].price) * 100
        : 0;

    return (
        <div className="commodity-detail">
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={18} />
                    Back to Market Pulse
                </button>
                
                <div className="commodity-title-section">
                    <h1>{commodity?.name}</h1>
                    <div className="title-meta">
                        <span className="commodity-symbol">{commodity?.id.toUpperCase()}</span>
                        <span className="current-price">${latestPrice.toFixed(2)}</span>
                        <span className={`price-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                            {priceChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="detail-grid">
                {/* Price History Chart */}
                <div className="detail-card chart-card">
                    <div className="card-header">
                        <h3>Price Movement</h3>
                        <div className="timeframe-selector">
                            {['1D', '1W', '1M', '3M', '1Y'].map(tf => (
                                <button 
                                    key={tf}
                                    className={timeframe === tf ? 'active' : ''}
                                    onClick={() => setTimeframe(tf)}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={priceHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#666" style={{ fontSize: '0.75rem' }} />
                            <YAxis stroke="#666" style={{ fontSize: '0.75rem' }} />
                            <Tooltip 
                                contentStyle={{ 
                                    background: '#fff', 
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem'
                                }} 
                            />
                            <Line type="monotone" dataKey="price" stroke="#1976d2" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Seasonality Chart */}
                <div className="detail-card chart-card">
                    <div className="card-header">
                        <h3>Seasonality & Demand</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={seasonalityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#666" style={{ fontSize: '0.75rem' }} />
                            <YAxis stroke="#666" style={{ fontSize: '0.75rem' }} />
                            <Tooltip 
                                contentStyle={{ 
                                    background: '#fff', 
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem'
                                }} 
                            />
                            <Bar dataKey="price" fill="#1976d2" />
                            <Bar dataKey="demand" fill="#2e7d32" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Country Analysis Table */}
                <div className="detail-card country-card">
                    <div className="card-header">
                        <h3><Globe size={18} /> Sourcing Options by Country</h3>
                        <p className="card-subtitle">Compare prices, risks, and supply reliability • Click row for details</p>
                    </div>
                    <div className="country-table-wrapper">
                        <table className="country-table">
                            <thead>
                                <tr>
                                    <th>Country</th>
                                    <th>Price/MT</th>
                                    <th>Risk Level</th>
                                    <th>Reliability</th>
                                    <th>Lead Time</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {countryData.map((country, idx) => (
                                    <tr 
                                        key={idx}
                                        className="country-row-clickable"
                                        onClick={() => navigate(`/dashboard/commodity/${commodityId}/country/${country.country.toLowerCase()}`)}
                                    >
                                        <td className="country-name">{country.country}</td>
                                        <td className="price-cell">${country.price}</td>
                                        <td>
                                            <span className={`risk-badge ${country.riskLevel.toLowerCase().replace(' ', '-')}`}>
                                                {country.riskLevel}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="quality-bar">
                                                <div className="quality-fill" style={{ width: `${country.reliabilityScore}%` }}></div>
                                                <span>{country.reliabilityScore}%</span>
                                            </div>
                                        </td>
                                        <td>{country.leadTime}</td>
                                        <td>
                                            <span className={`trend-indicator ${country.trend}`}>
                                                {country.trend === 'up' && <TrendingUp size={14} />}
                                                {country.trend === 'down' && <TrendingDown size={14} />}
                                                {country.priceChange >= 0 ? '+' : ''}{country.priceChange}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Intelligence Feed */}
                <div className="detail-card intelligence-card">
                    <div className="card-header">
                        <h3><AlertTriangle size={18} /> Key Intelligence</h3>
                    </div>
                    <div className="intelligence-list">
                        {relevantNews.slice(0, 4).map((news, idx) => (
                            <div key={idx} className="intelligence-item">
                                <div className={`intel-indicator ${news.category}`}></div>
                                <div className="intel-content">
                                    <div className="intel-category">{news.category}</div>
                                    <div className="intel-title">{news.title}</div>
                                    <div className="intel-meta">
                                        <span>{news.source}</span>
                                        <span>{news.time}</span>
                                        <span>{news.region}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trade Decision Panel */}
                <div className="detail-card decision-card">
                    <div className="card-header">
                        <h3><DollarSign size={18} /> Trade Decision Support</h3>
                    </div>
                    <div className="decision-content">
                        <div className="decision-row">
                            <span className="decision-label">Recommendation</span>
                            <span className="decision-value strong-buy">STRONG BUY</span>
                        </div>
                        <div className="decision-row">
                            <span className="decision-label">Best Entry Price</span>
                            <span className="decision-value">$242 - $248 per MT</span>
                        </div>
                        <div className="decision-row">
                            <span className="decision-label">Optimal Timing</span>
                            <span className="decision-value">Next 2-3 weeks (before monsoon)</span>
                        </div>
                        <div className="decision-row">
                            <span className="decision-label">Recommended Source</span>
                            <span className="decision-value">Vietnam or India (best value/risk)</span>
                        </div>
                        <div className="decision-row">
                            <span className="decision-label">Target Volume</span>
                            <span className="decision-value">5,000 - 10,000 MT</span>
                        </div>
                        <div className="decision-row">
                            <span className="decision-label">Price Forecast (3M)</span>
                            <span className="decision-value positive">+8% to +12%</span>
                        </div>
                    </div>
                    <button className="action-button primary">Save to Watchlist</button>
                    <button className="action-button secondary">Contact Suppliers</button>
                </div>
            </div>
        </div>
    );
};

export default CommodityDetail;
