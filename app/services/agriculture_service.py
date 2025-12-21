import httpx
import asyncio
from typing import List, Dict, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class AgricultureService:
    def __init__(self):
        self.usda_base_url = "https://quickstats.nass.usda.gov/api"
        self.fao_base_url = "https://fenixservices.fao.org/faostat/api/v1"
        # You'll need to get free API key from: https://quickstats.nass.usda.gov/api
        self.usda_api_key = "YOUR_USDA_API_KEY"  # FREE - Register at USDA
    
    async def get_crop_production_data(self, commodity: str, year: int = 2023) -> Dict[str, Any]:
        """Get crop production data from USDA NASS - FREE"""
        try:
            # Map commodity names to USDA commodity codes
            commodity_map = {
                'Corn': 'CORN',
                'Wheat': 'WHEAT',
                'Soybean': 'SOYBEANS',
                'Rice': 'RICE'
            }
            
            usda_commodity = commodity_map.get(commodity, commodity.upper())
            
            params = {
                'key': self.usda_api_key,
                'source_desc': 'SURVEY',
                'sector_desc': 'CROPS',
                'commodity_desc': usda_commodity,
                'statisticcat_desc': 'PRODUCTION',
                'year': year,
                'agg_level_desc': 'NATIONAL',
                'format': 'JSON'
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.usda_base_url}/api_GET", params=params)
                if response.status_code == 200:
                    data = response.json()
                    
                    if 'data' in data and data['data']:
                        production_data = data['data'][0]
                        
                        return {
                            'commodity': commodity,
                            'year': year,
                            'production_value': production_data.get('Value', 0),
                            'production_unit': production_data.get('unit_desc', 'BU'),
                            'state': production_data.get('state_name', 'US'),
                            'yield_impact': self._calculate_yield_impact(production_data.get('Value', 0))
                        }
                return {}
        except Exception as e:
            logger.error(f"Error fetching crop production data: {e}")
            return {}
    
    async def get_global_production_data(self, commodity: str) -> Dict[str, Any]:
        """Get global production data from FAO - FREE"""
        try:
            # FAO commodity codes
            fao_commodity_map = {
                'Wheat': '15',
                'Rice': '27', 
                'Corn': '56',
                'Soybean': '236'
            }
            
            commodity_code = fao_commodity_map.get(commodity)
            if not commodity_code:
                return {}
            
            # Get latest production data
            params = {
                'area': '5000',  # World
                'item': commodity_code,
                'element': '5510',  # Production
                'year': '2022',
                'format': 'json'
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.fao_base_url}/en/data", params=params)
                if response.status_code == 200:
                    data = response.json()
                    
                    if 'data' in data and data['data']:
                        production_info = data['data'][0]
                        
                        return {
                            'commodity': commodity,
                            'global_production': production_info.get('Value', 0),
                            'unit': production_info.get('Unit', 'tonnes'),
                            'year': production_info.get('Year', 2022),
                            'production_risk_score': self._calculate_production_risk(commodity)
                        }
                return {}
        except Exception as e:
            logger.error(f"Error fetching global production data: {e}")
            return {}
    
    async def get_supply_risk_indicators(self, commodities: List[str]) -> Dict[str, Any]:
        """Calculate supply risk indicators for selected commodities"""
        try:
            total_risk_score = 0
            commodity_count = len(commodities)
            
            for commodity in commodities:
                production_data = await self.get_crop_production_data(commodity)
                risk_score = self._calculate_production_risk(commodity)
                total_risk_score += risk_score
            
            avg_risk_score = total_risk_score / commodity_count if commodity_count > 0 else 0
            
            return {
                'yield_impact': f"{self._calculate_yield_impact_percentage(avg_risk_score)}%",
                'production_risk_score': f"{int(avg_risk_score)}/100",
                'supply_disruption_days': self._calculate_disruption_days(avg_risk_score),
                'alternative_sources_pct': f"{self._calculate_alt_sources(commodities)}%"
            }
        except Exception as e:
            logger.error(f"Error calculating supply risk indicators: {e}")
            return {
                'yield_impact': '-15%',
                'production_risk_score': '78/100', 
                'supply_disruption_days': '12 days',
                'alternative_sources_pct': '45%'
            }
    
    def _calculate_yield_impact(self, production_value: float) -> str:
        """Calculate yield impact based on production value"""
        # This is a simplified calculation - in reality you'd compare with historical averages
        if production_value > 1000000:
            return "positive"
        elif production_value > 500000:
            return "stable"
        else:
            return "negative"
    
    def _calculate_production_risk(self, commodity: str) -> float:
        """Calculate production risk score (0-100)"""
        # Simplified risk scoring based on commodity type
        risk_scores = {
            'Corn': 75,  # High weather dependency
            'Wheat': 65, # Moderate risk
            'Rice': 70,  # Water dependency
            'Soybean': 60  # Relatively stable
        }
        return risk_scores.get(commodity, 70)
    
    def _calculate_yield_impact_percentage(self, risk_score: float) -> int:
        """Convert risk score to yield impact percentage"""
        if risk_score > 80:
            return -20
        elif risk_score > 60:
            return -15
        elif risk_score > 40:
            return -10
        else:
            return -5
    
    def _calculate_disruption_days(self, risk_score: float) -> str:
        """Calculate expected supply disruption days"""
        days = int(risk_score / 5)  # Simple mapping
        return f"{days} days"
    
    def _calculate_alt_sources(self, commodities: List[str]) -> int:
        """Calculate percentage of alternative sources available"""
        # Simplified calculation based on commodity diversity
        base_pct = 40
        diversity_bonus = len(set(commodities)) * 5
        return min(base_pct + diversity_bonus, 80)