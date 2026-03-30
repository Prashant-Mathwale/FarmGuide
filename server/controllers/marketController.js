const axios = require('axios');
const MarketData = require('../models/MarketData');

const getMarketPrices = async (req, res) => {
    const { cropName, stateName, districtName } = req.query;

    const apiUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    const apiKey = process.env.DATA_GOV_API_KEY;

    try {
        // 1. Check MongoDB cache (last 24 hours)
        const cacheWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const prices = await MarketData.find({
            ...(cropName    && { cropName:     new RegExp(cropName, 'i') }),
            ...(stateName   && { stateName:    new RegExp(stateName, 'i') }),
            ...(districtName && { districtName: new RegExp(districtName, 'i') }),
            createdAt: { $gte: cacheWindow }
        });

        // 2. Return cache if found
        if (prices.length > 0) {
            return res.json({ success: true, source: 'cache', data: prices });
        }

        // 3. Fetch from data.gov.in API
        const toTitleCase = (str) => {
            if (!str) return '';
            return str.trim().toLowerCase().split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        };

        const params = {
            'api-key': apiKey.trim(),
            format: 'json',
            limit: 50,
        };

        if (stateName)    params['filters[state]']     = toTitleCase(stateName);
        if (districtName) params['filters[district]']  = toTitleCase(districtName);
        if (cropName)     params['filters[commodity]'] = toTitleCase(cropName);

        const response = await axios.get(apiUrl, { params });

        if (response.data && response.data.records && response.data.records.length > 0) {
            const parseDate = (dateString) => {
                if (!dateString) return new Date();
                const parts = dateString.split('/');
                return parts.length === 3
                    ? new Date(parts[2], parts[1] - 1, parts[0])
                    : new Date(dateString);
            };

            const newPrices = response.data.records.map(record => ({
                cropName:     record.commodity,
                marketName:   record.market,
                districtName: record.district,
                stateName:    record.state,
                minPrice:     parseInt(record.min_price),
                maxPrice:     parseInt(record.max_price),
                modalPrice:   parseInt(record.modal_price),
                recordedDate: parseDate(record.arrival_date)
            }));

            // Cache to MongoDB (fire and forget)
            MarketData.insertMany(newPrices).catch(() => {});

            return res.json({ success: true, source: 'api', data: newPrices });
        }

        // 4. No results found for the given filter
        return res.json({ success: true, source: 'api', data: [], message: 'No data found for the selected filters. Try a different crop or region.' });

    } catch (error) {
        console.error('Market API Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch market prices.' });
    }
};

const getMarketTrend = async (req, res) => {
    try {
        const crop = req.query.crop || 'wheat';

        // Proxy request to Python ML Service for volatility and SMA calculations
        const pythonApiRes = await axios.post('http://127.0.0.1:8000/price_trend', { crop });

        if (pythonApiRes.data.success) {
            return res.json({ success: true, data: pythonApiRes.data });
        } else {
            throw new Error(pythonApiRes.data.message || 'Failed to fetch trend from ML server');
        }

    } catch (error) {
        console.error('Market Trend API Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch market trend.' });
    }
};

module.exports = { getMarketPrices, getMarketTrend };
