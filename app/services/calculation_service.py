import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any
import statistics

class CalculationService:
    
    def __init__(self):
        # Base commodity data for calculations
        self.commodity_base_prices = {
            'corn': 650.0,  # USD per metric ton
            'wheat': 280.0,
            'rice': 450.0,
            'soybean': 520.0,
            'cotton': 1650.0,
            'sugar': 420.0
        }
        
        # Regional production weights
        self.regional_weights = {
            'USA': {'corn': 0.35, 'wheat': 0.15, 'soybean': 0.38},
            'India': {'rice': 0.22, 'wheat': 0.12, 'cotton': 0.25},
            'Russia': {'wheat': 0.18, 'corn': 0.02},
            'Brazil': {'soybean': 0.28, 'corn': 0.08, 'sugar': 0.35},
            'China': {'rice': 0.28, 'corn': 0.22}
        }

    def calculate_climate_impact_percentage(self, weather_data: Dict, commodity: str, region: str) -> float:
        """Calculate climate impact percentage based on weather severity and regional exposure"""
        base_impact = 0.0
        
        # Weather severity multipliers
        severity_multipliers = {
            'critical': 0.25,
            'high': 0.18,
            'medium': 0.12,
            'low': 0.05
        }
        
        # Get regional weight for commodity
        regional_weight = self.regional_weights.get(region, {}).get(commodity.lower(), 0.1)
        
        # Calculate impact based on weather alerts
        for alert in weather_data.get('weather_alerts', []):
            severity = alert.get('severity', 'medium')
            impact_multiplier = severity_multipliers.get(severity, 0.1)
            base_impact += impact_multiplier * regional_weight
        
        return min(base_impact * 100, 30.0)  # Cap at 30%

    def calculate_yield_impact(self, weather_data: Dict, production_data: Dict, commodity: str) -> str:
        """Calculate yield impact percentage"""
        # Base yield impact from weather
        weather_impact = 0.0
        
        for alert in weather_data.get('weather_alerts', []):
            threat_type = alert.get('threat', '').lower()
            if 'drought' in threat_type:
                weather_impact += 0.15
            elif 'flood' in threat_type:
                weather_impact += 0.12
            elif 'frost' in threat_type:
                weather_impact += 0.08
            else:
                weather_impact += 0.05
        
        # Adjust based on production trends
        production_trend = production_data.get('trend', 0)
        if production_trend < -0.05:  # Declining production
            weather_impact += 0.05
        
        impact_pct = min(weather_impact * 100, 25.0)
        return f"-{impact_pct:.0f}%"

    def calculate_production_risk_score(self, weather_data: Dict, supply_data: Dict) -> str:
        """Calculate production risk score out of 100"""
        base_score = 50
        
        # Weather risk factors
        alert_count = len(weather_data.get('weather_alerts', []))
        weather_risk = min(alert_count * 8, 30)
        
        # Supply chain risk
        supply_disruption = supply_data.get('disruption_probability', 0.2)
        supply_risk = supply_disruption * 25
        
        # Regional concentration risk
        concentration_risk = 15  # Base regional concentration risk
        
        total_risk = base_score + weather_risk + supply_risk + concentration_risk
        return f"{min(int(total_risk), 95)}/100"

    def calculate_supply_disruption_days(self, weather_data: Dict, logistics_data: Dict) -> str:
        """Calculate expected supply disruption days"""
        base_days = 3
        
        # Add days based on weather severity
        for alert in weather_data.get('weather_alerts', []):
            severity = alert.get('severity', 'medium')
            if severity == 'critical':
                base_days += 8
            elif severity == 'high':
                base_days += 5
            elif severity == 'medium':
                base_days += 3
            else:
                base_days += 1
        
        # Add logistics delays
        logistics_delay = logistics_data.get('expected_delay_days', 2)
        total_days = base_days + logistics_delay
        
        return f"{min(total_days, 21)} days"

    def calculate_alternative_sources_percentage(self, commodity: str, affected_regions: List[str]) -> str:
        """Calculate percentage of alternative sources available"""
        total_regions = len(self.regional_weights)
        affected_count = len(affected_regions)
        
        # Calculate based on regional production capacity
        total_capacity = 0
        affected_capacity = 0
        
        for region, commodities in self.regional_weights.items():
            capacity = commodities.get(commodity.lower(), 0)
            total_capacity += capacity
            if region in affected_regions:
                affected_capacity += capacity
        
        if total_capacity == 0:
            return "50%"
        
        alternative_pct = ((total_capacity - affected_capacity) / total_capacity) * 100
        return f"{max(int(alternative_pct), 25)}%"

    def calculate_climate_premium(self, commodity: str, weather_impact: float, supply_risk: float) -> str:
        """Calculate climate premium in USD per metric ton"""
        base_price = self.commodity_base_prices.get(commodity.lower(), 500.0)
        
        # Premium calculation based on risk factors
        weather_premium = (weather_impact / 100) * base_price * 0.3
        supply_premium = supply_risk * base_price * 0.2
        
        total_premium = weather_premium + supply_premium
        return f"${int(total_premium)}/MT"

    def calculate_current_price_with_premium(self, commodity: str, climate_premium: str) -> str:
        """Calculate current market price including climate premium"""
        base_price = self.commodity_base_prices.get(commodity.lower(), 500.0)
        premium_value = float(climate_premium.replace('$', '').replace('/MT', ''))
        
        current_price = base_price + premium_value
        return f"${int(current_price)}/MT"

    def calculate_price_change_percentage(self, commodity: str, climate_premium: str) -> str:
        """Calculate percentage change from base price due to climate factors"""
        base_price = self.commodity_base_prices.get(commodity.lower(), 500.0)
        premium_value = float(climate_premium.replace('$', '').replace('/MT', ''))
        
        percentage_change = (premium_value / base_price) * 100
        return f"+{percentage_change:.1f}%"

    def calculate_price_volatility_index(self, weather_severity: str, supply_disruption_days: str) -> str:
        """Calculate price volatility index based on climate factors"""
        severity_scores = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
        severity_score = severity_scores.get(weather_severity, 2)
        
        disruption_days = int(supply_disruption_days.replace(' days', ''))
        disruption_score = min(disruption_days / 5, 4)  # Max score of 4
        
        volatility_index = (severity_score + disruption_score) * 12.5  # Scale to 100
        return f"{min(int(volatility_index), 100)}/100"

    def calculate_volatility_spike_probability(self, price_data: Dict, weather_severity: str) -> str:
        """Calculate probability of volatility spike"""
        base_probability = 0.45
        
        # Adjust based on weather severity
        severity_adjustments = {
            'critical': 0.35,
            'high': 0.25,
            'medium': 0.15,
            'low': 0.05
        }
        
        weather_adjustment = severity_adjustments.get(weather_severity, 0.1)
        
        # Adjust based on recent price volatility
        recent_volatility = price_data.get('volatility_30d', 0.15)
        volatility_adjustment = min(recent_volatility, 0.2)
        
        total_probability = base_probability + weather_adjustment + volatility_adjustment
        return f"{min(int(total_probability * 100), 95)}%"

    def calculate_insurance_cost_increase(self, risk_score: int, commodity: str) -> str:
        """Calculate insurance cost increase per metric ton"""
        base_price = self.commodity_base_prices.get(commodity.lower(), 500.0)
        
        # Insurance cost as percentage of commodity value
        risk_multiplier = (risk_score / 100) * 0.02  # 2% max
        insurance_increase = base_price * risk_multiplier
        
        return f"+${int(insurance_increase)}/MT"

    def calculate_hedge_coverage_percentage(self, market_data: Dict, risk_level: str) -> str:
        """Calculate recommended hedge coverage percentage"""
        base_coverage = 0.5
        
        # Adjust based on risk level
        risk_adjustments = {
            'critical': 0.25,
            'high': 0.18,
            'medium': 0.12,
            'low': 0.05
        }
        
        risk_adjustment = risk_adjustments.get(risk_level, 0.1)
        
        # Adjust based on market conditions
        market_volatility = market_data.get('volatility', 0.15)
        volatility_adjustment = min(market_volatility, 0.2)
        
        total_coverage = base_coverage + risk_adjustment + volatility_adjustment
        return f"{min(int(total_coverage * 100), 85)}%"

    def calculate_seasonality_heatmap(self, commodity: str, region: str) -> Dict[str, str]:
        """Calculate monthly seasonality percentages for heatmap"""
        # Base seasonal patterns by commodity and region
        seasonal_patterns = {
            'corn': {
                'USA': [-5, -2, 8, 12, 15, 12, 5, -8, -15, -12, -8, -2],
                'Brazil': [2, 5, -3, -8, -12, -15, -18, -10, 5, 8, 12, 15],
                'India': [-8, -5, 12, 18, 15, 8, -2, -12, -15, -18, -12, -5]
            },
            'wheat': {
                'USA': [-8, -5, 15, 18, 12, 5, -8, -12, -18, -15, -8, -3],
                'Russia': [-8, -5, 2, 8, 12, 15, -8, -2, 12, 15, 8, 3],
                'India': [-12, -8, 15, 18, 12, 5, -5, -8, -12, -18, -15, -5]
            },
            'rice': {
                'India': [8, 5, -12, -18, -15, -8, 2, 5, 12, 18, 15, 8],
                'China': [5, 2, -8, -15, -18, -12, -5, 2, 8, 15, 18, 12],
                'USA': [-2, 2, 5, 8, 12, 15, 18, 12, 5, -2, -8, -5]
            }
        }
        
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        pattern = seasonal_patterns.get(commodity.lower(), {}).get(region, 
                 [0, 0, 5, 8, 12, 8, 0, -5, -8, -12, -8, 0])
        
        return {month: f"{'+' if val > 0 else ''}{val}%" 
                for month, val in zip(months, pattern)}

    def calculate_price_impact_matrix(self, commodities: List[str], weather_data: Dict) -> List[Dict]:
        """Calculate price impact matrix for multiple commodities"""
        matrix = []
        
        for commodity in commodities:
            # Calculate various impact scenarios
            drought_impact = self.calculate_scenario_impact(commodity, 'drought', weather_data)
            flood_impact = self.calculate_scenario_impact(commodity, 'flood', weather_data)
            frost_impact = self.calculate_scenario_impact(commodity, 'frost', weather_data)
            
            # Calculate price targets
            base_price = self.commodity_base_prices.get(commodity.lower(), 500.0)
            drought_price = base_price * (1 + drought_impact/100)
            flood_price = base_price * (1 + flood_impact/100)
            frost_price = base_price * (1 + frost_impact/100)
            
            matrix.append({
                'commodity': commodity.title(),
                'base_price': f"${int(base_price)}/MT",
                'drought_impact': f"+{drought_impact:.0f}%",
                'drought_price': f"${int(drought_price)}/MT",
                'flood_impact': f"+{flood_impact:.0f}%",
                'flood_price': f"${int(flood_price)}/MT",
                'frost_impact': f"+{frost_impact:.0f}%",
                'frost_price': f"${int(frost_price)}/MT",
                'overall_risk': self.calculate_overall_risk(drought_impact, flood_impact, frost_impact)
            })
        
        return matrix

    def calculate_scenario_impact(self, commodity: str, scenario: str, weather_data: Dict) -> float:
        """Calculate price impact for specific weather scenario"""
        base_impacts = {
            'drought': {'corn': 18, 'wheat': 22, 'rice': 15, 'soybean': 20},
            'flood': {'corn': 12, 'wheat': 8, 'rice': 25, 'soybean': 15},
            'frost': {'corn': 8, 'wheat': 15, 'rice': 5, 'soybean': 12}
        }
        
        base_impact = base_impacts.get(scenario, {}).get(commodity.lower(), 10)
        
        # Adjust based on current weather conditions
        current_severity = self.get_current_weather_severity(weather_data, scenario)
        severity_multiplier = {'critical': 1.5, 'high': 1.2, 'medium': 1.0, 'low': 0.7}.get(current_severity, 1.0)
        
        return base_impact * severity_multiplier

    def get_current_weather_severity(self, weather_data: Dict, scenario_type: str) -> str:
        """Get current weather severity for specific scenario type"""
        for alert in weather_data.get('weather_alerts', []):
            if scenario_type.lower() in alert.get('threat', '').lower():
                return alert.get('severity', 'medium')
        return 'low'

    def calculate_overall_risk(self, drought: float, flood: float, frost: float) -> str:
        """Calculate overall risk level based on scenario impacts"""
        avg_impact = statistics.mean([drought, flood, frost])
        
        if avg_impact >= 20:
            return 'High'
        elif avg_impact >= 12:
            return 'Medium'
        else:
            return 'Low'

    def calculate_trading_insights(self, commodity: str, seasonality_data: Dict) -> Dict:
        """Calculate trading insights based on seasonality patterns"""
        monthly_values = [int(v.replace('%', '').replace('+', '')) for v in seasonality_data.values()]
        
        best_buy_month = min(range(len(monthly_values)), key=monthly_values.__getitem__)
        best_sell_month = max(range(len(monthly_values)), key=monthly_values.__getitem__)
        
        months = list(seasonality_data.keys())
        base_price = self.commodity_base_prices.get(commodity.lower(), 500.0)
        
        # Calculate price targets
        buy_price = base_price * (1 + monthly_values[best_buy_month]/100)
        sell_price = base_price * (1 + monthly_values[best_sell_month]/100)
        profit_potential = sell_price - buy_price
        
        return {
            'best_buy_window': f"{months[best_buy_month]} ({monthly_values[best_buy_month]:+d}%)",
            'best_buy_price': f"${int(buy_price)}/MT",
            'best_sell_window': f"{months[best_sell_month]} ({monthly_values[best_sell_month]:+d}%)",
            'best_sell_price': f"${int(sell_price)}/MT",
            'profit_potential': f"${int(profit_potential)}/MT",
            'seasonal_spread': f"{max(monthly_values) - min(monthly_values)}%",
            'volatility_period': self.identify_volatility_period(monthly_values, months)
        }

    def identify_volatility_period(self, values: List[int], months: List[str]) -> str:
        """Identify the most volatile trading period"""
        # Calculate month-to-month changes
        changes = [abs(values[i] - values[i-1]) for i in range(1, len(values))]
        max_change_idx = changes.index(max(changes))
        
        return f"{months[max_change_idx]}-{months[max_change_idx + 1]}"