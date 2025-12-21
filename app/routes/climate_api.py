from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import asyncio
from ..services.weather_service import WeatherService, AGRICULTURAL_REGIONS
from ..services.agriculture_service import AgricultureService
from ..services.price_service import PriceService
from ..services.calculation_service import CalculationService

router = APIRouter(prefix="/api/v1/climate", tags=["climate"])

# Initialize services
weather_service = WeatherService()
agriculture_service = AgricultureService()
price_service = PriceService()
calculation_service = CalculationService()

@router.get("/alerts")
async def get_climate_alerts(
    commodities: Optional[List[str]] = Query(None, description="Filter alerts by commodities")
):
    """Get real-time weather alerts affecting commodity production"""
    try:
        # Get weather alerts
        weather_alerts = await weather_service.get_weather_alerts()
        
        # Get drought data for major agricultural regions
        regional_risks = []
        for region_name, region_data in AGRICULTURAL_REGIONS.items():
            drought_data = await weather_service.get_drought_data(
                region_data['lat'], 
                region_data['lon']
            )
            
            if drought_data:
                regional_risks.append({
                    'region': region_name,
                    'commodity': region_data['commodity'],
                    'drought_risk': drought_data.get('drought_risk', 'Low'),
                    'precipitation_30d': drought_data.get('avg_precipitation_30d', 0),
                    'temperature_trend': drought_data.get('temperature_trend', 'stable')
                })
        
        # Filter by commodities if specified
        if commodities:
            commodity_names = [c.title() for c in commodities]
            weather_alerts = [
                alert for alert in weather_alerts 
                if any(commodity in alert.get('description', '') for commodity in commodity_names)
            ]
            regional_risks = [
                risk for risk in regional_risks 
                if risk['commodity'] in commodity_names
            ]
        
        return {
            "status": "success",
            "data": {
                "weather_alerts": weather_alerts,
                "regional_risks": regional_risks,
                "timestamp": "2025-01-02T10:00:00Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching climate alerts: {str(e)}")

@router.get("/supply-risk")
async def get_supply_risk_indicators(
    commodities: List[str] = Query(..., description="List of commodities to analyze")
):
    """Get supply risk indicators for selected commodities"""
    try:
        # Get weather and production data
        weather_data = await weather_service.get_weather_alerts()
        
        # Calculate supply indicators using real data
        supply_indicators = {}
        production_data = []
        
        for commodity in commodities:
            prod_data = await agriculture_service.get_crop_production_data(commodity.title())
            if prod_data:
                production_data.append(prod_data)
            
            # Calculate metrics for this commodity
            supply_indicators[commodity] = {
                "yield_impact": calculation_service.calculate_yield_impact(weather_data, prod_data or {}, commodity),
                "production_risk_score": calculation_service.calculate_production_risk_score(weather_data, prod_data or {}),
                "supply_disruption_days": calculation_service.calculate_supply_disruption_days(weather_data, {}),
                "alternative_sources_pct": calculation_service.calculate_alternative_sources_percentage(commodity, ['USA', 'India'])
            }
        
        # Use first commodity for main response
        main_commodity = commodities[0] if commodities else 'corn'
        
        return {
            "status": "success", 
            "data": {
                "supply_indicators": supply_indicators.get(main_commodity, {}),
                "production_data": production_data,
                "all_commodities": supply_indicators,
                "timestamp": "2025-01-02T10:00:00Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching supply risk data: {str(e)}")

@router.get("/financial-impact")
async def get_financial_impact_metrics(
    commodities: List[str] = Query(..., description="List of commodities to analyze")
):
    """Get financial impact metrics including climate premiums and volatility"""
    try:
        # Get weather, price and economic data
        weather_data = await weather_service.get_weather_alerts()
        price_data = await price_service.get_commodity_prices([c.title() for c in commodities])
        economic_indicators = await price_service.get_economic_indicators()
        
        # Calculate financial metrics using real data
        financial_metrics = {}
        for commodity in commodities:
            weather_impact = calculation_service.calculate_climate_impact_percentage(weather_data, commodity, 'USA')
            risk_score = int(calculation_service.calculate_production_risk_score(weather_data, {}).split('/')[0])
            climate_premium = calculation_service.calculate_climate_premium(commodity, weather_impact, risk_score/100)
            supply_disruption_days = calculation_service.calculate_supply_disruption_days(weather_data, {})
            
            financial_metrics[commodity] = {
                "climate_premium": climate_premium,
                "current_price": calculation_service.calculate_current_price_with_premium(commodity, climate_premium),
                "price_change_pct": calculation_service.calculate_price_change_percentage(commodity, climate_premium),
                "volatility_index": calculation_service.calculate_price_volatility_index('medium', supply_disruption_days),
                "volatility_spike_probability": calculation_service.calculate_volatility_spike_probability(price_data, 'medium'),
                "insurance_cost": calculation_service.calculate_insurance_cost_increase(risk_score, commodity),
                "hedge_coverage": calculation_service.calculate_hedge_coverage_percentage(price_data, 'medium')
            }
        
        # Use first commodity for main response
        main_commodity = commodities[0] if commodities else 'corn'
        
        return {
            "status": "success",
            "data": {
                "financial_metrics": financial_metrics.get(main_commodity, {}),
                "price_data": price_data,
                "economic_indicators": economic_indicators,
                "all_commodities": financial_metrics,
                "timestamp": "2025-01-02T10:00:00Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching financial impact data: {str(e)}")

@router.get("/price-impact-matrix")
async def get_price_impact_matrix(
    commodities: List[str] = Query(..., description="List of commodities to analyze")
):
    """Get climate price impact matrix for commodities by region"""
    try:
        # Get weather data for calculations
        weather_data = await weather_service.get_weather_alerts()
        
        # Calculate price impact matrix using real data
        price_impact_matrix = calculation_service.calculate_price_impact_matrix(commodities, weather_data)
        
        return {
            "status": "success",
            "data": {
                "price_impact_matrix": price_impact_matrix,
                "timestamp": "2025-01-02T10:00:00Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching price impact matrix: {str(e)}")

@router.get("/dashboard")
async def get_climate_dashboard(
    commodities: List[str] = Query(..., description="List of commodities to analyze")
):
    """Get complete climate dashboard data for selected commodities"""
    try:
        # Run all data fetching concurrently
        alerts_task = get_climate_alerts(commodities)
        supply_task = get_supply_risk_indicators(commodities)
        financial_task = get_financial_impact_metrics(commodities)
        matrix_task = get_price_impact_matrix(commodities)
        
        # Wait for all tasks to complete
        alerts_data, supply_data, financial_data, matrix_data = await asyncio.gather(
            alerts_task, supply_task, financial_task, matrix_task
        )
        
        return {
            "status": "success",
            "data": {
                "alerts": alerts_data["data"],
                "supply_risk": supply_data["data"],
                "financial_impact": financial_data["data"],
                "price_impact_matrix": matrix_data["data"],
                "timestamp": "2025-01-02T10:00:00Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching climate dashboard: {str(e)}")

@router.get("/seasonality/{commodity}")
async def get_seasonality_data(commodity: str, region: str = "USA"):
    """Get seasonality heatmap data for specific commodity and region"""
    try:
        # Calculate seasonality patterns
        seasonality_data = calculation_service.calculate_seasonality_heatmap(commodity, region)
        trading_insights = calculation_service.calculate_trading_insights(commodity, seasonality_data)
        
        return {
            "status": "success",
            "data": {
                "commodity": commodity.title(),
                "region": region,
                "monthly_patterns": seasonality_data,
                "trading_insights": trading_insights,
                "timestamp": "2025-01-02T10:00:00Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching seasonality data: {str(e)}")

@router.get("/seasonality-matrix")
async def get_seasonality_matrix(commodities: List[str] = Query([]), regions: List[str] = Query([])):
    """Get seasonality matrix for multiple commodities and regions"""
    try:
        target_commodities = commodities if commodities else ['corn', 'wheat', 'rice']
        target_regions = regions if regions else ['USA', 'India', 'Russia']
        
        seasonality_matrix = []
        for region in target_regions:
            region_data = {'region': region, 'commodities': {}}
            for commodity in target_commodities:
                monthly_data = calculation_service.calculate_seasonality_heatmap(commodity, region)
                region_data['commodities'][commodity] = monthly_data
            seasonality_matrix.append(region_data)
        
        return {
            "status": "success",
            "data": {
                "seasonality_matrix": seasonality_matrix,
                "timestamp": "2025-01-02T10:00:00Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching seasonality matrix: {str(e)}")

def _calculate_price_impact(drought_risk: str) -> int:
    """Calculate price impact percentage based on drought risk"""
    impact_map = {
        'Critical': 35,
        'High': 25,
        'Medium': 15,
        'Low': 5
    }
    return impact_map.get(drought_risk, 10)