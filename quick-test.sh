#!/bin/bash
# Quick Test Runner for StockScreener API Tests
# This script runs a subset of tests to quickly validate API integration
# without hitting rate limits

echo "========================================="
echo "StockScreener - Quick API Test Runner"
echo "========================================="
echo ""
echo "This script runs a limited subset of tests to avoid API rate limits."
echo "For full test suite, run: npm test"
echo ""

# Run initialization tests (fast, no API calls)
echo "1. Testing service initialization..."
npm test -- --testNamePattern="Service Initialization" --silent

# Run fallback data tests (fast, no API calls)
echo ""
echo "2. Testing fallback data..."
npm test -- --testNamePattern="Fallback Data Tests" --silent

# Run one API test to verify connectivity
echo ""
echo "3. Testing API connectivity with AAPL..."
npm test -- --testNamePattern="should fetch complete data for AAPL" --silent

# Run cache tests (fast, uses cached data)
echo ""
echo "4. Testing cache behavior..."
npm test -- --testNamePattern="should respect cache" --silent

echo ""
echo "========================================="
echo "Quick tests completed!"
echo ""
echo "To run full test suite (30-60 minutes):"
echo "  npm test"
echo ""
echo "To run specific test files:"
echo "  npm test api-service.test.js"
echo "  npm test search-display.test.js"
echo "  npm test edge-cases.test.js"
echo "========================================="
