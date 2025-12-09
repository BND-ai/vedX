import asyncio
import httpx
import sys
import json

async def test_google_news():
    print("\n📰 Testing Google News Connector...")
    print("-" * 40)
    
    url = "http://localhost:8000/api/v1/news/google_search"
    params = {
        "query": "wheat prices",
        "limit": 3
    }
    
    try:
        async with httpx.AsyncClient() as client:
            print(f"Fetching news from: {url}")
            response = await client.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                articles = data.get("data", [])
                
                print(f"\n✅ Success! Found {len(articles)} articles.")
                print("-" * 40)
                
                for i, article in enumerate(articles, 1):
                    print(f"{i}. {article['headline']}")
                    print(f"   Category: {article.get('category', 'N/A')}")
                    print(f"   Source: {article['source']}")
                    print(f"   URL: {article['url']}")
                    print("-" * 20)
                    
                print("\nMetadata:")
                print(json.dumps(data.get("metadata", {}), indent=2))
            else:
                print(f"❌ Error: {response.status_code}")
                print(response.text)
                
    except Exception as e:
        print(f"❌ Connection Error: {str(e)}")
        print("Make sure the server is running (python run.py)")

if __name__ == "__main__":
    # Check if server is running
    try:
        asyncio.run(test_google_news())
    except KeyboardInterrupt:
        print("\nTest cancelled.")
