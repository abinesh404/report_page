import sys
sys.path.append('backend')
from main import db_config_complibear
import psycopg2
conn = psycopg2.connect(**db_config_complibear)
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
tables = [r[0] for r in cur.fetchall()]
for table in tables:
    cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='{table}'")
    print(f"\nTable {table}:")
    for col in cur.fetchall():
        print(f"  {col[0]} ({col[1]})")
