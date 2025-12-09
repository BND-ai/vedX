import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PRICE_DATA, COMMODITIES } from '../../data/mockData';
import { TrendingUp } from 'lucide-react';
import './PriceChart.css';

const PriceChart = ({ selectedProducts }) => {
    const [timeframe, setTimeframe] = useState('1M');

    // Get commodity colors
    const colors = ['#0066ff', '#00d4ff', '#ffa500', '#00ff00', '#ff4444'];

    // Merge price data for all selected products
    const getMergedData = () => {
        if (!selectedProducts.length) return [];
        
        const dates = PRICE_DATA[selectedProducts[0]]?.map(d => d.date) || [];
        
        return dates.map(date => {
            const dataPoint = { date };
            selectedProducts.forEach(productId => {
                const productData = PRICE_DATA[productId];
                if (productData) {
                    const priceEntry = productData.find(p => p.date === date);
                    if (priceEntry) {
                        const commodity = COMMODITIES.find(c => c.id === productId);
                        dataPoint[commodity.name] = priceEntry.price;
                    }
                }
            });
            return dataPoint;
        });
    };

    const data = getMergedData();
    const selectedCommodities = COMMODITIES.filter(c => selectedProducts.includes(c.id));

    return (
        <div className="price-chart-container">
            <div className="chart-header">
                <div className="chart-title">
                    <TrendingUp size={20} />
                    <h3>Price Trends</h3>
                </div>
                <div className="timeframe-selector">
                    {['1D', '1W', '1M', '3M', '1Y'].map(tf => (
                        <button
                            key={tf}
                            className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
                            onClick={() => setTimeframe(tf)}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                        <XAxis 
                            dataKey="date" 
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <YAxis 
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip 
                            contentStyle={{
                                background: 'rgba(15, 23, 42, 0.95)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '8px',
                                color: 'white'
                            }}
                        />
                        <Legend 
                            wrapperStyle={{ color: '#94a3b8' }}
                        />
                        {selectedCommodities.map((commodity, index) => (
                            <Line
                                key={commodity.id}
                                type="monotone"
                                dataKey={commodity.name}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PriceChart;
