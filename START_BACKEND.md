# Starting the Ananta FastAPI Backend

## Quick Start

### 1. Install Dependencies (First Time Only)
```bash
pip install -r requirements.txt
```

### 2. Configure API Keys
Edit `setup_keys.py` and add your API keys:
- Google Search API Key
- Perplexity API Key
- Other service API keys

Then run:
```bash
python setup_keys.py
```

### 3. Start the Backend Server
```bash
python run.py
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: **http://localhost:8000**

### 4. Test the API
Open your browser to:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/v1/health
- News Endpoint: http://localhost:8000/api/v1/news?commodity=agriculture&limit=5

## Available Endpoints

### News Aggregation
- `GET /api/v1/news` - Get aggregated news from all sources
- `GET /api/v1/news/product/{product}` - Get news for specific commodity
- `GET /api/v1/news/product/{product}?category=trade` - Filter by category

### Parameters
- **query**: Search term (e.g., "wheat prices")
- **country**: Filter by country (e.g., "India")
- **state**: Filter by state/region
- **commodity**: Filter by commodity type
- **ticker**: Filter by ticker symbol
- **category**: News category (trade, price, supply, climate, geopolitics)
- **limit**: Max results (1-100)

### Examples
```bash
# Get wheat news
curl "http://localhost:8000/api/v1/news/product/wheat?limit=10"

# Get trade news for rice in India
curl "http://localhost:8000/api/v1/news/product/rice?category=trade&country=India"

# Get price news for corn
curl "http://localhost:8000/api/v1/news/product/corn?category=price&limit=20"
```

## Data Sources
The backend aggregates news from:
1. **Google Search** - Global news coverage
2. **Perplexity AI** - AI-powered insights
3. **Zee Business** - Indian business news
4. **Baidu News** - Chinese market news
5. **Agro Portals** - Agricultural news

## Caching
- News is cached for 1 hour per product/category
- Use `?refresh=true` to bypass cache
- Cache stats: `GET /api/v1/cache/stats`
- Clear cache: `POST /api/v1/cache/clear`

## Frontend Integration
The React frontend automatically connects to the backend at `http://localhost:8000/api/v1`

Make sure both are running:
1. Backend: `python run.py` (port 8000)
2. Frontend: `npm run dev` (port 5173)

## Troubleshooting

### CORS Errors
The backend is configured to allow localhost:5173. If using a different port, update `app/config.py`:
```python
CORS_ORIGINS = ["http://localhost:5173", "http://localhost:YOUR_PORT"]
```

### API Key Issues
- Check `.env` file has all required keys
- Verify keys are valid and have credits
- Check console logs for specific API errors

### Connection Refused
- Ensure backend is running on port 8000
- Check firewall settings
- Verify `VITE_API_URL` in frontend `.env` file
