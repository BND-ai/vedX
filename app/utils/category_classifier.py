"""
Category classifier for news articles
"""
from typing import Optional
from app.models.schemas import NewsCategory


class CategoryClassifier:
    """Classifies news articles into categories based on keywords"""
    
    def __init__(self):
        """Initialize keyword dictionaries for each category"""
        self.category_keywords = {
            NewsCategory.TRADE: [
                "export", "import", "shipment", "trading", "deal", "contract",
                "trade", "customs", "tariff", "quota", "buyer", "seller",
                "international trade", "bilateral", "agreement", "commerce",
                "freight", "cargo", "logistics", "shipping", "vessel", "port",
                "trade war", "trade deal", "trade agreement", "trade deficit",
                "trade surplus", "wto", "nafta", "usmca", "rcep", "tpp",
                "free trade", "protectionism", "dumping", "anti-dumping",
                "trade route", "supply chain", "procurement", "sourcing",
                "merchant", "trader", "broker", "distributor", "wholesaler",
                "retail", "b2b", "commodity exchange", "futures market",
                "spot market", "forward contract", "hedge", "arbitrage"
            ],
            NewsCategory.PRICE: [
                "price", "cost", "surge", "drop", "rally", "decline", "rise",
                "fall", "increase", "decrease", "forecast", "prediction",
                "expensive", "cheap", "value", "worth", "rate", "premium",
                "discount", "market price", "spot price", "futures",
                "volatility", "fluctuation", "swing", "movement", "trend",
                "bull market", "bear market", "correction", "crash",
                "bubble", "speculation", "manipulation", "squeeze",
                "support level", "resistance level", "breakout", "breakdown",
                "technical analysis", "fundamental analysis", "valuation",
                "overvalued", "undervalued", "fair value", "target price",
                "price action", "momentum", "reversal", "continuation",
                "inflation", "deflation", "cpi", "ppi", "commodity index",
                "benchmark", "reference price", "pricing model", "margin",
                "spread", "basis", "contango", "backwardation"
            ],
            NewsCategory.SUPPLY_DEMAND: [
                "production", "harvest", "inventory", "stock", "shortage",
                "surplus", "supply", "demand", "output", "yield", "crop",
                "reserve", "stockpile", "consumption", "usage", "availability",
                "scarcity", "abundance", "buffer stock", "strategic reserve",
                "capacity", "utilization", "throughput", "bottleneck",
                "constraint", "allocation", "rationing", "distribution",
                "warehouse", "storage", "silo", "tank", "facility",
                "mine", "mining", "extraction", "drilling", "refining",
                "processing", "manufacturing", "factory", "plant",
                "mill", "refinery", "smelter", "foundry", "farm",
                "plantation", "ranch", "field", "acreage", "hectare",
                "planting", "sowing", "cultivation", "growing season",
                "maturity", "ripening", "quality", "grade", "specification",
                "standard", "certification", "organic", "gmo", "non-gmo"
            ],
            NewsCategory.CLIMATE: [
                "weather", "drought", "rainfall", "temperature", "season",
                "flood", "climate", "monsoon", "storm", "cyclone", "heat",
                "cold", "precipitation", "forecast", "el nino", "la nina",
                "frost", "snow", "humidity", "wind", "heatwave",
                "hurricane", "typhoon", "tornado", "blizzard", "ice storm",
                "wildfire", "bushfire", "forest fire", "smoke", "haze",
                "air quality", "pollution", "smog", "dust storm",
                "climate change", "global warming", "greenhouse gas",
                "carbon footprint", "emissions", "sustainability",
                "renewable energy", "solar", "wind power", "hydroelectric",
                "irrigation", "water shortage", "reservoir", "groundwater",
                "soil moisture", "evaporation", "transpiration",
                "photosynthesis", "growing degree days", "chill hours",
                "phenology", "bloom", "flowering", "pollination",
                "pest", "disease", "fungus", "blight", "rust", "mold",
                "locust", "insect", "herbicide", "pesticide", "fungicide"
            ],
            NewsCategory.GEOPOLITICS: [
                "policy", "regulation", "government", "law", "sanction",
                "ban", "restriction", "subsidy", "tax", "duty", "minister",
                "parliament", "congress", "legislation", "political",
                "election", "reform", "scheme", "program", "initiative",
                "bilateral", "multilateral", "treaty", "accord",
                "diplomacy", "embassy", "ambassador", "foreign policy",
                "international relations", "sovereignty", "territory",
                "border", "customs union", "economic zone", "fta",
                "war", "conflict", "tension", "dispute", "crisis",
                "peace", "ceasefire", "negotiation", "mediation",
                "alliance", "partnership", "cooperation", "collaboration",
                "g7", "g20", "brics", "asean", "eu", "nato", "un",
                "world bank", "imf", "wto", "opec", "opec+",
                "central bank", "federal reserve", "ecb", "boc", "rbi",
                "interest rate", "monetary policy", "fiscal policy",
                "stimulus", "bailout", "austerity", "budget", "deficit",
                "debt", "credit rating", "sovereign", "currency",
                "exchange rate", "devaluation", "revaluation", "peg",
                "capital controls", "foreign investment", "fdi",
                "nationalization", "privatization", "state-owned"
            ]
        }
    
    def classify(self, text: str) -> NewsCategory:
        """
        Classify text into a news category
        
        Args:
            text: Combined headline and summary text
            
        Returns:
            NewsCategory enum value
        """
        if not text:
            return NewsCategory.OVERVIEW
        
        text_lower = text.lower()
        category_scores = {}
        
        # Score each category based on keyword matches
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                category_scores[category] = score
        
        # Return category with highest score
        if category_scores:
            return max(category_scores, key=category_scores.get)
        
        # Default to overview if no clear category
        return NewsCategory.OVERVIEW
    
    def classify_article(self, headline: str, summary: Optional[str] = None) -> NewsCategory:
        """
        Classify a news article based on headline and summary
        
        Args:
            headline: Article headline
            summary: Article summary (optional)
            
        Returns:
            NewsCategory enum value
        """
        combined_text = headline
        if summary:
            combined_text += " " + summary
        
        return self.classify(combined_text)


# Global classifier instance
classifier = CategoryClassifier()
