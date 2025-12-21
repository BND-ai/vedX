# API Keys Setup for Live Climate Data

## Required API Keys (Add to .env file)

### 1. USDA NASS API Key ⭐ **REQUIRED**
- **Purpose**: US agricultural production data, crop statistics
- **Get Key**: https://quickstats.nass.usda.gov/api
- **Free**: Yes, unlimited requests
- **Add to .env**: `USDA_NASS_API_KEY=your_key_here`

### 2. Alpha Vantage API Key ⭐ **REQUIRED** 
- **Purpose**: Commodity prices, market data
- **Get Key**: https://www.alphavantage.co/support/#api-key
- **Free**: 25 requests/day, 5 requests/minute
- **Add to .env**: `ALPHA_VANTAGE_API_KEY=your_key_here`

### 3. FRED API Key ⭐ **REQUIRED**
- **Purpose**: Economic indicators, inflation data
- **Get Key**: https://fred.stlouisfed.org/docs/api/api_key.html
- **Free**: Yes, unlimited requests
- **Add to .env**: `FRED_API_KEY=your_key_here`

### 4. NOAA API Key (Optional)
- **Purpose**: Enhanced weather alerts
- **Get Key**: https://www.ncdc.noaa.gov/cdo-web/token
- **Free**: Yes, 1000 requests/day
- **Add to .env**: `NOAA_API_KEY=your_key_here`

### 5. Open-Meteo (No Key Required)
- **Purpose**: Weather data, drought monitoring
- **Free**: Yes, no registration needed
- **Note**: Already integrated, no key needed

## Quick Setup Steps

1. **Get USDA NASS Key** (2 minutes):
   - Visit: https://quickstats.nass.usda.gov/api
   - Click "Request API Key"
   - Fill form with email
   - Check email for key

2. **Get Alpha Vantage Key** (1 minute):
   - Visit: https://www.alphavantage.co/support/#api-key
   - Enter email
   - Get instant key

3. **Get FRED Key** (2 minutes):
   - Visit: https://fred.stlouisfed.org/docs/api/api_key.html
   - Create account
   - Request API key

4. **Update .env file**:
   ```env
   USDA_NASS_API_KEY=your_usda_key
   ALPHA_VANTAGE_API_KEY=your_alphavantage_key
   FRED_API_KEY=your_fred_key
   ```

## Data Sources & Calculations

### With API Keys (Live Data):
- **Weather Alerts**: NOAA + Open-Meteo
- **Production Data**: USDA NASS
- **Price Data**: Alpha Vantage + Yahoo Finance
- **Economic Data**: FRED
- **Calculations**: Real-time climate impact, price premiums, volatility

### Without API Keys (Mock Data):
- **Weather**: Simulated alerts and drought data
- **Production**: Historical patterns
- **Prices**: Base commodity prices with calculated premiums
- **Calculations**: Same formulas with mock inputs

## Testing

**Test with mock data** (no keys needed):
```bash
python run.py
# Visit: http://localhost:8000/api/v1/climate/dashboard?commodities=corn
```

**Test with live data** (after adding keys):
```bash
# Same endpoint will automatically use live data
```

## Rate Limits

- **USDA NASS**: Unlimited
- **Alpha Vantage**: 25/day (free tier)
- **FRED**: Unlimited  
- **NOAA**: 1000/day
- **Open-Meteo**: Unlimited

## Priority Setup

**Minimum for live data**: USDA_NASS_API_KEY + ALPHA_VANTAGE_API_KEY + FRED_API_KEY

**All calculations work without keys** - they just use mock data as inputs to the same calculation formulas.