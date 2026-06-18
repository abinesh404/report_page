import os
import csv
import json
from datetime import datetime, date
import psycopg2
from psycopg2.extras import RealDictCursor

# Configuration for both databases
databases = [
    {
        "name": "complibear",
        "config": {
            "host": "192.168.1.66",
            "port": 5432,
            "user": "postgres",
            "password": "postgres",
            "database": "complibear"
        }
    },
    {
        "name": "sentinel_db",
        "config": {
            "host": "192.168.1.66",
            "port": 5432,
            "user": "postgres",
            "password": "postgres",
            "database": "sentinel_db"
        }
    }
]

# Create output folder
output_base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloaded_tables")
os.makedirs(output_base_dir, exist_ok=True)
print(f"Storing downloaded tables in: {output_base_dir}")

def serialize_value(val):
    if val is None:
        return ""
    if isinstance(val, (datetime, date)):
        return val.isoformat()
    if isinstance(val, (dict, list)):
        return json.dumps(val, default=str)
    if isinstance(val, bytes):
        return val.hex()
    return str(val)

for db in databases:
    db_name = db["name"]
    db_config = db["config"]
    db_dir = os.path.join(output_base_dir, db_name)
    os.makedirs(db_dir, exist_ok=True)
    
    print(f"\nConnecting to database: {db_name} on {db_config['host']}...")
    try:
        conn = psycopg2.connect(**db_config)
        with conn.cursor() as cur:
            # Query all user tables (excluding system schemas)
            cur.execute("""
                SELECT table_schema, table_name 
                FROM information_schema.tables 
                WHERE table_type = 'BASE TABLE' 
                  AND table_schema NOT IN ('pg_catalog', 'information_schema')
                ORDER BY table_schema, table_name;
            """)
            tables = cur.fetchall()
            
            if not tables:
                print(f"No user tables found in database {db_name}.")
                continue
            
            print(f"Found {len(tables)} tables in {db_name}.")
            
            for schema, table in tables:
                full_table_name = f"{schema}.{table}"
                file_name = f"{schema}_{table}.csv" if schema != "public" else f"{table}.csv"
                file_path = os.path.join(db_dir, file_name)
                
                print(f"  Downloading table: {full_table_name} -> {file_name}...")
                
                try:
                    # Query column names first to use as CSV headers
                    cur.execute(f"SELECT * FROM {schema}.\"{table}\" LIMIT 0;")
                    colnames = [desc[0] for desc in cur.description]
                    
                    # Fetch all rows
                    cur.execute(f"SELECT * FROM {schema}.\"{table}\";")
                    rows = cur.fetchall()
                    
                    with open(file_path, 'w', newline='', encoding='utf-8') as f:
                        writer = csv.writer(f)
                        # Write headers
                        writer.writerow(colnames)
                        # Write rows with serialization
                        for row in rows:
                            serialized_row = [serialize_value(val) for val in row]
                            writer.writerow(serialized_row)
                            
                    print(f"    Saved {len(rows)} rows to {file_path}")
                except Exception as table_err:
                    print(f"    Error exporting table {full_table_name}: {table_err}")
                    # Rollback transaction so we can continue with other tables
                    conn.rollback()
                    
        conn.close()
    except Exception as db_err:
        print(f"Failed to process database {db_name}: {db_err}")

print("\nAll done!")
