#!/bin/bash
# MongoDB Atlas Setup Script

echo "===== MongoDB Atlas Setup Script ====="
echo "This script will help you set up your MongoDB Atlas connection."
echo ""

# Check if .env file exists
if [ -f .env ]; then
  echo "Found existing .env file."
  read -p "Do you want to back it up? (y/n): " backup
  if [ "$backup" = "y" ]; then
    cp .env .env.backup.$(date +%Y%m%d%H%M%S)
    echo "Backup created."
  fi
else
  echo "No existing .env file found. Will create a new one."
fi

# Get MongoDB Atlas connection details
echo ""
echo "Please enter your MongoDB Atlas connection details:"
read -p "Username: " username
read -sp "Password: " password
echo ""
read -p "Cluster URL (e.g. cluster0.xxxxx.mongodb.net): " cluster
read -p "Database name (e.g. memorial): " dbname

# Create connection string
connection_string="mongodb+srv://$username:$password@$cluster/$dbname?retryWrites=true&w=majority"

# Create or update .env file
if [ -f .env ]; then
  # Update existing MONGO_URI
  if grep -q "MONGO_URI=" .env; then
    sed -i '' "s|MONGO_URI=.*|MONGO_URI=$connection_string|g" .env
  else
    echo "MONGO_URI=$connection_string" >> .env
  fi
else
  # Create new .env file
  cat > .env << EOF
# MongoDB Atlas connection string
MONGO_URI=$connection_string

# Other required environment variables
PORT=5001
JWT_SECRET=your_very_long_and_secure_secret_key_at_least_32_chars
EOF
fi

echo ""
echo "MongoDB Atlas connection string added to .env file."
echo ""
echo "To test the connection, run:"
echo "node -e \"require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('Connected successfully to MongoDB Atlas')).catch(err => console.error('Connection error', err)).finally(() => process.exit())\""
echo ""
echo "===== Setup Complete =====" 