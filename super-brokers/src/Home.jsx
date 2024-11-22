import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style/Home.css';
import { Link } from 'react-router-dom';
import CandlestickChart from './CandlestickChart';

function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [stockData, setStockData] = useState(null);
    const [stockPrice, setStockPrice] = useState(null); // State for stock price
    const [newsArticles, setNewsArticles] = useState([]);
    const [searchError, setSearchError] = useState(null);
    const [newsError, setNewsError] = useState(null);
    const [candlestickData, setCandlestickData] = useState(null); // State for candlestick data

    // Fetch general market news on component mount
    useEffect(() => {
        const fetchMarketNews = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/news/market-news');
                setNewsArticles(response.data.slice(0, 3)); // Fetch 3 articles for general market news
                setNewsError(null);
            } catch (err) {
                console.error('Error fetching market news:', err.message);
                setNewsError('Failed to fetch market news. Please try again later.');
            }
        };

        fetchMarketNews();
    }, []);

    useEffect(() => {
        const fetchCandlestickData = async () => {
            if (!stockData || !stockData.profile || !stockData.profile.ticker) return;
    
            try {
                const response = await fetch(`/api/alpha-vantage/candlestick-data?symbol=${stockData.profile.ticker}`);
                if (!response.ok) throw new Error("Failed to fetch candlestick data");
                const data = await response.json();
                setCandlestickData(data);
            } catch (error) {
                console.error("Error fetching candlestick data:", error);
                setCandlestickData(null); // Reset data to avoid rendering issues
            }
        };
    
        fetchCandlestickData();
    }, [stockData]);

    // Fetch stock suggestions when the user presses "Enter"
    const handleKeyPress = async (e) => {
        if (e.key === 'Enter') {
            if (!searchTerm) return;
            try {
                const response = await axios.get(`http://localhost:3001/api/stocks/symbol-lookup/${searchTerm}`);
                setSuggestions(response.data.result || []);
                setSearchError(null);
            } catch (err) {
                setSuggestions([]);
                setSearchError('Failed to fetch symbol suggestions. Please try again.');
            }
        }
    };

    // Fetch stock details, price, and company-specific news when a symbol is selected
    const handleSearch = async (symbol) => {
        if (!symbol) return;
        try {
            // Fetch stock details
            const stockResponse = await axios.get(`http://localhost:3001/api/stocks/stock-info/${symbol}`);
            setStockData(stockResponse.data);
    
            // Fetch stock price
            const priceResponse = await axios.get(`http://localhost:3001/api/stocks/stock-price/${symbol}`);
            setStockPrice(priceResponse.data);
    
            // Fetch candlestick data
            const candlestickResponse = await axios.get(`http://localhost:3001/api/stocks/candlestick/${symbol}`);
            setCandlestickData(candlestickResponse.data); // Update candlestick data
    
            // Fetch related company news
            const newsResponse = await axios.get(`http://localhost:3001/api/news/company-news/${symbol}`);
            const randomNews = newsResponse.data.sort(() => 0.5 - Math.random()).slice(0, 3);
            setNewsArticles(randomNews);
    
            setSearchError(null);
            setSuggestions([]);
            setSearchTerm('');
        } catch (err) {
            setSearchError('Failed to fetch stock information or candlestick data. Please try again.');
            setStockData(null);
            setStockPrice(null);
            setCandlestickData(null);
            setNewsArticles([]);
        }
    };

    // Function to start live stock price updates
    const startLiveUpdates = (symbol) => {
        // Clear any existing intervals to avoid duplicate calls
        stopLiveUpdates();

        const interval = setInterval(async () => {
            try {
                const priceResponse = await axios.get(`http://localhost:3001/api/stocks/stock-price/${symbol}`);
                setStockPrice(priceResponse.data); // Update stock price in state
            } catch (err) {
                console.error('Error fetching live stock price:', err.message);
            }
        }, 5000); // Fetch stock price every 5 seconds

        // Store interval ID in state for cleanup
        setLiveUpdateInterval(interval);
    };

    // Cleanup function to stop live updates
    const stopLiveUpdates = () => {
        if (liveUpdateInterval) {
            clearInterval(liveUpdateInterval);
            setLiveUpdateInterval(null);
        }
    };

    // Store the interval ID to clear it when component unmounts or symbol changes
    const [liveUpdateInterval, setLiveUpdateInterval] = useState(null);

    // Cleanup interval on component unmount
    useEffect(() => {
        return () => stopLiveUpdates(); // Clear interval when component unmounts
    }, []);

    return (
        <div className="home-main-wrapper">
            <div className="home-hot-bar">
                <div className="home-row">
                    <div className="home-logo-img">
                        <img src="/images/Sb-logo.png" alt="Logo" />
                    </div>
                    <div className="home-nav-col">
                        <Link to="/Dashboard" className="home-tab-link">DASHBOARD</Link>
                    </div>
                    <div className="home-nav-col">
                        <Link to="/About" className="home-tab-link">ABOUT</Link>
                    </div>
                    <div className="home-nav-col">
                        <Link to="/Help" className="home-tab-link">HELP</Link>
                    </div>
                </div>
            </div>

            <div className="home-main-content">
                <div className="home-content-left">
                    <div className="home-search-bar">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search for a stock..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyPress} // Trigger on "Enter" key press
                        />
                    </div>
                    {suggestions.length > 0 && (
                        <ul className="dropdown">
                            {suggestions.map((item, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSearch(item.symbol)}
                                >
                                    <strong>{item.displaySymbol}</strong> - {item.description}
                                </li>
                            ))}
                        </ul>
                    )}
                    {stockData && stockPrice && (
                        <div>
                            <div className="home-stock-name">
                                {stockData.profile.ticker}
                                <span
                                    className={`stock-price ${
                                        stockPrice.d > 0 ? 'positive' : 'negative'
                                    }`}
                                >
                                    ${stockPrice.c} ({stockPrice.d > 0 ? '+' : ''}{stockPrice.dp}%)
                                </span>
                            </div>
                            {/* Candlestick Graph */}
                            <div className="home-row-content">
                                {candlestickData && <CandlestickChart data={candlestickData} />}
                            </div>
                            {/* Stock Metrics */}
                            <div className="home-row-content">
                                <h2>{stockData.profile.name}</h2>
                                <p>High Price (Day): ${stockPrice.h}</p>
                                <p>Low Price (Day): ${stockPrice.l}</p>
                                <p>Open Price: ${stockPrice.o}</p>
                                <p>Previous Close: ${stockPrice.pc}</p>
                                <p>Market Capitalization: ${stockData.profile.marketCapitalization}</p>
                                <p>Industry: {stockData.profile.finnhubIndustry}</p>
                                <p>10-Day Average Volume: {stockData.financials['10DayAverageTradingVolume']}</p>
                                <p>52-Week High: ${stockData.financials['52WeekHigh']}</p>
                                <p>52-Week Low: ${stockData.financials['52WeekLow']}</p>
                                <p>52-Week Low Date: {stockData.financials['52WeekLowDate']}</p>
                                <p>52-Week Return: {stockData.financials['52WeekPriceReturnDaily']}%</p>
                                <p>Beta: {stockData.financials['beta']}</p>
                            </div>
                        </div>
                    )}
                    {searchError && <p className="error">{searchError}</p>}
                </div>
                <div className="home-content-right">
                    {/* Bubble 1 */}
                    <div className="home-bubble">
                        {newsArticles[0] ? (
                            <div>
                                <h3>
                                    <a href={newsArticles[0].url} target="_blank" rel="noopener noreferrer">
                                        {newsArticles[0].headline}
                                    </a>
                                </h3>
                                <p>{newsArticles[0].summary}</p>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>
                    {/* Bubble 2 */}
                    <div className="home-bubble">
                        {newsArticles[1] ? (
                            <div>
                                <h3>
                                    <a href={newsArticles[1].url} target="_blank" rel="noopener noreferrer">
                                        {newsArticles[1].headline}
                                    </a>
                                </h3>
                                <p>{newsArticles[1].summary}</p>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>
                    {/* Bubble 3 */}
                    <div className="home-bubble">
                        {newsArticles[2] ? (
                            <div>
                                <h3>
                                    <a href={newsArticles[2].url} target="_blank" rel="noopener noreferrer">
                                        {newsArticles[2].headline}
                                    </a>
                                </h3>
                                <p>{newsArticles[2].summary}</p>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>
                </div>
            </div>
            {newsError && <p className="error">{newsError}</p>}
        </div>
    );
}

export default Home;
