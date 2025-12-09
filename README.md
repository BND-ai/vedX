# Ananta FastAPI - Multi-Source News Aggregator

A production-ready FastAPI backend that aggregates news from multiple sources and provides normalized JSON responses for commodities, weather, and country-specific data.

## 🚀 Features

- **5 Data Source Connectors**:
  - Google Custom Search API
  - Perplexity AI API
  - Baidu News
  - Zee Business RSS Feeds
  - Agricultural News Portals

- **Normalized Data Schema**: Unified JSON format across all sources
- **Smart Auto-tagging**: Automatic extraction of tickers and commodity tags
- **Concurrent Fetching**: Fast parallel data retrieval from all sources
- **Flexible Filtering**: Filter by country, commodity, ticker symbols
- **RESTful API**: Clean, well-documented endpoints
- **Postman Ready**: Fully testable with Postman

## 📁 Project Structure

```
Ananta_FastAPI/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration & environment variables
│   ├── models/              # Pydantic schemas
│   │   ├── __init__.py
│   │   └── schemas.py
│   ├── connectors/          # Data source integrations
│   │   ├── __init__.py
│   │   ├── base.py          # Base connector class
│   │   ├── google_search.py
│   │   ├── perplexity.py
│   │   ├── baidu_news.py
│   │   ├── zee_business.py
│   │   └── agro_portals.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   └── aggregator.py
│   ├── routes/              # API endpoints
│   │   ├── __init__.py
│   │   └── api.py
│   └── utils/               # Helper functions
│       ├── __init__.py
│       └── normalizer.py
├── tests/
│   └── __init__.py
├── .env.example             # Environment variables template
├── .gitignore
├── requirements.txt
├── README.md
└── run.py                   # Development server
```

## 🛠️ Installation

### 1. Clone or navigate to the project directory

```bash
cd C:\Users\Dev\Desktop\Ananta_FastAPI
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Copy `.env.example` to `.env` and add your API keys:

```bash
copy .env.example .env
```

Edit `.env` and add your API keys:
```env
GOOGLE_CUSTOM_SEARCH_API_KEY=your_actual_api_key
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id
PERPLEXITY_API_KEY=your_perplexity_api_key
```

**Note**: The API works with mock data even without API keys for testing purposes.

## 🚀 Running the Application

### Development Server

```bash
python run.py
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📡 API Endpoints

### Health Check
```
GET /api/v1/health
```

### Get All News (Aggregated)
```
GET /api/v1/news
```

**Query Parameters**:
- `query` - Search term (optional)
- `country` - Filter by country (optional)
- `commodity` - Filter by commodity tag (optional)
- `ticker` - Filter by ticker symbol (optional)
- `limit` - Max results per source (default: 10, max: 100)
- `deduplicate` - Remove duplicates (default: true)

**Example**:
```
GET /api/v1/news?commodity=agriculture&country=India&limit=5
```

### Get News from Specific Source
```
GET /api/v1/news/{source}
```

**Sources**: `google_search`, `perplexity`, `baidu_news`, `zee_business`, `agro_portals`

**Example**:
```
GET /api/v1/news/zee_business?commodity=metals
```

### List Available Sources
```
GET /api/v1/sources
```

## 📊 Response Schema

```json
{
  "status": "success",
  "data": [
    {
      "headline": "Wheat Prices Surge Amid Supply Concerns",
      "source": "zee_business",
      "tickers": ["WHEAT"],
      "country": "India",
      "commodity_tags": ["agriculture", "grains"],
      "timestamp": "2025-11-28T06:00:00Z",
      "url": "https://example.com/article",
      "summary": "Wheat prices increased by 12%..."
    }
  ],
  "metadata": {
    "total_results": 10,
    "sources_used": ["zee_business", "google_search"],
    "failed_sources": [],
    "timestamp": "2025-11-28T06:07:45Z"
  }
}
```

## 🧪 Testing with Postman

### 1. Import the API

Open Postman and import the OpenAPI schema:
- URL: `http://localhost:8000/openapi.json`

### 2. Example Requests

**Get All News**:
```
GET http://localhost:8000/api/v1/news
```

**Filter by Commodity**:
```
GET http://localhost:8000/api/v1/news?commodity=agriculture&limit=10
```

**Get from Specific Source**:
```
GET http://localhost:8000/api/v1/news/zee_business
```

**Filter by Country and Ticker**:
```
GET http://localhost:8000/api/v1/news?country=India&ticker=GOLD
```

## 🏷️ Supported Tags

### Commodity Tags
- `agriculture`
- `grains`
- `energy`
- `metals`
- `weather`
- `livestock`
- `dairy`

### Common Tickers
- `WHEAT`, `CORN`, `RICE`, `SOYBEAN`, `COTTON`
- `GOLD`, `SILVER`, `COPPER`
- `CRUDE`, `NATGAS`

## 🔧 Configuration

Edit `app/config.py` or `.env` file:

```env
# App Configuration
APP_NAME=Ananta News Aggregator
DEBUG=True
HOST=0.0.0.0
PORT=8000

# API Keys
GOOGLE_CUSTOM_SEARCH_API_KEY=your_key
PERPLEXITY_API_KEY=your_key

# Request Settings
REQUEST_TIMEOUT=30

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

## 🌐 Frontend Integration

The API is designed to be consumed by frontend applications. Example fetch:

```javascript
// Fetch aggregated news
const response = await fetch(
  'http://localhost:8000/api/v1/news?commodity=agriculture&limit=10'
);
const data = await response.json();

console.log(data.data); // Array of news articles
console.log(data.metadata); // Response metadata
```

## 📝 Development Notes

- **Mock Data**: All connectors include mock data for testing without API keys
- **Async Operations**: All data fetching is asynchronous for optimal performance
- **Error Handling**: Graceful degradation - failed sources don't break the entire response
- **Extensible**: Easy to add new connectors by extending `BaseConnector`

## 🔐 Security

- API keys stored in `.env` (not committed to git)
- CORS configured for specific origins
- Input validation using Pydantic
- Request timeouts to prevent hanging

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Both provide interactive API documentation with request/response examples.

## 🤝 Contributing

To add a new data source:

1. Create a new connector in `app/connectors/`
2. Extend `BaseConnector` class
3. Implement `fetch_news()` method
4. Add to `NewsAggregatorService` in `app/services/aggregator.py`

## 📄 License

This project is provided as-is for development purposes.

## 🆘 Support

For issues or questions:
1. Check the interactive docs at `/docs`
2. Review the logs in the console
3. Ensure all dependencies are installed
4. Verify environment variables are set correctly

---

**Built with FastAPI** 🚀
