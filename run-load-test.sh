#!/bin/bash

# Domus Agent Load Testing Script
# This script runs a load test with 20 concurrent requests per second for 20 seconds

echo "🚀 Starting Domus Agent Load Test"
echo "📊 Configuration: 20 requests/second for 20 seconds"
echo "🔄 Using query list cycling for variety"
echo ""

# Make sure the server is running first
echo "⚠️  Make sure your domus-agent server is running on localhost:8082"
echo "   You can start it with: npm run dev"
echo ""

# Run the test
node src/__test__/multi.test.js

echo ""
echo "✅ Load test completed!"
echo "📄 Results saved to: src/__test__/load_test_results.json"