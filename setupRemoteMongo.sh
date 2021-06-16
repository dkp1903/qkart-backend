# CRIO_SOLUTION_START_MODULE_DEPLOYMENT
# CRIO_SOLUTION_END_MODULE_DEPLOYMENT
mongoimport --uri <add-url-connection-string-here> --drop --collection users --file data/export_qkart_users.json
mongoimport --uri <add-url-connection-string-here> --drop --collection products --file data/export_qkart_products.json