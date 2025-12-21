import httpx
import asyncio
from typing import List, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        self.noaa_base_url = "https://api.weather.gov"
        self.open_meteo_base_url = "https://api.open-meteo.com/v1"
    
    async def get_weather_alerts(self) -> List[Dict[str, Any]]:
        """Get weather alerts from NOAA (US only) - FREE"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.noaa_base_url}/alerts/active")
                if response.status_code == 200:
                    data = response.json()
                    alerts = []
                    
                    for feature in data.get('features', [])[:10]:  # Limit to 10 alerts
                        properties = feature.get('properties', {})
                        
                        # Map to our format
                        alert = {
                            'id': properties.get('id', ''),
                            'region': properties.get('areaDesc', 'Unknown'),
                            'threat': properties.get('event', 'Weather Alert'),
                            'severity': self._map_severity(properties.get('severity', 'Minor')),
                            'description': properties.get('description', '')[:200],
                            'start_time': properties.get('onset'),
                            'end_time': properties.get('expires')
                        }
                        alerts.append(alert)
                    
                    return alerts
                return []
        except Exception as e:
            logger.error(f"Error fetching weather alerts: {e}")
            return []
    
    async def get_drought_data(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get drought conditions from Open-Meteo - FREE"""
        try:
            params = {
                'latitude': lat,
                'longitude': lon,
                'daily': 'precipitation_sum,temperature_2m_max,temperature_2m_min',
                'past_days': 30,
                'forecast_days': 7
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.open_meteo_base_url}/forecast", params=params)
                if response.status_code == 200:
                    data = response.json()
                    daily = data.get('daily', {})
                    
                    # Calculate drought risk based on precipitation
                    precipitation = daily.get('precipitation_sum', [])
                    avg_precip = sum(precipitation[-30:]) / 30 if precipitation else 0
                    
                    drought_risk = 'Low'
                    if avg_precip < 1:
                        drought_risk = 'Critical'
                    elif avg_precip < 2:
                        drought_risk = 'High'
                    elif avg_precip < 5:
                        drought_risk = 'Medium'
                    
                    return {
                        'drought_risk': drought_risk,
                        'avg_precipitation_30d': round(avg_precip, 2),
                        'temperature_trend': self._calculate_temp_trend(daily.get('temperature_2m_max', []))
                    }
                return {}
        except Exception as e:
            logger.error(f"Error fetching drought data: {e}")
            return {}
    
    def _map_severity(self, noaa_severity: str) -> str:
        """Map NOAA severity to our format"""
        severity_map = {
            'Extreme': 'critical',
            'Severe': 'high', 
            'Moderate': 'medium',
            'Minor': 'low',
            'Unknown': 'medium'
        }
        return severity_map.get(noaa_severity, 'medium')
    
    def _calculate_temp_trend(self, temperatures: List[float]) -> str:
        """Calculate temperature trend"""
        if len(temperatures) < 7:
            return 'stable'
        
        recent_avg = sum(temperatures[-7:]) / 7
        previous_avg = sum(temperatures[-14:-7]) / 7
        
        if recent_avg > previous_avg + 2:
            return 'rising'
        elif recent_avg < previous_avg - 2:
            return 'falling'
        return 'stable'

# Regional coordinates for major agricultural areas
AGRICULTURAL_REGIONS = {
    'US Midwest': {'lat': 41.8781, 'lon': -87.6298, 'commodity': 'Corn'},
    'Argentina': {'lat': -34.6037, 'lon': -58.3816, 'commodity': 'Soybean'},
    'Australia': {'lat': -25.2744, 'lon': 133.7751, 'commodity': 'Wheat'},
    'India': {'lat': 20.5937, 'lon': 78.9629, 'commodity': 'Rice'},
    'Brazil': {'lat': -14.2350, 'lon': -51.9253, 'commodity': 'Soybean'},
    'Russia': {'lat': 61.5240, 'lon': 105.3188, 'commodity': 'Wheat'},
    'Thailand': {'lat': 15.8700, 'lon': 100.9925, 'commodity': 'Rice'}
}