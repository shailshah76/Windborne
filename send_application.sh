#!/bin/bash

# Career Application POST Request for Windborne Systems
# Flight Team Web Developer Position

curl -X POST \
  https://windbornesystems.com/career_applications.json \
  -H "Content-Type: application/json" \
  -d @career_application.json


### RESPONSE
### {"success":true,"message":"Your application has been submitted successfully","career_application":{"id":"76256d7f-0f0a-4822-bfa5-be52c9227d45","name":"Shail Shah","email":"shail.shah822@gmail.com","role":"Flight Team Web Developer","submission_url":"https://github.com/shailshah76/Windborne","resume_url":"https://drive.google.com/file/d/1jrASf5mm0rzj6UQZ6VFbm3g7dUEK3FIA/view?usp=sharing","notes":"Specialized in building interactive data visualization and user-centric systems. Developed responsive dashboards with React and Next.js to simplify complex data workflows and improve engagement. Designed real-time monitoring solutions that enhanced decision-making by providing intuitive visual insights for large datasets. Experienced in creating scalable and responsive interfaces, optimizing performance for thousands of concurrent users, and ensuring smooth user experiences across platforms. Strong focus on collaboration, usability, and transforming raw data into actionable insights through clean design and effective visualization.","created_at":"2025-08-25T21:12:41.813Z","updated_at":"2025-08-25T21:12:41.813Z","archived":false,"reviewer_notes":null,"portfolio_url":"https://github.com/shailshah76/Junoa"}}%      
###