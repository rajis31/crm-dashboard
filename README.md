# About #

This is a prototype dashboard that can be used to track sales team goals such and how far each individual is from their goal, and the user has the ability to drill down and see the individual's performance.  The project is built using Flask which is a micro web framework, D3.JS for the charts, MySQL to house the data, and uWSGI/nginx to handle the web requests. You can see a live version of this site at [here](https://crm.raj302.com). Overall this project allows users to adapt their prototype for their business solution. 

# Project Outline # 

 `App.py` is the main file that contains the views and database logic for this dashboard. `PyMySQL` was used as the database driver to interact with the backend MySQL database 
 and D3.js was used to handle the charts on the frontend.  This was the first time that I used D3.js so it was a cool learning experience to code these charts from scratch. Sample data was used to ensure data accuracy and is included in this project as well. 
 
 # Future Changes # 
 
 A more multi dimensional CRM dashboard is being worked on that can be used to incoroporate a larger team, more robust in terms of the metrics that be tracked, and improvements to the chart aesthetics. 



