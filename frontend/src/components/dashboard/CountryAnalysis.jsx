import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Ship, Calendar, Factory, Package } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { COUNTRY_ANALYSIS, COMMODITIES } from '../../data/mockData';
import './CountryAnalysis.css';

const CountryAnalysis = () => {
    const { commodity, country } = useParams();
    const navigate = useNavigate();

    // Get country data
    const commodityData = COUNTRY_ANALYSIS[commodity];
    const countryData = commodityData?.find(c => c.country.toLowerCase() === country.toLowerCase());
    
    // Get commodity info
    const commodityInfo = COMMODITIES.find(c => c.id === commodity);

    if (!countryData || !commodityInfo) {
        return (
            <div className="country-analysis-error">
                <p>Country or commodity data not found</p>
                <button onClick={() => navigate(`/dashboard/climate`)}>Back to Market Pulse</button>
            </div>
        );
    }

    // Generate mock price history (last 6 months)
    const generatePriceHistory = () => {
        const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const basePrice = countryData.price;
        return months.map((month, index) => ({
            month,
            price: basePrice + (Math.random() - 0.5) * 30
        }));
    };

    // Generate risk breakdown
    const riskBreakdown = countryData.riskFactors.map((factor, index) => ({
        factor,
        severity: countryData.riskLevel === 'Very High' ? 90 : 
                 countryData.riskLevel === 'High' ? 70 :
                 countryData.riskLevel === 'Medium' ? 50 : 30
    }));

    // Get alternative countries (excluding current)
    const alternatives = commodityData.filter(c => c.country !== countryData.country).slice(0, 3);

    const priceHistory = generatePriceHistory();

    const getRiskColor = (level) => {
        switch(level) {
            case 'Low': return '#4caf50';
            case 'Medium': return '#ff9800';
            case 'High': return '#f44336';
            case 'Very High': return '#c62828';
            default: return '#757575';
        }
    };

    const getTrendIcon = () => {
        if (countryData.trend === 'up') return <TrendingUp size={20} color="#4caf50" />;
        if (countryData.trend === 'down') return <TrendingDown size={20} color="#f44336" />;
        if (countryData.trend === 'volatile') return <AlertTriangle size={20} color="#ff9800" />;
        return <Minus size={20} color="#757575" />;
    };

    const getTradeRecommendation = () => {
        const { riskLevel, reliabilityScore, trend, priceChange } = countryData;
        
        if (reliabilityScore >= 85 && riskLevel === 'Low' && trend !== 'down') {
            return {
                action: 'STRONG BUY',
                color: '#4caf50',
                reason: 'Low risk, high reliability, favorable price trend',
                timing: 'Immediate - Lock prices now',
                volume: 'Large volume recommended'
            };
        } else if (riskLevel === 'High' || riskLevel === 'Very High') {
            return {
                action: 'AVOID',
                color: '#f44336',
                reason: 'High risk factors outweigh price benefits',
                timing: 'Consider alternatives',
                volume: 'Not recommended'
            };
        } else if (trend === 'down') {
            return {
                action: 'WAIT',
                color: '#ff9800',
                reason: 'Prices declining - better entry point ahead',
                timing: '2-4 weeks - Monitor closely',
                volume: 'Small test orders only'
            };
        } else {
            return {
                action: 'BUY',
                color: '#2196f3',
                reason: 'Balanced risk-reward profile',
                timing: '1-2 weeks',
                volume: 'Medium volume'
            };
        }
    };

    const recommendation = getTradeRecommendation();

    return (
        <div className="country-analysis">
            {/* Header with Breadcrumb */}
            <div className="country-header">
                <button className="back-button" onClick={() => navigate(`/dashboard/climate`)}>
                    <ArrowLeft size={20} />
                    Back to Market Pulse
                </button>
                <div className="breadcrumb">
                    <span onClick={() => navigate('/dashboard/home')}>Home</span>
                    <span className="separator">›</span>
                    <span onClick={() => navigate('/dashboard/climate')}>Market Pulse</span>
                    <span className="separator">›</span>
                    <span>{commodityInfo.name}</span>
                    <span className="separator">›</span>
                    <span className="active">{countryData.country}</span>
                </div>
            </div>

            {/* Country Profile Card */}
            <div className="country-profile-card">
                <div className="profile-header">
                    <div className="profile-title">
                        <h1>{countryData.country}</h1>
                        <span className="commodity-badge">{commodityInfo.icon} {commodityInfo.name}</span>
                    </div>
                    <div className="profile-metrics">
                        <div className="metric-large">
                            <span className="label">Current Price</span>
                            <div className="value-with-trend">
                                <span className="price">${countryData.price}</span>
                                <span className="unit">/{countryData.currency.split('/')[1]}</span>
                                {getTrendIcon()}
                                <span className={`change ${countryData.priceChange >= 0 ? 'positive' : 'negative'}`}>
                                    {countryData.priceChange >= 0 ? '+' : ''}{countryData.priceChange}%
                                </span>
                            </div>
                        </div>
                        <div className="metric">
                            <span className="label">Risk Level</span>
                            <span className="risk-badge" style={{ backgroundColor: getRiskColor(countryData.riskLevel) }}>
                                {countryData.riskLevel}
                            </span>
                        </div>
                        <div className="metric">
                            <span className="label">Reliability Score</span>
                            <div className="reliability-bar">
                                <div className="reliability-fill" style={{ width: `${countryData.reliabilityScore}%` }}>
                                    {countryData.reliabilityScore}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="country-content-grid">
                {/* Left Column */}
                <div className="country-left-column">
                    {/* Price History Chart */}
                    <div className="country-section">
                        <h3>Price History (6 Months)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={priceHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="month" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip />
                                <Line type="monotone" dataKey="price" stroke="#1976d2" strokeWidth={2} dot={{ fill: '#1976d2' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Risk Analysis */}
                    <div className="country-section">
                        <h3><AlertTriangle size={20} /> Risk Factors</h3>
                        <div className="risk-factors-list">
                            {countryData.riskFactors.map((factor, index) => (
                                <div key={index} className="risk-factor-item">
                                    <div className="risk-factor-label">
                                        <AlertTriangle size={16} color={getRiskColor(countryData.riskLevel)} />
                                        {factor}
                                    </div>
                                    <div className="risk-severity-bar">
                                        <div 
                                            className="risk-severity-fill" 
                                            style={{ 
                                                width: `${riskBreakdown[index].severity}%`,
                                                backgroundColor: getRiskColor(countryData.riskLevel)
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Supply Metrics */}
                    <div className="country-section">
                        <h3><Factory size={20} /> Supply & Production</h3>
                        <div className="supply-metrics-grid">
                            <div className="supply-metric">
                                <Factory size={24} color="#1976d2" />
                                <span className="metric-label">Production Capacity</span>
                                <span className="metric-value">{countryData.productionCapacity} {countryData.productionUnit}</span>
                            </div>
                            <div className="supply-metric">
                                <Package size={24} color="#4caf50" />
                                <span className="metric-label">Export Volume</span>
                                <span className="metric-value">{countryData.exportVolume} {countryData.productionUnit}</span>
                            </div>
                            <div className="supply-metric">
                                <CheckCircle size={24} color="#ff9800" />
                                <span className="metric-label">Quality Grade</span>
                                <span className="metric-value">{countryData.qualityGrade}</span>
                            </div>
                        </div>
                    </div>

                    {/* Logistics */}
                    <div className="country-section">
                        <h3><Ship size={20} /> Logistics & Shipping</h3>
                        <div className="logistics-info">
                            <div className="logistics-item">
                                <Ship size={18} />
                                <div>
                                    <span className="logistics-label">Lead Time</span>
                                    <span className="logistics-value">{countryData.leadTime}</span>
                                </div>
                            </div>
                            <div className="logistics-item">
                                <Ship size={18} />
                                <div>
                                    <span className="logistics-label">Port Access</span>
                                    <span className="logistics-value">{countryData.portAccess.join(', ')}</span>
                                </div>
                            </div>
                            <div className="logistics-item">
                                <Calendar size={18} />
                                <div>
                                    <span className="logistics-label">Harvest Season</span>
                                    <span className="logistics-value">{countryData.seasonality}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="country-right-column">
                    {/* Trade Recommendation */}
                    <div className="country-section trade-recommendation" style={{ borderLeft: `4px solid ${recommendation.color}` }}>
                        <h3>Trade Recommendation</h3>
                        <div className="recommendation-action" style={{ color: recommendation.color }}>
                            {recommendation.action}
                        </div>
                        <div className="recommendation-details">
                            <div className="recommendation-item">
                                <span className="rec-label">Reason:</span>
                                <span className="rec-value">{recommendation.reason}</span>
                            </div>
                            <div className="recommendation-item">
                                <span className="rec-label">Timing:</span>
                                <span className="rec-value">{recommendation.timing}</span>
                            </div>
                            <div className="recommendation-item">
                                <span className="rec-label">Volume:</span>
                                <span className="rec-value">{recommendation.volume}</span>
                            </div>
                        </div>
                        <button className="action-button" style={{ backgroundColor: recommendation.color }}>
                            Contact Supplier
                        </button>
                    </div>

                    {/* Alternative Countries */}
                    <div className="country-section">
                        <h3>Alternative Sources</h3>
                        <div className="alternatives-list">
                            {alternatives.map((alt, index) => (
                                <div 
                                    key={index} 
                                    className="alternative-item"
                                    onClick={() => navigate(`/dashboard/commodity/${commodity}/country/${alt.country.toLowerCase()}`)}
                                >
                                    <div className="alt-header">
                                        <span className="alt-country">{alt.country}</span>
                                        <span className="alt-price">${alt.price}</span>
                                    </div>
                                    <div className="alt-details">
                                        <span className="alt-risk" style={{ color: getRiskColor(alt.riskLevel) }}>
                                            {alt.riskLevel} Risk
                                        </span>
                                        <span className="alt-reliability">
                                            {alt.reliabilityScore}% Reliability
                                        </span>
                                    </div>
                                    <div className="alt-change">
                                        {alt.trend === 'up' && <TrendingUp size={14} color="#4caf50" />}
                                        {alt.trend === 'down' && <TrendingDown size={14} color="#f44336" />}
                                        <span className={alt.priceChange >= 0 ? 'positive' : 'negative'}>
                                            {alt.priceChange >= 0 ? '+' : ''}{alt.priceChange}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Highlights */}
                    <div className="country-section">
                        <h3>Key Highlights</h3>
                        <div className="highlights-list">
                            <div className="highlight-item positive">
                                <CheckCircle size={16} />
                                <span>Production capacity: {countryData.productionCapacity} {countryData.productionUnit}</span>
                            </div>
                            <div className="highlight-item positive">
                                <CheckCircle size={16} />
                                <span>Quality grade: {countryData.qualityGrade}</span>
                            </div>
                            {countryData.reliabilityScore >= 80 && (
                                <div className="highlight-item positive">
                                    <CheckCircle size={16} />
                                    <span>High reliability score ({countryData.reliabilityScore}%)</span>
                                </div>
                            )}
                            {countryData.riskLevel !== 'Low' && (
                                <div className="highlight-item warning">
                                    <AlertTriangle size={16} />
                                    <span>{countryData.riskLevel} risk level - {countryData.riskFactors[0]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountryAnalysis;
