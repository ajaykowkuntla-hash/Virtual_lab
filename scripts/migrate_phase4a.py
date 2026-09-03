import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "iot-backend", "database.db")
    print(f"Connecting to database at {db_path}")
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if institutions table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='institutions'")
    table_exists = cursor.fetchone()
    
    if not table_exists:
        print("Creating 'institutions' table...")
        cursor.execute("""
            CREATE TABLE institutions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR NOT NULL,
                code VARCHAR UNIQUE NOT NULL,
                description TEXT,
                status VARCHAR DEFAULT 'Active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("CREATE INDEX ix_institutions_id ON institutions (id)")
        cursor.execute("CREATE INDEX ix_institutions_name ON institutions (name)")
        cursor.execute("CREATE UNIQUE INDEX ix_institutions_code ON institutions (code)")
        
        conn.commit()
        print("Successfully created 'institutions' table and indexes.")
    else:
        print("'institutions' table already exists. No migration needed.")
        
    conn.close()

if __name__ == "__main__":
    migrate()
