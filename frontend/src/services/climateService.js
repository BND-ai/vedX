const API_BASE_URL = 'http://localhost:8000/api/v1/climate';

class ClimateService {
    async getClimateAlerts(commodities = []) {
        try {
            const params = new URLSearchParams();
            commodities.forEach(commodity => params.append('commodities', commodity));
            
            const response = await fetch(`${API_BASE_URL}/alerts?${params}`);
            if (!response.ok) throw new Error('Failed to fetch climate alerts');
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching climate alerts:', error);
            return { weather_alerts: [], regional_risks: [] };
        }
    }

    async getSupplyRiskIndicators(commodities) {
        try {
            const params = new URLSearchParams();
            commodities.forEach(commodity => params.append('commodities', commodity));
            
            const response = await fetch(`${API_BASE_URL}/supply-risk?${params}`);
            if (!response.ok) throw new Error('Failed to fetch supply risk data');
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching supply risk indicators:', error);
            return { supply_indicators: {}, production_data: [] };
        }
    }

    async getFinancialImpactMetrics(commodities) {
        try {
            const params = new URLSearchParams();
            commodities.forEach(commodity => params.append('commodities', commodity));
            
            const response = await fetch(`${API_BASE_URL}/financial-impact?${params}`);
            if (!response.ok) throw new Error('Failed to fetch financial impact data');
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching financial impact metrics:', error);
            return { financial_metrics: {}, price_data: {}, economic_indicators: {} };
        }
    }

    async getPriceImpactMatrix(commodities) {
        try {
            const params = new URLSearchParams();
            commodities.forEach(commodity => params.append('commodities', commodity));
            
            const response = await fetch(`${API_BASE_URL}/price-impact-matrix?${params}`);
            if (!response.ok) throw new Error('Failed to fetch price impact matrix');
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching price impact matrix:', error);
            return { price_impact_matrix: [] };
        }
    }

    async getClimateDashboard(commodities) {
        try {
            const params = new URLSearchParams();
            commodities.forEach(commodity => params.append('commodities', commodity));
            
            const response = await fetch(`${API_BASE_URL}/dashboard?${params}`);
            if (!response.ok) throw new Error('Failed to fetch climate dashboard');
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching climate dashboard:', error);
            // Return fallback data structure
            return {
                alerts: { weather_alerts: [], regional_risks: [] },
                supply_risk: { supply_indicators: {}, production_data: [] },
                financial_impact: { financial_metrics: {}, price_data: {}, economic_indicators: {} },
                price_impact_matrix: { price_impact_matrix: [] }
            };
        }
    }

    // Get seasonality data for heatmap
    async getSeasonalityData(commodity, region = 'USA') {
        try {
            const response = await fetch(`${API_BASE_URL}/seasonality/${commodity}?region=${region}`);
            if (!response.ok) throw new Error('Failed to fetch seasonality data');
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching seasonality data:', error);
            return this.getFallbackSeasonalityData(commodity, region);
        }
    }

    async getSeasonalityMatrix(commodities = [], regions = []) {
        try {
            const params = new URLSearchParams();
            commodities.forEach(commodity => params.append('commodities', commodity));
            regions.forEach(region => params.append('regions', region));
            
            const response = await fetch(`${API_BASE_URL}/seasonality-matrix?${params}`);
            if (!response.ok) throw new Error('Failed to fetch seasonality matrix');
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching seasonality matrix:', error);
            return { seasonality_matrix: [] };
        }
    }

    // Transform API data to component format
    transformAlertsData(apiData) {
        const alerts = apiData.weather_alerts || [];
        return alerts.map(alert => ({
            id: alert.id || Math.random().toString(36).substr(2, 9),
            region: alert.region || 'Unknown Region',
            commodity: this.extractCommodityFromDescription(alert.description || ''),
            threat: alert.threat || 'Weather Alert',
            severity: alert.severity || 'medium',
            impact: this.calculateImpactFromSeverity(alert.severity),
            days: this.calculateDaysFromTimes(alert.start_time, alert.end_time)
        }));
    }

    transformSupplyRiskData(apiData) {
        const indicators = apiData.supply_indicators || {};
        return [
            { 
                metric: 'Yield Impact', 
                value: indicators.yield_impact || '-15%', 
                trend: this.getTrendFromValue(indicators.yield_impact), 
                color: '#f44336' 
            },
            { 
                metric: 'Production Risk', 
                value: indicators.production_risk_score || '78/100', 
                trend: this.getTrendFromRiskScore(indicators.production_risk_score), 
                color: '#ff9800' 
            },
            { 
                metric: 'Supply Disruption', 
                value: indicators.supply_disruption_days || '12 days', 
                trend: this.getTrendFromDays(indicators.supply_disruption_days), 
                color: '#f44336' 
            },
            { 
                metric: 'Alt Sources', 
                value: indicators.alternative_sources_pct || '45%', 
                trend: this.getTrendFromPercentage(indicators.alternative_sources_pct), 
                color: '#4caf50' 
            }
        ];
    }

    transformFinancialData(apiData) {
        const metrics = apiData.financial_metrics || {};
        return [
            { 
                metric: 'Current Price', 
                value: metrics.current_price || '$545/MT', 
                change: metrics.price_change_pct || '+9.0%', 
                trend: 'up',
                calculation: 'Base price + Climate premium'
            },
            { 
                metric: 'Climate Premium', 
                value: metrics.climate_premium || '$45/MT', 
                change: this.calculateChange(metrics.climate_premium, '$33/MT'), 
                trend: 'up',
                calculation: 'Weather impact × 0.3 + Supply risk × 0.2'
            },
            { 
                metric: 'Volatility Index', 
                value: metrics.volatility_index || '75/100', 
                change: this.calculatePercentageChange(metrics.volatility_spike_probability, '70%'), 
                trend: 'up',
                calculation: '(Weather severity + Disruption days) × 12.5'
            },
            { 
                metric: 'Insurance Cost', 
                value: metrics.insurance_cost || '+$8/MT', 
                change: this.calculateChange(metrics.insurance_cost, '+$5/MT'), 
                trend: 'up',
                calculation: 'Risk score × Commodity value × 2%'
            }
        ];
    }

    transformPriceImpactMatrix(apiData) {
        const matrix = apiData.price_impact_matrix || [];
        return matrix.map(item => ({
            ...item,
            // Add price calculations for display
            drought_target: item.drought_price || 'N/A',
            flood_target: item.flood_price || 'N/A',
            frost_target: item.frost_price || 'N/A',
            base_price_display: item.base_price || 'N/A'
        }));
    }

    // Helper methods for trend calculation
    getTrendFromValue(value) {
        if (!value) return 'stable';
        const numValue = parseFloat(value.replace(/[^-\d.]/g, ''));
        return numValue < 0 ? 'down' : numValue > 0 ? 'up' : 'stable';
    }

    getTrendFromRiskScore(score) {
        if (!score) return 'stable';
        const numValue = parseInt(score.split('/')[0]);
        return numValue > 75 ? 'up' : numValue < 50 ? 'down' : 'stable';
    }

    getTrendFromDays(days) {
        if (!days) return 'stable';
        const numValue = parseInt(days.replace(/\D/g, ''));
        return numValue > 10 ? 'up' : numValue < 5 ? 'down' : 'stable';
    }

    getTrendFromPercentage(percentage) {
        if (!percentage) return 'stable';
        const numValue = parseInt(percentage.replace('%', ''));
        return numValue > 60 ? 'up' : numValue < 40 ? 'down' : 'stable';
    }

    calculateChange(currentValue, previousValue) {
        if (!currentValue || !previousValue) return '+$0';
        
        const current = parseFloat(currentValue.replace(/[^\d.]/g, ''));
        const previous = parseFloat(previousValue.replace(/[^\d.]/g, ''));
        const change = current - previous;
        
        return change >= 0 ? `+$${Math.abs(change).toFixed(0)}` : `-$${Math.abs(change).toFixed(0)}`;
    }

    calculatePercentageChange(currentValue, previousValue) {
        if (!currentValue || !previousValue) return '+0%';
        
        const current = parseFloat(currentValue.replace('%', ''));
        const previous = parseFloat(previousValue.replace('%', ''));
        const change = current - previous;
        
        return change >= 0 ? `+${Math.abs(change).toFixed(0)}%` : `-${Math.abs(change).toFixed(0)}%`;
    }

    getFallbackSeasonalityData(commodity, region) {
        // Fallback seasonality patterns
        const patterns = {
            corn: {
                USA: { Jan: '-5%', Feb: '-2%', Mar: '+8%', Apr: '+12%', May: '+15%', Jun: '+12%', Jul: '+5%', Aug: '-8%', Sep: '-15%', Oct: '-12%', Nov: '-8%', Dec: '-2%' },
                India: { Jan: '-12%', Feb: '-8%', Mar: '+15%', Apr: '+18%', May: '+12%', Jun: '+5%', Jul: '-5%', Aug: '-8%', Sep: '-12%', Oct: '-18%', Nov: '-15%', Dec: '-5%' }
            },
            wheat: {
                USA: { Jan: '-8%', Feb: '-5%', Mar: '+15%', Apr: '+18%', May: '+12%', Jun: '+5%', Jul: '-8%', Aug: '-12%', Sep: '-18%', Oct: '-15%', Nov: '-8%', Dec: '-3%' },
                Russia: { Jan: '-8%', Feb: '-5%', Mar: '+2%', Apr: '+8%', May: '+12%', Jun: '+15%', Jul: '-8%', Aug: '-2%', Sep: '+12%', Oct: '+15%', Nov: '+8%', Dec: '+3%' }
            }
        };
        
        return {
            commodity: commodity.charAt(0).toUpperCase() + commodity.slice(1),
            region: region,
            monthly_patterns: patterns[commodity]?.[region] || patterns.corn.USA,
            trading_insights: {
                best_buy_window: 'Sep (-15%)',
                best_sell_window: 'May (+15%)',
                seasonal_spread: '30%',
                volatility_period: 'Apr-May'
            }
        };
    }

    // Helper methods
    extractCommodityFromDescription(description) {
        const commodities = ['Corn', 'Wheat', 'Rice', 'Soybean'];
        for (const commodity of commodities) {
            if (description.toLowerCase().includes(commodity.toLowerCase())) {
                return commodity;
            }
        }
        return 'Unknown';
    }

    calculateImpactFromSeverity(severity) {
        const impactMap = {
            'critical': '+25%',
            'high': '+18%',
            'medium': '+12%',
            'low': '+5%'
        };
        return impactMap[severity] || '+10%';
    }

    calculateDaysFromTimes(startTime, endTime) {
        if (!startTime || !endTime) return Math.floor(Math.random() * 7) + 1;
        
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(1, diffDays);
    }
}

export default new ClimateService();