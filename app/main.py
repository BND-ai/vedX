"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import logging

from app.config import settings
from app.routes import router
from app.routes.climate_api import router as climate_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Ananta News Aggregator API
    
    A multi-source news aggregation API that fetches and normalizes news data from various sources.
    
    ### Features
    - **Multiple Sources**: Google Search, Perplexity, Baidu News, Zee Business, Agro Portals
    - **Normalized Data**: Unified JSON schema across all sources
    - **Smart Filtering**: Filter by country, commodity, ticker symbols
    - **Concurrent Fetching**: Fast parallel data retrieval
    - **Auto-tagging**: Automatic commodity and ticker extraction
    
    ### Data Categories
    - Weather forecasts
    - Commodity prices (grains, metals, energy)
    - Country-specific news
    - Agricultural updates
    - Market analysis
    
    ### Quick Start
    1. Get all news: `GET /api/v1/news`
    2. Filter by commodity: `GET /api/v1/news?commodity=agriculture`
    3. Specific source: `GET /api/v1/news/zee_business`
    4. Health check: `GET /api/v1/health`
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)
app.include_router(climate_router)


@app.get("/", include_in_schema=False)
async def root():
    """Redirect root to API documentation"""
    return RedirectResponse(url="/docs")


@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info("API documentation available at /docs")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info(f"Shutting down {settings.APP_NAME}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
