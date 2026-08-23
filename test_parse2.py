from sqlalchemy import create_engine
try:
    create_engine("DATABASE_URL = postgresql://postgres.mjcqrktxfuyeljiqvppj:password%40123@aws-0-ap-south-1.pooler.supabase.com:5432/postgres")
except Exception as e:
    print(str(e))
