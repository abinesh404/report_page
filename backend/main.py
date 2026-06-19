import sys
import io
from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from ppt_generator import generate_presentation

app = Flask(__name__)
# Enable CORS for frontend compatibility
CORS(app)

# Database connection configuration as requested
db_config = {
    "host": "ep-fragrant-dawn-at7nzvqv-pooler.c-9.us-east-1.aws.neon.tech",
    "port": 5432,
    "user": "neondb_owner",
    "password": "npg_5wQeyoh4pxFT",
    "database": "neondb",
    "sslmode": "require"
}

# Create PostgreSQL connection pool
# minconn=1, maxconn=10, keep connection parameters
try:
    pool = SimpleConnectionPool(1, 10, **db_config)
except Exception as e:
    print(f"Failed to initialize PostgreSQL connection pool: {e}", file=sys.stderr)
    sys.exit(1)

@app.route('/api/audits', methods=['GET'])
def get_audits():
    conn = None
    try:
        # Get connection from pool
        conn = pool.getconn()
        # Use RealDictCursor to map query columns as keys in the response dictionaries
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SET search_path TO sentinel_db;")
            cur.execute("SELECT * FROM audit_plan;")
            rows = cur.fetchall()
            return jsonify(rows)
    except Exception as e:
        print(f"Error querying audit_plan table: {e}", file=sys.stderr)
        return jsonify({"error": "Failed to retrieve audits from database", "details": str(e)}), 500
    finally:
        if conn:
            # Always return connection to the pool
            pool.putconn(conn)

# Configuration for complibear database
db_config_complibear = {
    "host": "ep-fragrant-dawn-at7nzvqv-pooler.c-9.us-east-1.aws.neon.tech",
    "port": 5432,
    "user": "neondb_owner",
    "password": "npg_5wQeyoh4pxFT",
    "database": "neondb",
    "sslmode": "require"
}

@app.route('/api/generate-ppt', methods=['POST'])
def generate_ppt():
    try:
        req_data = request.json or {}
        form_data = req_data.get('formData', {})
        report_name = form_data.get('reportName', 'Sentinel & Complibear Audit Report')
        
        report_type = form_data.get('reportType')
        # Generate presentation using logic in ppt_generator
        out_stream = generate_presentation(report_name, pool, db_config_complibear, report_type=report_type)
        
        return send_file(
            out_stream,
            mimetype="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            as_attachment=True,
            download_name=f"{report_name}.pptx"
        )
    except Exception as e:
        print(f"Error generating PowerPoint report: {e}", file=sys.stderr)
        return jsonify({"error": "Failed to generate PowerPoint report", "details": str(e)}), 500

if __name__ == '__main__':
    # Test connection and log database status on server startup
    conn = None
    try:
        conn = pool.getconn()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SET search_path TO sentinel_db;")
            cur.execute("SELECT * FROM audit_plan LIMIT 1;")
            row = cur.fetchone()
            print("Successfully connected to PostgreSQL database: sentinel_db")
            if row:
                print("Sample row from audit_plan:")
                # Safely convert date types to string for output logging
                import json
                from datetime import datetime, date
                def default_serializer(o):
                    if isinstance(o, (datetime, date)):
                        return o.isoformat()
                    return str(o)
                print(json.dumps(row, default=default_serializer, indent=2))
            else:
                print("audit_plan table is empty")
    except Exception as e:
        print(f"Error connecting to sentinel_db on Neon: {e}", file=sys.stderr)
    finally:
        if conn:
            pool.putconn(conn)

    # Start Flask development server on port 4004
    # Use debug=False to avoid reloading twice in background tasks
    print("Starting Flask API server on http://localhost:4004")
    app.run(host='127.0.0.1', port=4004, debug=False)
