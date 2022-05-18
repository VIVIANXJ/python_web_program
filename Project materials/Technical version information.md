# Front end
jQuery v3.5.1  
Vue 2.6.14  
Icon: Awesome 4.7.0  

# Back end
Django 3.0.8  
MySQL 8.0.21  

# Application server
URL: https://nineyards1.azurewebsites.net  
Location: South Central US  

# Database
Server name: nineyards.mysql.database.azure.com  
Server admin login name: nineyards  
Database name: db2  
Password: Cs40123456  
Configuration: Burstable, B1ms, 1 vCores, 2 GiB RAM, 32 GiB storage  
MySQL version: 8.0.21  
Availability zone: 3  

## Database ER Diagram
![image](https://github.com/AppCurate/CS40-2/blob/main/Project%20materials/Database%20ER%20digram.png)

## Database table structure
django_migrations and django_sessions are tables that come with Django to ensure database connection. pro_userprofile and auth_user store user information and user categories. pro_job and pro_action store job and action information respectively. Pro_phase, Pro_category, Pro_comment and Pro_templateaction respectively store the phase, category, comment and template information of the action, which facilitates the back-end to extract relevant information from the database. Finally, pro_jobmanager, pro_jobclient and pro_actionmember are used to store the information of the person in charge of a project by multiple people.
