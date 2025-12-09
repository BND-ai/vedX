import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { COMMODITIES, PRICE_DATA } from '../../data/mockData';
import './MarketPulse.css';

const MarketPulse = ({ selectedProducts, onCommodityClick }) => {
    const getCommodityStats = (commodityId) => {
        const commodity = COMMODITIES.find(c => c.id === commodityId);
        const priceData = PRICE_DATA[commodityId];
        
        if (!priceData || priceData.length < 2) {
            return null;
        }

        const latestPrice = priceData[priceData.length - 1].price;
        const previousPrice = priceData[priceData.length - 2].price;
        const priceChange = ((latestPrice - previousPrice) / previousPrice) * 100;

        // Mock data for trade indicators
        const tradeIndicators = {
            wheat: { indicator: 'Bullish', wa_r: '12%', highRisk: '3/15', sentiment: 'positive' },
            rice: { indicator: 'Bearish', wa_r: '5%', highRisk: '2/13', sentiment: 'negative' },
            corn: { indicator: 'Neutral', wa_r: '8%', highRisk: '4/12', sentiment: 'neutral' },
            gold: { indicator: 'Bullish', wa_r: '15%', highRisk: '1/8', sentiment: 'positive' },
            silver: { indicator: 'Bearish', wa_r: '7%', highRisk: '2/10', sentiment: 'negative' },
            crude_oil: { indicator: 'Bullish', wa_r: '18%', highRisk: '5/20', sentiment: 'positive' },
            cotton: { indicator: 'Neutral', wa_r: '6%', highRisk: '3/14', sentiment: 'neutral' },
            coffee: { indicator: 'Bullish', wa_r: '11%', highRisk: '2/11', sentiment: 'positive' },
        };

        const stats = tradeIndicators[commodityId] || { 
            indicator: 'Neutral', 
            wa_r: '0%', 
            highRisk: '0/0',
            sentiment: 'neutral'
        };

        return {
            ...commodity,
            price: latestPrice,
            priceChange,
            ...stats
        };
    };

    const commodityStats = selectedProducts
        .map(id => getCommodityStats(id))
        .filter(Boolean);

    return (
        <div className="market-pulse">
            <div className="section-header">
                <h2>Exchange Traded Commodities</h2>
                <p className="section-subtitle">Live market indicators and trade signals</p>
            </div>

            <div className="commodity-grid">
                {commodityStats.map(commodity => (
                    <div 
                        key={commodity.id} 
                        className={`commodity-card ${commodity.sentiment}`}
                        onClick={() => onCommodityClick(commodity.id)}
                    >
                        <div className="commodity-image">
                            <img src={`/images/${commodity.id}.jpg`} alt={commodity.name} />
                            <div className="commodity-overlay">
                                <span className="commodity-name">{commodity.name.toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="commodity-stats">
                            <div className="stat-row">
                                <span className="stat-label">Trade Indicator</span>
                                <span className={`stat-value indicator ${commodity.sentiment}`}>
                                    {commodity.indicator}
                                </span>
                            </div>

                            <div className="stat-row">
                                <span className="stat-label">Price Change (7D)</span>
                                <span className={`stat-value price ${commodity.priceChange >= 0 ? 'positive' : 'negative'}`}>
                                    {commodity.priceChange >= 0 ? '+' : ''}{commodity.priceChange.toFixed(1)}%
                                    {commodity.priceChange >= 0 ? 
                                        <TrendingUp size={14} /> : 
                                        <TrendingDown size={14} />
                                    }
                                </span>
                            </div>

                            <div className="stat-row">
                                <span className="stat-label">WA%R</span>
                                <span className="stat-value">{commodity.wa_r}</span>
                            </div>

                            <div className="stat-row">
                                <span className="stat-label">High-Risk Countries</span>
                                <span className="stat-value risk">
                                    {commodity.highRisk}
                                    {parseInt(commodity.highRisk.split('/')[0]) > 2 && (
                                        <AlertTriangle size={14} className="risk-icon" />
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="commodity-price">
                            <span className="current-price">${commodity.price.toFixed(2)}</span>
                            <span className="price-unit">per {commodity.unit || 'unit'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MarketPulse;
