import sys
sys.path.append('backend')
from main import pool
conn = pool.getconn()
cur = conn.cursor()
cur.execute("SELECT DISTINCT process FROM audit_plan")
print([r[0] for r in cur.fetchall()])
