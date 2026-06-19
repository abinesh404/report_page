import sys
import traceback
from psycopg2.pool import SimpleConnectionPool
from main import db_config, db_config_complibear
from ppt_generator import generate_presentation

pool = SimpleConnectionPool(1, 10, **db_config)
try:
    generate_presentation("Test Report", pool, db_config_complibear, report_type="Executive Summary")
    print("Success")
except Exception as e:
    traceback.print_exc()
