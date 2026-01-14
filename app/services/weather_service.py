import httpx
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
from .config_service import config

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        self.noaa_base_url = "https://api.weather.gov"
        self.open_meteo_base_url = "https://api.open-meteo.com/v1"
        self.openweather_base_url = "https://api.openweathermap.org/data/2.5"
        
        # Agricultural regions for weather monitoring
        self.agricultural_regions = {
            'US_Midwest': {'lat': 41.8781, 'lon': -87.6298, 'name': 'US Midwest', 'commodity': 'Corn'},
            'Argentina': {'lat': -34.6037, 'lon': -58.3816, 'name': 'Argentina', 'commodity': 'Soybean'},
            'Australia': {'lat': -25.2744, 'lon': 133.7751, 'name': 'Australia', 'commodity': 'Wheat'},
            'India': {'lat': 20.5937, 'lon': 78.9629, 'name': 'India', 'commodity': 'Rice'},
            'Brazil': {'lat': -14.2350, 'lon': -51.9253, 'name': 'Brazil', 'commodity': 'Soybean'},
            'Russia': {'lat': 61.5240, 'lon': 105.3188, 'name': 'Russia', 'commodity': 'Wheat'},
            'Thailand': {'lat': 15.8700, 'lon': 100.9925, 'name': 'Thailand', 'commodity': 'Rice'}
        }
    
    async def get_weather_alerts(self) -> List[Dict[str, Any]]:
        """Get weather alerts from NOAA (US only) - FREE"""
        try:
            headers = {
                'User-Agent': 'AnantaAPI/1.0 (contact@ananta.com)'
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.noaa_base_url}/alerts/active", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    alerts = []
                    
                    for feature in data.get('features', [])[:10]:  # Limit to 10 alerts
                        properties = feature.get('properties', {})
                        
                        alert = {
                            'id': properties.get('id', ''),
                            'region': properties.get('areaDesc', 'Unknown'),
                            'threat': properties.get('event', 'Weather Alert'),
                            'severity': self._map_severity(properties.get('severity', 'Minor')),
                            'description': properties.get('description', '')[:200],
                            'start_time': properties.get('onset'),
                            'end_time': properties.get('expires'),
                            'source': 'noaa'
                        }
                        alerts.append(alert)
                    
                    return alerts
                return []
        except Exception as e:
            logger.error(f"Error fetching NOAA weather alerts: {e}")
            return []
    
    async def get_agricultural_weather(self) -> List[Dict[str, Any]]:
        """Get weather data for all agricultural regions"""
        weather_data = []
        
        for region_id, region_info in self.agricultural_regions.items():
            # Get weather from multiple sources
            open_meteo_data = await self._get_open_meteo_weather(region_info['lat'], region_info['lon'])
            openweather_data = await self._get_openweather_data(region_info['lat'], region_info['lon'])
            forecast_data = await self._get_detailed_forecast(region_info['lat'], region_info['lon'])
            
            # Combine data
            combined_data = {
                'region': region_info['name'],
                'commodity': region_info['commodity'],
                'coordinates': {'lat': region_info['lat'], 'lon': region_info['lon']},
                'open_meteo': open_meteo_data,
                'openweather': openweather_data,
                'forecast': forecast_data,
                'timestamp': datetime.utcnow().isoformat()
            }
            weather_data.append(combined_data)
        
        return weather_data
    
    async def _get_open_meteo_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get weather from Open-Meteo API - FREE"""
        try:
            params = {
                'latitude': lat,
                'longitude': lon,
                'current': 'temperature_2m,relative_humidity_2m,precipitation,weather_code',
                'daily': 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
                'forecast_days': 7
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.open_meteo_base_url}/forecast", params=params)
                if response.status_code == 200:
                    data = response.json()
                    current = data.get('current', {})
                    daily = data.get('daily', {})
                    
                    return {
                        'current_temp': current.get('temperature_2m'),
                        'humidity': current.get('relative_humidity_2m'),
                        'precipitation': current.get('precipitation'),
                        'weather_code': current.get('weather_code'),
                        'forecast': {
                            'max_temps': daily.get('temperature_2m_max', [])[:7],
                            'min_temps': daily.get('temperature_2m_min', [])[:7],
                            'precipitation': daily.get('precipitation_sum', [])[:7]
                        }
                    }
                return {}
        except Exception as e:
            logger.error(f"Error fetching Open-Meteo weather: {e}")
            return {}
    
    async def _get_openweather_data(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get weather from OpenWeather API"""
        try:
            if not config.is_service_enabled('weather_api'):
                return {}
            
            params = {
                'lat': lat,
                'lon': lon,
                'appid': config.get_api_key('weather_api'),
                'units': 'metric'
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.openweather_base_url}/weather", params=params)
                if response.status_code == 200:
                    data = response.json()
                    main = data.get('main', {})
                    weather = data.get('weather', [{}])[0]
                    
                    return {
                        'temperature': main.get('temp'),
                        'feels_like': main.get('feels_like'),
                        'humidity': main.get('humidity'),
                        'pressure': main.get('pressure'),
                        'description': weather.get('description'),
                        'wind_speed': data.get('wind', {}).get('speed')
                    }
                return {}
        except Exception as e:
            logger.error(f"Error fetching OpenWeather data: {e}")
            return {}
    
    async def get_noaa_forecast(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get NOAA forecast using two-step process"""
        try:
            headers = {
                'User-Agent': 'AnantaAPI/1.0 (contact@ananta.com)'
            }
            
            # Step 1: Get grid metadata
            async with httpx.AsyncClient(timeout=10.0) as client:
                points_response = await client.get(
                    f"{self.noaa_base_url}/points/{lat:.4f},{lon:.4f}",
                    headers=headers
                )
                
                if points_response.status_code == 200:
                    points_data = points_response.json()
                    properties = points_data.get('properties', {})
                    forecast_url = properties.get('forecast')
                    
                    if forecast_url:
                        # Step 2: Get forecast
                        forecast_response = await client.get(forecast_url, headers=headers)
                        
                        if forecast_response.status_code == 200:
                            forecast_data = forecast_response.json()
                            periods = forecast_data.get('properties', {}).get('periods', [])
                            
                            return {
                                'location': properties.get('relativeLocation', {}).get('properties', {}).get('city', 'Unknown'),
                                'forecast_periods': [
                                    {
                                        'name': period.get('name'),
                                        'temperature': period.get('temperature'),
                                        'temperature_unit': period.get('temperatureUnit'),
                                        'detailed_forecast': period.get('detailedForecast'),
                                        'short_forecast': period.get('shortForecast')
                                    }
                                    for period in periods[:7]  # 7-day forecast
                                ]
                            }
                return {}
        except Exception as e:
            logger.error(f"Error fetching NOAA forecast: {e}")
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
    
    async def _get_detailed_forecast(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get 7-day detailed forecast from Open-Meteo"""
        try:
            params = {
                'latitude': lat,
                'longitude': lon,
                'daily': 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max',
                'timezone': 'auto',
                'forecast_days': 7
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.open_meteo_base_url}/forecast", params=params)
                if response.status_code == 200:
                    data = response.json()
                    daily = data.get('daily', {})
                    
                    forecast_days = []
                    dates = daily.get('time', [])
                    max_temps = daily.get('temperature_2m_max', [])
                    min_temps = daily.get('temperature_2m_min', [])
                    precipitation = daily.get('precipitation_sum', [])
                    weather_codes = daily.get('weather_code', [])
                    
                    for i in range(min(7, len(dates))):
                        day_name = self._get_day_name(i)
                        weather_code = weather_codes[i] if i < len(weather_codes) else 0
                        
                        forecast_days.append({
                            'day': day_name,
                            'date': dates[i],
                            'temp_max': round(max_temps[i]) if i < len(max_temps) else 25,
                            'temp_min': round(min_temps[i]) if i < len(min_temps) else 15,
                            'precipitation': round(precipitation[i], 1) if i < len(precipitation) else 0,
                            'weather_code': weather_code,
                            'icon': self._get_weather_emoji(weather_code),
                            'condition': self._get_weather_description(weather_code)
                        })
                    
                    return {
                        'forecast_days': forecast_days,
                        'source': 'Open-Meteo'
                    }
                return {}
        except Exception as e:
            logger.error(f"Error fetching detailed forecast: {e}")
            return {}
    
    def _get_day_name(self, day_offset: int) -> str:
        """Get day name for forecast"""
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        from datetime import datetime, timedelta
        today = datetime.now()
        target_day = today + timedelta(days=day_offset)
        return days[target_day.weekday()]
    
    def _get_weather_emoji(self, code: int) -> str:
        """Get weather emoji from weather code"""
        weather_codes = {
            0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
            45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌧️',
            61: '🌧️', 63: '🌧️', 65: '🌧️', 71: '🌨️', 73: '🌨️', 75: '❄️',
            77: '🌨️', 80: '🌦️', 81: '🌧️', 82: '⛈️',
            85: '🌨️', 86: '❄️', 95: '⛈️', 96: '⛈️', 99: '⛈️'
        }
        return weather_codes.get(code, '🌤️')
    
    def _get_weather_description(self, code: int) -> str:
        """Get weather description from weather code"""
        descriptions = {
            0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
            45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
            61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
            77: 'Snow Grains', 80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
            85: 'Light Snow Showers', 86: 'Snow Showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Severe Thunderstorm'
        }
        return descriptions.get(code, 'Partly Cloudy')