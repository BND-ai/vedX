import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Package, Activity } from 'lucide-react';
import { PRICE_DATA, COMMODITIES } from '../../data/mockData';
import './OverviewCards.css';

const OverviewCards = ({ selectedProducts }) => {
    // Calculate which commodities are BULLISH (prices rising)
    const calculateBullishCommodities = () => {
        const bullish = [];
        selectedProducts.forEach(productId => {
            const data = PRICE_DATA[productId];
            if (data && data.length >= 2) {
                const latest = data[data.length - 1].price;
                const previous = data[data.length - 2].price;
                const change = ((latest - previous) / previous) * 100;
                if (change > 2) { // More than 2% increase
                    const commodity = COMMODITIES.find(c => c.id === productId);
                    bullish.push({ name: commodity?.name || productId, change });
                }
            }
        });
        return bullish;
    };

    // Calculate BEARISH commodities (prices falling - good buying opportunity)
    const calculateBearishCommodities = () => {
        const bearish = [];
        selectedProducts.forEach(productId => {
            const data = PRICE_DATA[productId];
            if (data && data.length >= 2) {
                const latest = data[data.length - 1].price;
                const previous = data[data.length - 2].price;
                const change = ((latest - previous) / previous) * 100;
                if (change < -2) { // More than 2% decrease
                    const commodity = COMMODITIES.find(c => c.id === productId);
                    bearish.push({ name: commodity?.name || productId, change });
                }
            }
        });
        return bearish;
    };

    // Count HIGH RISK opportunities (supply disruptions = potential for profit)
    const calculateHighRiskOpportunities = () => {
        // Mock: Count commodities with recent sharp price movements or supply issues
        const opportunities = selectedProducts.filter(productId => {
            const data = PRICE_DATA[productId];
            if (data && data.length >= 2) {
                const latest = data[data.length - 1].price;
                const previous = data[data.length - 2].price;
                const change = Math.abs(((latest - previous) / previous) * 100);
                return change > 3; // Volatility > 3% = trading opportunity
            }
            return false;
        });
        return opportunities.length;
    };

    // Calculate PORTFOLIO MOMENTUM (overall trend strength)
    const calculateMomentum = () => {
        let totalMomentum = 0;
        let count = 0;
        selectedProducts.forEach(productId => {
            const data = PRICE_DATA[productId];
            if (data && data.length >= 3) {
                // Calculate momentum from last 3 data points
                const latest = data[data.length - 1].price;
                const previous = data[data.length - 3].price;
                const momentum = ((latest - previous) / previous) * 100;
                totalMomentum += momentum;
                count++;
            }
        });
        return count > 0 ? totalMomentum / count : 0;
    };

    const bullishCommodities = calculateBullishCommodities();
    const bearishCommodities = calculateBearishCommodities();
    const highRiskOpportunities = calculateHighRiskOpportunities();
    const momentum = calculateMomentum();

    return (
        <div className="overview-cards">
            {/* Card 1: Bullish Commodities - PRICES RISING */}
            <div className="overview-card bullish-card">
                <div className="card-header">
                    <TrendingUp size={20} color="#4caf50" />
                    <span className="card-title">Bullish Commodities</span>
                </div>
                <div className="card-value" style={{ color: '#4caf50' }}>{bullishCommodities.length}</div>
                <div className="card-change positive">
                    {bullishCommodities.length > 0 ? (
                        <>
                            <strong>{bullishCommodities[0].name}</strong> up {bullishCommodities[0].change.toFixed(1)}%
                            {bullishCommodities.length > 1 && ` +${bullishCommodities.length - 1} more`}
                        </>
                    ) : (
                        'No strong uptrends detected'
                    )}
                </div>
                <div className="card-footer">
                    {bullishCommodities.length > 0 ? '⚡ Consider selling positions' : 'Monitor for breakouts'}
                </div>
            </div>

            {/* Card 2: Buying Opportunities - PRICES FALLING */}
            <div className="overview-card opportunity-card">
                <div className="card-header">
                    <DollarSign size={20} color="#2196f3" />
                    <span className="card-title">Buying Opportunities</span>
                </div>
                <div className="card-value" style={{ color: '#2196f3' }}>{bearishCommodities.length}</div>
                <div className="card-change neutral">
                    {bearishCommodities.length > 0 ? (
                        <>
                            <strong>{bearishCommodities[0].name}</strong> down {Math.abs(bearishCommodities[0].change).toFixed(1)}%
                            {bearishCommodities.length > 1 && ` +${bearishCommodities.length - 1} more`}
                        </>
                    ) : (
                        'No attractive entry points yet'
                    )}
                </div>
                <div className="card-footer">
                    {bearishCommodities.length > 0 ? '💰 Good entry prices available' : 'Wait for price corrections'}
                </div>
            </div>

            {/* Card 3: High Volatility Trades - RISK/REWARD */}
            <div className="overview-card volatility-card">
                <div className="card-header">
                    <Activity size={20} color="#ff9800" />
                    <span className="card-title">High Volatility Trades</span>
                </div>
                <div className="card-value" style={{ color: '#ff9800' }}>{highRiskOpportunities}</div>
                <div className="card-change warning">
                    {highRiskOpportunities > 0 ? (
                        `${highRiskOpportunities} commodities showing sharp moves`
                    ) : (
                        'Markets stable - low volatility'
                    )}
                </div>
                <div className="card-footer">
                    {highRiskOpportunities > 0 ? '⚠️ Higher risk, higher reward' : 'Safe trading conditions'}
                </div>
            </div>

            {/* Card 4: Portfolio Momentum - OVERALL TREND */}
            <div className="overview-card momentum-card">
                <div className="card-header">
                    <Package size={20} color={momentum >= 0 ? '#4caf50' : '#f44336'} />
                    <span className="card-title">Portfolio Momentum</span>
                </div>
                <div className="card-value" style={{ color: momentum >= 0 ? '#4caf50' : '#f44336' }}>
                    {momentum >= 0 ? '+' : ''}{momentum.toFixed(1)}%
                </div>
                <div className={`card-change ${momentum >= 0 ? 'positive' : 'negative'}`}>
                    {momentum >= 3 ? (
                        <>
                            {momentum >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <strong>Strong uptrend</strong> - ride the wave
                        </>
                    ) : momentum <= -3 ? (
                        <>
                            <TrendingDown size={14} />
                            <strong>Downtrend</strong> - wait or buy dips
                        </>
                    ) : (
                        <>Sideways movement - be patient</>
                    )}
                </div>
                <div className="card-footer">
                    Tracking {selectedProducts.length} commodities
                </div>
            </div>
        </div>
    );
};

export default OverviewCards;
