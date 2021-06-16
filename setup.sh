# CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
# CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS
mongo qkart --eval "db.dropDatabase()" 
mongoimport -d qkart -c users --file data/export_qkart_users.json
mongoimport -d qkart -c products --file data/export_qkart_products.json