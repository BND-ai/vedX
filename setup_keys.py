import json

env_content = """# FastAPI Configuration
APP_NAME=Ananta News Aggregator
APP_VERSION=1.0.0
DEBUG=True
HOST=0.0.0.0
PORT=8000

# API Keys
GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSyAeeXTGdMS1mUjBX0vAFWpghzHz0j7hlJI
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=94186788f09ec4b30
PERPLEXITY_API_KEY=

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
