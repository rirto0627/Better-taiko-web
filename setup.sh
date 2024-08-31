#!/bin/bash

# Run database migrations
docker-compose exec web python manage.py db upgrade

# Import song categories
docker-compose exec -T mongo mongoimport --db taiko --collection categories --jsonArray < tools/categories.json

# Create an admin user (replace 'admin' and 'password' with desired credentials)
docker-compose exec mongo mongo taiko --eval 'db.users.updateOne({username:"admin"},{$set:{username:"admin",password:"password",user_level:100}},{upsert:true})'

echo "Setup complete. You can now access taiko-web at http://localhost"
echo "Admin username: admin"
echo "Admin password: password"
echo "Please change the admin password after first login."