import json

env_content = """# FastAPI Configuration
APP_NAME=Ananta News Aggregator
APP_VERSION=1.0.0
DEBUG=True
HOST=0.0.0.0
PORT=8000

# API Keys
# Get your Google Custom Search API key from: https://developers.google.com/custom-search/v1/overview
GOOGLE_CUSTOM_SEARCH_API_KEY=your_google_api_key_here
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_google_search_engine_id_here
# Get your Perplexity API key from: https://www.perplexity.ai/
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Caching
REQUEST_TIMEOUT=30
CACHE_ENABLED=True
CACHE_TTL=3600

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
"""

with open(".env", "w", encoding="utf-8") as f:
    f.write(env_content)

print("✅ .env file created successfully")
