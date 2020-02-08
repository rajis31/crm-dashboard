import os 
import pymysql as sql
import pandas as pd

class initDB:
    
    def __init__(self):
        self.dbPath = os.path.abspath(__file__)
        self.parentDir= os.path.dirname(os.path.dirname(self.dbPath))

    def initialzeDB(self):
        self.connectDB()
        self.cur.execute("DROP DATABASE CRM1;")
        self.cur.execute("CREATE DATABASE CRM1;")
        self.cur.execute("USE CRM1;")
        
        # Create Team table for sales people
        self.cur.execute(
            """
               CREATE TABLE team (
                        team_id INT PRIMARY KEY,
                        name VARCHAR(255)
                );
            """
        )
        # Create table for deals
        self.cur.execute(
        """
            CREATE TABLE transactions (
            id INT PRIMARY KEY,
            sales_rm_id INT,
            name VARCHAR(255),
            start_date DATE default null,
            completion_date DATE default null,
            total DECIMAL(15 , 2 ),
            status VARCHAR(100),
            FOREIGN KEY (sales_rm_id)
                REFERENCES team (team_id)
        );
        """
        )
        
        # Create table for goals
        self.cur.execute(
            """
            CREATE TABLE goal (
            team_id INT,
            year INT,
            goal DECIMAL(15 , 2 ),
            FOREIGN KEY (team_id)
                REFERENCES team (team_id)
        );
            """
        )
        
        # Import data in
        data = pd.read_excel("data.xlsx", sheet_name="team")
        data=data.values
        for i in data:
            self.cur.execute("""
                INSERT INTO team (team_id, name) VALUES (%s,%s)
            """,(i[0],i[1]))
            
            
        data = pd.read_excel("data.xlsx", sheet_name="transactions",header=0)
        data["start_date"] = data["start_date"].astype(str)
        data["completion_date"] = data["completion_date"].astype(str)
       
        
        data=data.values
        print(data)
        for i in data:
            self.cur.execute("""
                INSERT INTO transactions (id,sales_rm_id, name, start_date, completion_date, total, status) VALUES (%s,%s,%s,%s,%s,%s,%s)
            """,(i[0],i[1],i[2],i[3],i[4],i[5],i[6]))
            
        data = pd.read_excel("data.xlsx", sheet_name="goal", dtype={"team_id": str, "year": str , "goal": str})
        data = data.values 
        
        for i in data:
            self.cur.execute("""
                INSERT INTO goal (team_id, year, goal) VALUES (%s,%s,%s)
            """,(i[0],i[1],i[2]))

        # Commit records to db
        self.con.commit()
        
        # Close connection
        self.closeConnect()

    def connectDB(self):
        self.con = sql.connect(host="localhost", user = "root", password = "bonfire09", db = "crm1")
        self.cur = self.con.cursor()
    
    def runQuery(self,query):
        try:
            result={}
            self.cur.execute(query)
            data = [i for i in self.cur.fetchall()]
            cols = [i[0] for i in self.cur.description]
            result["cols"] = cols
            result["data"] = data
            return result
        except:
            print("Query could not be exectued")

    
    def closeConnect(self):
        self.cur.close()
        self.con.close()
        
    


if __name__=="__main__":
    db=initDB()
    #db.initialzeDB()
    #db.connectDB()
    #db.closeConnect()


