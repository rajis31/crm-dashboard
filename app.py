from flask import Flask,render_template,redirect, request, url_for
import sqlite3 as sql
import numpy as np
import pandas as pd
import json
import os 
import pymysql as sql 
from flask_wtf import FlaskForm
from wtforms import TextField,SelectField,SubmitField, ValidationError
from wtforms.fields.html5 import DateField
import re 
import datetime as dt

# Find the base directory of app.py
BASE_DIR = os.path.dirname(os.path.abspath(__name__))

# Import database class from backend folder
os.chdir(os.path.join(BASE_DIR,"backend"))
from backend import db as DB
os.chdir(BASE_DIR)

# Initialize Flask App 
app=Flask(__name__, static_folder="design")
app.config["SECRET_KEY"]="I am a secret"

#Create form so user can add data to database 
class dataSubmitForm(FlaskForm):
    # Grab the various sales people for dropdown menu
    db=DB.initDB()
    db.connectDB()
    rms = [(i[0],i[0]) for i in db.runQuery("SELECT name FROM team;")["data"]]
    db.closeConnect()
    
    # Create different Form Fields
    sales= SelectField("Sales Person", choices=rms)
    start  = DateField("Start Date", format="%Y-%m-%d")
    end    = DateField("End Date", format="%Y-%m-%d")
    total  = TextField(label="Total")
    status = SelectField("Status", choices=[("Won","Won"), ("Lost","Lost")])
    submit = SubmitField("Submit")
    
    # Check if Start Date is selected
    def validate_start(form,field):
        if field.data is None:
            raise ValidationError("Please select a start date")
        if form.end.data is not None and field.data is not None:
            if form.end.data < field.data:
                raise ValidationError("Start date needs to be before the end date")
            
    # Check if End Date is selected
    def validate_end(form,field):
        if field.data is None:
            raise ValidationError("Please select a End date")
    
    # Check if the total sales amount is valid
    def validate_total(form,field):
        if field.data is None  or re.search("[a-zA-Z]+",field.data) is not None:
            raise ValidationError("Total value entered is invalid")
        elif field.data=="":
            raise ValidationError("Please enter a value")
        elif float(field.data)<=0:
            raise ValidationError("Total cannot be less then 0")
        
            
@app.route("/", methods=["GET","POST"])
def homepage():
    # Initialize data list which will hold dataframes of data from various datasets
    data=[0,0,0,0,0]
    db=DB.initDB()
    db.connectDB()
    
    # Grab data from database for various charts
    data[0] = db.runQuery("SELECT name, sum(total) as total_sold FROM transactions  where status='won' group by name;")
    data[1] = db.runQuery("SELECT name, sum(case when status='won' then 1 else 0 end) as won, sum(case when status='lost' then 1 else 0 end) as lost  FROM transactions group by name;")
    data[2] = db.runQuery("SELECT team.team_id as team_id, team.name as name, year,round((sum(total)/goal)*100,0) as met from goal join team on goal.team_id = team.team_id  join transactions on sales_rm_id = goal.team_id and year(transactions.completion_date) = goal.year where year=2019 group by team_id, year ;")
    data[3] = db.runQuery("select name, avg(completion_date - start_date) as days from transactions group by name;")
    data[4] = db.runQuery("select year(completion_date) as year, sum(total) as total from transactions where year(completion_date)>0 group by year(completion_date) ;")
    team   = db.runQuery("SELECT name from team;")
    db.closeConnect()
    
    # Create empty form class
    form = dataSubmitForm()
    
    # Convert list of dataframes to json
    for i in range(0, len(data)):
        data[i] = pd.DataFrame(data[i]["data"],columns=data[i]["cols"])
        data[i] = data[i].to_json(orient="records")
    
    # Check if a POST request was made - POST is used when something needs to be done
    if request.method=="POST":
        # Check to see if user selected a sales person to filter the charts on
        if request.form.get("btn")=="Filter":
            # Update charts 
            if request.form.get("select")=="All":
                print("All has been selected")
            else:
                name=request.form.get("select")
                print(type(name))
                data=[0,0,0,0,0]
                db=DB.initDB()
                db.connectDB()
                # Grab data from database for various charts
                data[0] = db.runQuery("SELECT name, sum(total) as total_sold FROM transactions  where status='won' and name = '{0}' group by name;".format(name))
                data[1] = db.runQuery("SELECT name, sum(case when status='won' then 1 else 0 end) as won, sum(case when status='lost' then 1 else 0 end) as lost  FROM transactions where name='{0}' group by name;".format(name))
                data[2] = db.runQuery("SELECT team.team_id as team_id, team.name as name, year,round((sum(total)/goal)*100,0) as met from goal join team on goal.team_id = team.team_id  join transactions on sales_rm_id = goal.team_id and year(transactions.completion_date) = goal.year where year=2019 and team.name='{0}' group by team_id, year;".format(name))
                data[3] = db.runQuery("select name, avg(completion_date - start_date) as days from transactions where name='{0}' group by name;".format(name))
                data[4] = db.runQuery("select year(completion_date) as year, sum(total) as total from transactions where year(completion_date)>1960 and name='{0}' group by year(completion_date);".format(name))
                team   = db.runQuery("SELECT name from team;")
                
                 # Convert list of dataframes to json
                for i in range(0, len(data)):
                    data[i] = pd.DataFrame(data[i]["data"],columns=data[i]["cols"])
                    data[i] = data[i].to_json(orient="records")
                db.closeConnect()
        # Check to see if user is submitting data to the database instead
        else:
            if form.validate_on_submit():
                db = DB.initDB()
                db.connectDB()
                idx = db.runQuery("SELECT max(id) from transactions;")["data"][0][0]
                values=(str(idx+1),request.form.get("sales"), request.form.get("start"), request.form.get("end"), request.form.get("total"), request.form.get("status"))
                db.cur.execute("INSERT INTO transactions (id,name,start_date, completion_date, total,status) VALUES (%s,%s,%s,%s,%s,%s)",values)
                db.con.commit()
                db.closeConnect()
                return redirect(url_for("homepage"))
            else:
                pass
    return render_template("index.html", team=team["data"], data1=data[0], data2=data[1], data3=data[2], data4=data[3], data5=data[4], form=form)
 
if "__main__"==__name__:
    app.run(port=5010,debug=True)    