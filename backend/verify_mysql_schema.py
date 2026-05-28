import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='admin_password',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    with connection.cursor() as cursor:
        print("====== SHOW DATABASES ======")
        cursor.execute("SHOW DATABASES;")
        for db in cursor.fetchall():
            print(db)
            
        print("\n====== USE knowledge_flow_db ======")
        cursor.execute("USE knowledge_flow_db;")
        print("Switched to knowledge_flow_db")
        
        print("\n====== SHOW TABLES ======")
        cursor.execute("SHOW TABLES;")
        for tbl in cursor.fetchall():
            print(tbl)
            
        print("\n====== DESCRIBE users ======")
        cursor.execute("DESCRIBE users;")
        for col in cursor.fetchall():
            print(col)
            
        print("\n====== DESCRIBE tasks ======")
        cursor.execute("DESCRIBE tasks;")
        for col in cursor.fetchall():
            print(col)
            
        print("\n====== DESCRIBE documents ======")
        cursor.execute("DESCRIBE documents;")
        for col in cursor.fetchall():
            print(col)
            
        print("\n====== DESCRIBE activity_logs ======")
        cursor.execute("DESCRIBE activity_logs;")
        for col in cursor.fetchall():
            print(col)
            
        print("\n====== CHECK ALEMBIC ======")
        cursor.execute("SELECT * FROM alembic_version;")
        print(cursor.fetchall())
        
except Exception as e:
    print(f"Failed to connect to MySQL: {e}")
