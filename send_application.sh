#!/bin/bash

# Career Application POST Request for Windborne Systems
# Flight Team Web Developer Position

curl -X POST \
  https://windbornesystems.com/career_applications.json \
  -H "Content-Type: application/json" \
  -d @career_application.json
