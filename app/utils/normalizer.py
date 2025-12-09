"""
Data normalization utilities
"""
from typing import List, Dict, Any
from datetime import datetime
from app.models.schemas import NewsArticle


def normalize_timestamp(timestamp: Any) -> datetime:
    """
    Normalize various timestamp formats to datetime
    
    Args:
        timestamp: Timestamp in various formats
        
    Returns:
        Normalized datetime object
    """
    if isinstance(timestamp, datetime):
        return timestamp
    
    if isinstance(timestamp, str):
        try:
            return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except ValueError:
            pass
    
    return datetime.utcnow()


def deduplicate_articles(articles: List[NewsArticle]) -> List[NewsArticle]:
    """
    Remove duplicate articles based on headline similarity
    
    Args:
        articles: List of articles
        
    Returns:
        Deduplicated list
    """
    seen_headlines = set()
    unique_articles = []
    
    for article in articles:
        # Simple deduplication based on headline
        headline_key = article.headline.lower().strip()
        
        if headline_key not in seen_headlines:
            seen_headlines.add(headline_key)
            unique_articles.append(article)
    
    return unique_articles


def merge_tags(tags1: List[str], tags2: List[str]) -> List[str]:
    """
    Merge two lists of tags, removing duplicates
    
    Args:
        tags1: First list of tags
        tags2: Second list of tags
        
    Returns:
        Merged list without duplicates
    """
    return list(set(tags1 + tags2))
