from sqlalchemy.engine.url import make_url

url = "postgresql://postgres.mjcqrktxfuyeljiqvppj:password%40123@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

try:
    parsed = make_url(url)
    print("Parsed successfully:", parsed)
except Exception as e:
    print("Error:", e)
