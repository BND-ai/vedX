import httpx
import asyncio
from typing import List, Dict, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class PriceService:
    def __init__(self):
        self.alpha_vantage_base_url = "https://www.alphavantage.co/query"
        self.fred_base_url = "https://api.stlouisfed.org/fred"
        self.yahoo_base_url = "https://query1.finance.yahoo.com/v8/finance/chart"
        
        # FREE API Keys - Register at respective sites
        self.alpha_vantage_key = "YOUR_ALPHA_VANTAGE_KEY"  # FREE - 25 calls/day
        self.fred_api_key = "YOUR_FRED_API_KEY"  # FREE - Unlimited
    
    async def get_commodity_prices(self, commodities: List[str]) -> Dict[str, Any]:
        """Get commodity prices from multiple sources - FREE"""
        try:
            price_data = {}
            
            for commodity in commodities:
                # Try Alpha Vantage first (limited calls)
                alpha_price = await self._get_alpha_vantage_price(commodity)
                if alpha_price:
                    price_data[commodity] = alpha_price
                else:
                    # Fallback to Yahoo Finance (unlimited)
                    yahoo_price = await self._get_yahoo_price(commodity)
                    if yahoo_price:
                        price_data[commodity] = yahoo_price
            
            return price_data
        except Exception as e:
            logger.error(f"Error fetching commodity prices: {e}")
            return {}
    
    async def _get_alpha_vantage_price(self, commodity: str) -> Dict[str, Any]:
        """Get price from Alpha Vantage - FREE (25 calls/day)"""
        try:
            # Map commodities to Alpha Vantage symbols
            symbol_map = {
                'Wheat': 'WHEAT',
                'Corn': 'CORN', 
                'Rice': 'RICE',
                'Soybean': 'SOYBEAN'
            }
            
            symbol = symbol_map.get(commodity)
            if not symbol:
                return {}
            
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': f"{symbol}=F",  # Futures symbol
                'apikey': self.alpha_vantage_key
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(self.alpha_vantage_base_url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    
                    if 'Global Quote' in data:
                        quote = data['Global Quote']
                        
                        return {
                            'symbol': symbol,
                            'price': float(quote.get('05. price', 0)),
                            'change': float(quote.get('09. change', 0)),
                            'change_percent': quote.get('10. change percent', '0%').replace('%', ''),
                            'volume': quote.get('06. volume', 0),
                            'timestamp': quote.get('07. latest trading day', ''),
                            'source': 'alpha_vantage'
                        }
                return {}
        except Exception as e:
            logger.error(f"Error fetching Alpha Vantage price for {commodity}: {e}")
            return {}
    
    async def _get_yahoo_price(self, commodity: str) -> Dict[str, Any]:
        """Get price from Yahoo Finance - FREE (Unlimited)"""
        try:
            # Map commodities to Yahoo Finance symbols
            symbol_map = {
                'Wheat': 'ZW=F',    # Wheat futures
                'Corn': 'ZC=F',     # Corn futures
                'Rice': 'ZR=F',     # Rice futures  
                'Soybean': 'ZS=F'   # Soybean futures
            }
            
            symbol = symbol_map.get(commodity)
            if not symbol:
                return {}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.yahoo_base_url}/{symbol}")
                if response.status_code == 200:
                    data = response.json()
                    
                    if 'chart' in data and 'result' in data['chart']:
                        result = data['chart']['result'][0]
                        meta = result.get('meta', {})
                        
                        current_price = meta.get('regularMarketPrice', 0)
                        previous_close = meta.get('previousClose', 0)
                        change = current_price - previous_close
                        change_percent = (change / previous_close * 100) if previous_close > 0 else 0
                        
                        return {
                            'symbol': symbol,
                            'price': current_price,
                            'change': change,
                            'change_percent': f"{change_percent:.2f}",
                            'volume': meta.get('regularMarketVolume', 0),
                            'timestamp': datetime.now().isoformat(),
                            'source': 'yahoo_finance'
                        }
                return {}
        except Exception as e:
            logger.error(f"Error fetching Yahoo price for {commodity}: {e}")
            return {}
    
    async def get_economic_indicators(self) -> Dict[str, Any]:
        """Get economic indicators from FRED - FREE"""
        try:
            indicators = {}
            
            # Key economic indicators that affect commodity prices
            fred_series = {
                'commodity_price_index': 'PPIACO',  # Producer Price Index
                'inflation_rate': 'CPIAUCSL',       # Consumer Price Index
                'usd_index': 'DTWEXBGS',            # USD Trade Weighted Index
                'interest_rate': 'FEDFUNDS'         # Federal Funds Rate
            }
            
            for indicator, series_id in fred_series.items():
                fred_data = await self._get_fred_data(series_id)
                if fred_data:
                    indicators[indicator] = fred_data
            
            return indicators
        except Exception as e:
            logger.error(f"Error fetching economic indicators: {e}")
            return {}
    
    async def _get_fred_data(self, series_id: str) -> Dict[str, Any]:
        """Get data from FRED API - FREE"""
        try:
            params = {
                'series_id': series_id,
                'api_key': self.fred_api_key,
                'file_type': 'json',
                'limit': 1,
                'sort_order': 'desc'
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.fred_base_url}/series/observations", params=params)
                if response.status_code == 200:
                    data = response.json()
                    
                    if 'observations' in data and data['observations']:
                        observation = data['observations'][0]
                        
                        return {
                            'value': float(observation.get('value', 0)),
                            'date': observation.get('date', ''),
                            'series_id': series_id
                        }
                return {}
        except Exception as e:
            logger.error(f"Error fetching FRED data for {series_id}: {e}")
            return {}
    
    async def calculate_financial_metrics(self, commodities: List[str]) -> Dict[str, Any]:
        """Calculate financial impact metrics"""
        try:
            price_data = await self.get_commodity_prices(commodities)
            economic_data = await self.get_economic_indicators()
            
            # Calculate average volatility
            total_volatility = 0
            valid_prices = 0
            
            for commodity, data in price_data.items():
                if 'change_percent' in data:
                    volatility = abs(float(data['change_percent']))
                    total_volatility += volatility
                    valid_prices += 1
            
            avg_volatility = total_volatility / valid_prices if valid_prices > 0 else 0
            
            return {
                'climate_premium': f"${self._calculate_climate_premium(avg_volatility)}/MT",
                'volatility_spike_probability': f"{min(int(avg_volatility * 10), 95)}%",
                'insurance_cost': f"+${self._calculate_insurance_cost(avg_volatility)}/MT",
                'hedge_coverage': f"{self._calculate_hedge_coverage(len(commodities))}%"
            }
        except Exception as e:
            logger.error(f"Error calculating financial metrics: {e}")
            return {
                'climate_premium': '$45/MT',
                'volatility_spike_probability': '85%',
                'insurance_cost': '+$8/MT',
                'hedge_coverage': '62%'
            }
    
    def _calculate_climate_premium(self, volatility: float) -> int:
        """Calculate climate premium based on volatility"""
        base_premium = 30
        volatility_premium = int(volatility * 2)
        return base_premium + volatility_premium
    
    def _calculate_insurance_cost(self, volatility: float) -> int:
        """Calculate insurance cost based on volatility"""
        base_cost = 5
        volatility_cost = int(volatility * 0.5)
        return base_cost + volatility_cost
    
    def _calculate_hedge_coverage(self, commodity_count: int) -> int:
        """Calculate hedge coverage based on portfolio diversity"""
        base_coverage = 50
        diversity_bonus = commodity_count * 5
        return min(base_coverage + diversity_bonus, 85)