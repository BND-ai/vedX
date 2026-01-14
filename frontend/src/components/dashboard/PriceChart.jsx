import React, { useState, useMemo } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area, ComposedChart
} from 'recharts';
import { PRICE_DATA, COMMODITIES } from '../../data/mockData';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, AlertTriangle, Percent, Waves } from 'lucide-react';
import './PriceChart.css';

const PriceChart = ({ selectedProducts }) => {
    const [timeframe, setTimeframe] = useState('1M');

    // Get commodity colors
    const colors = ['#0066ff', '#00d4ff', '#ffa500', '#00ff00', '#ff4444'];

    // Filter data based on timeframe
    const getFilteredData = (data, timeframe) => {
        if (!data || data.length === 0) return data;
        
        try {
            let dataPoints;
            
            switch (timeframe) {
                case '1D':
                    dataPoints = 1;
                    break;
                case '1W':
                    dataPoints = 7;
                    break;
                case '1M':
                    dataPoints = 30;
                    break;
                case '3M':
                    dataPoints = 90;
                    break;
                case '1Y':
                    dataPoints = 365;
                    break;
                default:
                    return data;
            }
            
            // Return last N data points
            return data.slice(-dataPoints);
        } catch (error) {
            console.error('Error filtering data:', error);
            return data;
        }
    };

    // Calculate KPIs for selected commodities
    const priceKPIs = useMemo(() => {
        try {
            if (!selectedProducts.length) return [];

            return selectedProducts.map(productId => {
                const productData = PRICE_DATA[productId];
                if (!productData || productData.length === 0) return null;

                // Filter data based on timeframe
                const filteredData = getFilteredData(productData, timeframe);
                if (filteredData.length === 0) return null;

                const commodity = COMMODITIES.find(c => c.id === productId);
                const latestPrice = filteredData[filteredData.length - 1].price;
                const previousPrice = filteredData.length > 1 ? filteredData[filteredData.length - 2].price : latestPrice;
                const weekAgoPrice = filteredData.length > 7 ? filteredData[filteredData.length - 8].price : filteredData[0].price;
                const firstPrice = filteredData[0].price;

                // Calculate changes based on filtered timeframe
                const change1D = ((latestPrice - previousPrice) / previousPrice) * 100;
                const change7D = ((latestPrice - weekAgoPrice) / weekAgoPrice) * 100;
                const changeTotal = ((latestPrice - firstPrice) / firstPrice) * 100;

                // Calculate volatility (standard deviation of price changes)
                const priceChanges = [];
                for (let i = 1; i < filteredData.length; i++) {
                    const change = ((filteredData[i].price - filteredData[i - 1].price) / filteredData[i - 1].price) * 100;
                    priceChanges.push(change);
                }
                const avgChange = priceChanges.length > 0 ? priceChanges.reduce((sum, val) => sum + val, 0) / priceChanges.length : 0;
                const variance = priceChanges.length > 0 ? priceChanges.reduce((sum, val) => sum + Math.pow(val - avgChange, 2), 0) / priceChanges.length : 0;
                const volatility = Math.sqrt(variance).toFixed(2);

                // Determine trend based on total change in timeframe
                const trend = changeTotal > 2 ? 'bullish' : changeTotal < -2 ? 'bearish' : 'neutral';
                const trendLabel = changeTotal > 2 ? 'Bullish' : changeTotal < -2 ? 'Bearish' : 'Neutral';

                // Find support and resistance from filtered data
                const prices = filteredData.map(d => d.price);
                const support = Math.min(...prices);
                const resistance = Math.max(...prices);

                return {
                    commodity,
                    latestPrice,
                    change1D: change1D.toFixed(2),
                    change7D: change7D.toFixed(2),
                    change30D: changeTotal.toFixed(2),
                    volatility,
                    trend,
                    trendLabel,
                    support,
                    resistance
                };
            }).filter(Boolean);
        } catch (error) {
            console.error('Error calculating KPIs:', error);
            return [];
        }
    }, [selectedProducts, timeframe]);

    // Merge price data for all selected products
    const getMergedData = () => {
        try {
            if (!selectedProducts.length) return [];
            
            const dates = PRICE_DATA[selectedProducts[0]]?.map(d => d.date) || [];
            
            const mergedData = dates.map(date => {
                const dataPoint = { date };
                selectedProducts.forEach(productId => {
                    const productData = PRICE_DATA[productId];
                    if (productData) {
                        const priceEntry = productData.find(p => p.date === date);
                        if (priceEntry) {
                            const commodity = COMMODITIES.find(c => c.id === productId);
                            if (commodity) {
                                dataPoint[commodity.name] = priceEntry.price;
                            }
                        }
                    }
                });
                return dataPoint;
            });
            
            return getFilteredData(mergedData, timeframe);
        } catch (error) {
            console.error('Error merging data:', error);
            return [];
        }
    };

    const data = getMergedData();
    const selectedCommodities = COMMODITIES.filter(c => selectedProducts.includes(c.id));

    // Calculate percentage change data
    const getPercentageChangeData = () => {
        if (!selectedProducts.length) return [];
        
        const dates = PRICE_DATA[selectedProducts[0]]?.map(d => d.date) || [];
        const firstDatePrices = {};
        
        const baseData = dates.map(date => {
            const dataPoint = { date };
            selectedProducts.forEach(productId => {
                const productData = PRICE_DATA[productId];
                if (productData) {
                    const priceEntry = productData.find(p => p.date === date);
                    const commodity = COMMODITIES.find(c => c.id === productId);
                    if (priceEntry) {
                        dataPoint[commodity.name] = priceEntry.price;
                    }
                }
            });
            return dataPoint;
        });
        
        const filteredData = getFilteredData(baseData, timeframe);
        
        // Set first date prices from filtered data
        if (filteredData.length > 0) {
            selectedProducts.forEach(productId => {
                const commodity = COMMODITIES.find(c => c.id === productId);
                if (filteredData[0][commodity.name]) {
                    firstDatePrices[commodity.name] = filteredData[0][commodity.name];
                }
            });
        }
        
        return filteredData.map(item => {
            const dataPoint = { date: item.date };
            selectedProducts.forEach(productId => {
                const commodity = COMMODITIES.find(c => c.id === productId);
                if (item[commodity.name] && firstDatePrices[commodity.name]) {
                    const change = ((item[commodity.name] - firstDatePrices[commodity.name]) / firstDatePrices[commodity.name]) * 100;
                    dataPoint[`${commodity.name} Change`] = change;
                }
            });
            return dataPoint;
        });
    };

    // Calculate moving averages
    const getMovingAverageData = (period = 3) => {
        if (!selectedProducts.length) return [];
        
        const baseData = getMergedData();
        return baseData.map((item, index) => {
            const result = { ...item };
            selectedCommodities.forEach(commodity => {
                if (index >= period - 1) {
                    let sum = 0;
                    for (let i = index - period + 1; i <= index; i++) {
                        sum += baseData[i][commodity.name] || 0;
                    }
                    result[`${commodity.name} MA${period}`] = sum / period;
                }
            });
            return result;
        });
    };

    // Get current prices for comparison
    const getCurrentPricesData = () => {
        return selectedCommodities.map(commodity => {
            const productData = PRICE_DATA[commodity.id];
            const latestPrice = productData && productData.length > 0 
                ? productData[productData.length - 1].price 
                : 0;
            return {
                name: commodity.name,
                icon: commodity.icon,
                price: latestPrice
            };
        });
    };

    // Get volatility trend data
    const getVolatilityData = () => {
        if (!selectedProducts.length) return [];
        
        const baseData = getMergedData();
        
        return baseData.map((item, index) => {
            if (index < 2) return { date: item.date, volatility: 0 };
            
            const dataPoint = { date: item.date };
            selectedProducts.forEach(productId => {
                const commodity = COMMODITIES.find(c => c.id === productId);
                if (index >= 2) {
                    const prices = baseData.slice(Math.max(0, index - 2), index + 1).map(d => d[commodity.name]).filter(p => p);
                    if (prices.length >= 2) {
                        const changes = [];
                        for (let i = 1; i < prices.length; i++) {
                            changes.push(Math.abs((prices[i] - prices[i-1]) / prices[i-1]) * 100);
                        }
                        const avgChange = changes.reduce((sum, val) => sum + val, 0) / changes.length;
                        dataPoint[commodity.name] = avgChange.toFixed(2);
                    }
                }
            });
            return dataPoint;
        }).filter(d => d.date);
    };

    const percentageChangeData = useMemo(() => getPercentageChangeData(), [selectedProducts, timeframe]);
    const movingAverageData = useMemo(() => getMovingAverageData(3), [selectedProducts, timeframe]);
    const currentPricesData = getCurrentPricesData();
    const volatilityData = useMemo(() => getVolatilityData(), [selectedProducts, timeframe]);

    return (
        <div className="price-chart-container">
            {/* Price KPIs */}
            {priceKPIs.length > 0 && (
                <div className="price-kpis-section">
                    {priceKPIs.map((kpi, index) => (
                        <div key={kpi.commodity.id} className="price-kpi-grid">
                            {/* Current Price */}
                            <div className="price-kpi-card">
                                <div className="kpi-icon" style={{background: '#e0f2fe'}}>
                                    <DollarSign size={20} color="#0284c7" />
                                </div>
                                <div className="kpi-content">
                                    <div className="kpi-label">Current Price</div>
                                    <div className="kpi-value">{kpi.commodity.icon} ${kpi.latestPrice.toLocaleString()}</div>
                                    <div className="kpi-subtext">{kpi.commodity.name}</div>
                                </div>
                            </div>

                            {/* Period Change */}
                            <div className="price-kpi-card">
                                <div className="kpi-icon" style={{background: kpi.trend === 'bullish' ? '#dcfce7' : kpi.trend === 'bearish' ? '#fee2e2' : '#f3f4f6'}}>
                                    {kpi.trend === 'bullish' ? <TrendingUp size={20} color="#16a34a" /> : 
                                     kpi.trend === 'bearish' ? <TrendingDown size={20} color="#dc2626" /> : 
                                     <Activity size={20} color="#6b7280" />}
                                </div>
                                <div className="kpi-content">
                                    <div className="kpi-label">{timeframe} Change</div>
                                    <div className={`kpi-value ${kpi.trend === 'bullish' ? 'positive' : kpi.trend === 'bearish' ? 'negative' : 'neutral'}`}>
                                        {kpi.change30D > 0 ? '+' : ''}{kpi.change30D}%
                                    </div>
                                    <div className="kpi-subtext">{kpi.trendLabel} Trend</div>
                                </div>
                            </div>

                            {/* Volatility */}
                            <div className="price-kpi-card">
                                <div className="kpi-icon" style={{background: '#fef3c7'}}>
                                    <BarChart3 size={20} color="#f59e0b" />
                                </div>
                                <div className="kpi-content">
                                    <div className="kpi-label">Volatility</div>
                                    <div className="kpi-value">{kpi.volatility}%</div>
                                    <div className="kpi-subtext">
                                        {parseFloat(kpi.volatility) > 5 ? 'High Risk' : 
                                         parseFloat(kpi.volatility) > 2 ? 'Medium Risk' : 'Low Risk'}
                                    </div>
                                </div>
                            </div>

                            {/* Support & Resistance */}
                            <div className="price-kpi-card">
                                <div className="kpi-icon" style={{background: '#ede9fe'}}>
                                    <AlertTriangle size={20} color="#7c3aed" />
                                </div>
                                <div className="kpi-content">
                                    <div className="kpi-label">Support / Resistance</div>
                                    <div className="kpi-value" style={{fontSize: '0.875rem'}}>
                                        ${kpi.support.toLocaleString()} / ${kpi.resistance.toLocaleString()}
                                    </div>
                                    <div className="kpi-subtext">Price Range</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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

            <div className="charts-grid">
                {/* Main Price Chart with Moving Averages */}
                <div className="chart-card">
                    <div className="chart-header-small">
                        <h4>Price Trends with Moving Averages</h4>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={movingAverageData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                />
                                <YAxis 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
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
                                    wrapperStyle={{ color: '#94a3b8', fontSize: '0.75rem' }}
                                />
                                {selectedCommodities.map((commodity, index) => (
                                    <React.Fragment key={commodity.id}>
                                        <Line
                                            type="monotone"
                                            dataKey={commodity.name}
                                            stroke={colors[index % colors.length]}
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 5 }}
                                            name={commodity.name}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={`${commodity.name} MA3`}
                                            stroke={colors[index % colors.length]}
                                            strokeWidth={1.5}
                                            strokeDasharray="5 5"
                                            dot={false}
                                            name={`${commodity.name} MA(3)`}
                                            opacity={0.6}
                                        />
                                    </React.Fragment>
                                ))}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Percentage Change Chart */}
                <div className="chart-card">
                    <div className="chart-header-small">
                        <Percent size={18} />
                        <h4>Percentage Change from Start</h4>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={percentageChangeData}>
                                <defs>
                                    {selectedCommodities.map((commodity, index) => (
                                        <linearGradient key={commodity.id} id={`color${commodity.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0}/>
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                />
                                <YAxis 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    label={{ value: '% Change', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                    formatter={(value) => `${value.toFixed(2)}%`}
                                />
                                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.75rem' }} />
                                {selectedCommodities.map((commodity, index) => (
                                    <Area
                                        key={commodity.id}
                                        type="monotone"
                                        dataKey={`${commodity.name} Change`}
                                        stroke={colors[index % colors.length]}
                                        strokeWidth={2}
                                        fill={`url(#color${commodity.id})`}
                                        name={commodity.name}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Current Prices Comparison */}
                <div className="chart-card">
                    <div className="chart-header-small">
                        <BarChart3 size={18} />
                        <h4>Current Price Comparison</h4>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={currentPricesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                />
                                <YAxis 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                    formatter={(value, name, props) => [
                                        `$${value.toLocaleString()}`,
                                        `${props.payload.icon} ${props.payload.name}`
                                    ]}
                                />
                                <Bar 
                                    dataKey="price" 
                                    radius={[4, 4, 0, 0]}
                                >
                                    {currentPricesData.map((entry, index) => {
                                        const commodityIndex = selectedCommodities.findIndex(c => c.name === entry.name);
                                        return (
                                            <Bar.Cell 
                                                key={entry.name} 
                                                fill={commodityIndex >= 0 ? colors[commodityIndex % colors.length] : '#0066ff'} 
                                            />
                                        );
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Volatility Trend */}
                <div className="chart-card">
                    <div className="chart-header-small">
                        <Waves size={18} />
                        <h4>Volatility Trend</h4>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={volatilityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                />
                                <YAxis 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    label={{ value: 'Volatility %', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                    formatter={(value) => `${value}%`}
                                />
                                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.75rem' }} />
                                {selectedCommodities.map((commodity, index) => (
                                    <Line
                                        key={commodity.id}
                                        type="monotone"
                                        dataKey={commodity.name}
                                        stroke={colors[index % colors.length]}
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                        name={commodity.name}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceChart;
