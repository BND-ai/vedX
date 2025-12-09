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
                "international trade", "bilateral", "agreement", "commerce"
            ],
            NewsCategory.PRICE: [
                "price", "cost", "surge", "drop", "rally", "decline", "rise",
                "fall", "increase", "decrease", "forecast", "prediction",
                "expensive", "cheap", "value", "worth", "rate", "premium",
                "discount", "market price", "spot price", "futures"
            ],
            NewsCategory.SUPPLY_DEMAND: [
                "production", "harvest", "inventory", "stock", "shortage",
                "surplus", "supply", "demand", "output", "yield", "crop",
                "reserve", "stockpile", "consumption", "usage", "availability",
                "scarcity", "abundance", "buffer stock"
            ],
            NewsCategory.CLIMATE: [
                "weather", "drought", "rainfall", "temperature", "season",
                "flood", "climate", "monsoon", "storm", "cyclone", "heat",
                "cold", "precipitation", "forecast", "el nino", "la nina",
                "frost", "snow", "humidity", "wind", "heatwave"
            ],
            NewsCategory.GEOPOLITICS: [
                "policy", "regulation", "government", "law", "sanction",
                "ban", "restriction", "subsidy", "tax", "duty", "minister",
                "parliament", "congress", "legislation", "political",
                "election", "reform", "scheme", "program", "initiative",
                "bilateral", "multilateral", "treaty", "accord"
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
