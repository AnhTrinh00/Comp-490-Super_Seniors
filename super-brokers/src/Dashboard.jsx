import React from 'react';
import { useState, useEffect, useContext, useRef } from "react";
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { AuthContext } from "./context/AuthContext";
import "./style/Dashboard.css";

function Dashboard() { 
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [stockData, setStockData] = useState(null);
    const [stockPrice, setStockPrice] = useState(null); // State for stock price
    const [newsArticles, setNewsArticles] = useState([]);
    const [searchError, setSearchError] = useState(null);
    const [newsError, setNewsError] = useState(null);
    const { logout } = useContext(AuthContext);
    const searchRef = useRef(null);
    const [mode, setMode] = useState("Buy"); // Active mode: Buy or Sell
    const [sellAmount, setSellAmount] = useState(""); // Sell shares input
    const currentPrice = 50; // Example: Replace with Finnhub API data
    const sharesHeld = 100; // Example: Replace with Finnhub API data
    const totalSale = sellAmount ? (sellAmount * currentPrice).toFixed(2) : "0.00"; // Calculate total sale for Sell Mode
    const [followedStocks, setFollowedStocks] = useState([]);
    const { userId } = useContext(AuthContext);
    const isFollowed = followedStocks.some((stock) => stock.symbol === stockData?.profile?.ticker);
    const [transactionAmount, setTransactionAmount] = useState("");
    const [positions, setPositions] = useState([]);
    const [currentSharesHeld, setCurrentSharesHeld] = useState(0);
    const [virtualBalance, setVirtualBalance] = useState(0);

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
    
    // Fetch default stock
    useEffect(() => {
        handleSearch('AAPL');
    }, []);

    // Fetch followed stocks data for user
    useEffect(() => {
        const fetchFollowedStocks = async () => {
          try {
            if (!userId) {
              console.error("User ID not available");
              return;
            }
      
            const response = await axios.get(`http://localhost:3001/api/follow/followed-stocks/${userId}`);
            if (response.status === 200) {
              setFollowedStocks(response.data);
            }
          } catch (error) {
            console.error("Error fetching followed stocks:", error);
            alert("Failed to fetch followed stocks. Please try again later.");
          }
        };
      
        fetchFollowedStocks();
      }, [userId]);

    // Fetch stock suggestions when the user presses "Enter"
    const handleKeyPress = async (e) => {
        if (e.key === 'Enter') {
            if (!searchTerm) return;
            try {
                const response = await axios.get(`http://localhost:3001/api/stocks/symbol-lookup/${searchTerm}`);
                setSuggestions(response.data.result || []);
                setShowSuggestions(true);
            } catch (err) {
                setSuggestions([]);
                setSearchError('Failed to fetch symbol suggestions. Please try again.');
            }
        }
    };

    // Fetch User's positions
    useEffect(() => {
        const fetchPositions = async () => {
            try {
                if (!userId) {
                    console.error("User ID is not available. Ensure the user is logged in.");
                    return;
                }
    
                const apiUrl = `http://localhost:3001/api/stocks/user/portfolio/${userId}`;
                console.log(`Fetching portfolio from: ${apiUrl}`);
    
                const response = await axios.get(apiUrl);
                if (response.status === 200 && response.data?.portfolio) {
                    const portfolioData = response.data.portfolio;
    
                    // Set user's virtual balance
                    setVirtualBalance(response.data.virtualBalance); // Now this should be properly fetched and set
    
                    // Fetch the real-time price and percent change for each stock
                    const updatedPositions = await Promise.all(portfolioData.map(async (position) => {
                        const stockPriceResponse = await axios.get(`http://localhost:3001/api/stocks/stock-price/${position.stockSymbol}`);
                        if (stockPriceResponse.status === 200) {
                            const { dp } = stockPriceResponse.data; // Get the percent change (dp)
                            return { ...position, changePercent: dp }; // Add percent change to the position data
                        } else {
                            return position; // If fetching fails, just return the original position data
                        }
                    }));
    
                    setPositions(updatedPositions);
                } else {
                    console.error("Unexpected response format or missing portfolio data:", response.data);
                    alert("Unable to fetch portfolio data. Please try again later.");
                }
            } catch (error) {
                console.error("Error fetching user portfolio:", error.message);
            }
        };
    
        if (userId) {
            fetchPositions();
        }
    }, [userId]);
          
    // Fetch stock details, price, and company-specific news when a symbol is selected
    const handleSearch = async (symbol) => {
        if (!symbol) return;
        try {
            const stockResponse = await axios.get(`http://localhost:3001/api/stocks/stock-info/${symbol}`);
            setStockData(stockResponse.data);
    
            const priceResponse = await axios.get(`http://localhost:3001/api/stocks/stock-price/${symbol}`);
            setStockPrice(priceResponse.data);
    
            // Update shares held
            const foundPosition = positions.find((position) => position.stockSymbol === symbol);
            setCurrentSharesHeld(foundPosition ? foundPosition.quantity : 0);
    
            // Fetch news for the company
            const newsResponse = await axios.get(`http://localhost:3001/api/news/company-news/${symbol}`);
            const randomNews = newsResponse.data.sort(() => 0.5 - Math.random()).slice(0, 3);
            setNewsArticles(randomNews);
    
            setSearchError(null);
            setSuggestions([]);
            setSearchTerm('');
            setShowSuggestions(false);
        } catch (err) {
            console.error("Error fetching stock data:", err);
            setSearchError('Failed to fetch stock information or candlestick data. Please try again.');
            setStockData(null);
            setStockPrice(null);
            setNewsArticles([]);
        }
    };
    
    // Function to handle buying and selling
    const handleTransaction = async () => {
        if (!userId) {
            alert("You need to log in to perform this action.");
            return;
        }
    
        const quantity = parseFloat(mode === "Buy" ? transactionAmount : sellAmount);
        if (!quantity || quantity <= 0) {
            alert("Please enter a valid amount of shares.");
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:3001/api/trades/trade', {
                userId,
                stockSymbol: stockData?.profile?.ticker,
                transactionType: mode.toLowerCase(),
                quantity,
                transactionValue: stockPrice.c, // Use the current price per share
            });
    
            if (response.status === 200) {
                alert(`${mode} successful!`);
                setTransactionAmount("");
                setSellAmount("");
    
                // Update the user's portfolio and virtual balance with the response data
                if (response.data && response.data.portfolio && response.data.virtualBalance !== undefined) {
                    setPositions(response.data.portfolio); // Set updated portfolio
                    setVirtualBalance(response.data.virtualBalance); // Set updated virtual balance
    
                    // Update shares held for the current stock
                    const foundPosition = response.data.portfolio.find(
                        (position) => position.stockSymbol === stockData?.profile?.ticker
                    );
                    setCurrentSharesHeld(foundPosition ? foundPosition.quantity : 0);
                } else {
                    console.error("Portfolio or virtual balance data is missing from response.");
                    setCurrentSharesHeld(0);
                }
            }
        } catch (error) {
            console.error(`Error during ${mode.toLowerCase()} transaction:`, error);
            alert(`Failed to complete ${mode.toLowerCase()} transaction. Please try again.`);
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

    // Navigate to a stock’s details when clicked
    const handleStockClick = async (symbol) => {
        if (!symbol) return;
        setSearchTerm(symbol);
        await handleSearch(symbol); // Pass the symbol to the handleSearch function
    };

    // Cleanup interval on component unmount
    useEffect(() => {
        return () => stopLiveUpdates(); // Clear interval when component unmounts
    }, []);
    const [showDropdown, setShowDropdown] = useState(false);
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    }; 

    // Follow & Unfollow button function
    const handleFollowUnfollow = async () => {
        if (!userId) {
            console.error("User ID not available");
            alert("You need to log in to follow/unfollow stocks.");
            return;
        }

        try {
            if (isFollowed) {
                // Unfollow stock
                const response = await axios.delete(`http://localhost:3001/api/follow/unfollow/${userId}`, {
                    data: { symbol: stockData.profile.ticker },
                });
                if (response.status === 200) {
                    setFollowedStocks(prev => prev.filter(stock => stock.symbol !== stockData.profile.ticker));
                    alert("Stock unfollowed successfully!");
                }
            } else {
                // Follow stock
                const response = await axios.post(`http://localhost:3001/api/follow/follow`, {
                    _id: userId,
                    stockSymbol: stockData.profile.ticker,
                });
                if (response.status === 200) {
                    setFollowedStocks(prev => [...prev, { symbol: stockData.profile.ticker, price: stockPrice.c }]);
                    alert("Stock added to followed list!");
                }
            }
        } catch (error) {
            console.error("Error toggling follow/unfollow:", error);
            alert("Failed to toggle follow/unfollow. Please try again later.");
        }
    };

    return (
        <div className="dashboard-main-wrapper">
            {/* Top Navigation Bar */}
            <div className="dashboard-hot-bar">
                <div className="dashboard-logo-img">
                    <img src="/images/Sb-logo.png" alt="Logo" />
                </div>
                {/* Navigation Links */}
                <div className="dashboard-nav-links">
                    <NavLink to="/Dashboard" className={({ isActive }) => isActive ? "dashboard-tab-link active" : "dashboard-tab-link"}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/Portfolio" className={({ isActive }) => isActive ? "dashboard-tab-link active" : "dashboard-tab-link"}>
                        Portfolio
                    </NavLink>
                    <NavLink to="/About" className={({ isActive }) => isActive ? "dashboard-tab-link active" : "dashboard-tab-link"}>
                        About
                    </NavLink>
                    <NavLink to="/Help" className={({ isActive }) => isActive ? "dashboard-tab-link active" : "dashboard-tab-link"}>
                        Help
                    </NavLink>
                </div>
                <button className="dashboard-user" onClick={toggleDropdown}>
                    <img src="/images/user-icon.png" className="dashboard-user-icon" alt="User Icon" />
                </button>
                {showDropdown && (
                    <div className="dashboard-dropdown-menu">
                        <NavLink to="/dashboard" className="dashboard-dropdown-item">Dashboard</NavLink>
                        <button onClick={logout} className="dashboard-dropdown-item">Log Out</button>
                    </div>
                )}
            </div>

            <div className="dashboard-body-content">
                {/* Positions-Following Sidebar */}
                <aside className="dashboard-sidebar-content">
                    <h3>Positions</h3>
                    <div className="dashboard-left-bubble">
                    {positions && positions.length > 0 ? (
                        positions.map((position) => (
                            <div
                                key={position.stockSymbol}
                                className="followed-stock-item"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleStockClick(position.stockSymbol)}
                            >
                                <span>{position.stockSymbol}   </span>
                                <span>
                                    {position.changePercent !== undefined
                                        ? `${position.changePercent > 0 ? '+' : ''}${position.changePercent.toFixed(2)}%`
                                        : 'N/A'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p>No positions to display</p>
                    )}
                    </div>
                    <h3>Following</h3>
                    <div className="dashboard-left-bubble">
                        {followedStocks && followedStocks.length > 0 ? (
                            followedStocks.map((stock) => (
                                <div
                                    key={stock.symbol}
                                    className="followed-stock-item"
                                    onClick={() => handleStockClick(stock.symbol)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span>{stock.symbol} </span> {/* Space added here */}
                                    <span>${stock.price.toFixed(2)}</span>
                                </div>
                            ))
                        ) : (
                            <p>No followed stocks to display</p>
                        )}
                    </div>
                </aside>

                <section className="dashboard-main-content">

                    <section className="dashboard-main-left">
                        <section className="dashboard-sub-top" ref={searchRef}>
                            <div className="dashboard-search-bar-container">
                                <input
                                    type="text"
                                    className="dashboard-search-bar"
                                    placeholder="Search for a stock..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleKeyPress} // Trigger on "Enter" key press
                                />
                                {suggestions.length > 0 && (
                                    <ul className="dashboard-search-dropdown">
                                        {suggestions.map((item, index) => (
                                            <li key={index} onClick={() => handleSearch(item.symbol)}>
                                                <strong>{item.displaySymbol}</strong> - {item.description}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>
                        <section className="dashboard-sub-left">
                            <div className="dashboard-stock-info">
                                {stockData && stockPrice && (
                                    <div className="dashboard-stock-info-interior">
                                        <div className="dashboard-stock-name">
                                            {stockData.profile.ticker}
                                            <span
                                                className={`stock-price ${
                                                    stockPrice.d > 0 ? 'positive' : 'negative'
                                                }`}
                                            >
                                                ${stockPrice.c} ({stockPrice.d > 0 ? '+' : ''}{stockPrice.dp}%)
                                            </span>
                                        </div>
                                        <button onClick={handleFollowUnfollow}>
                                            {isFollowed ? 'Unfollow' : 'Follow'}
                                        </button>

                                        {/*
                                        <div className="dashboard-row-content">
                                            {candlestickData && <CandlestickChart data={candlestickData} />}
                                        </div>
                                        */}

                                        <div className="dashboard-stock-stats">
                                        <table>
                                                <tr>
                                                    <td>High Price (Day): ${stockPrice.h}</td>
                                                    <td>Market Capitalization: ${stockData.profile.marketCapitalization}</td>
                                                    <td>52-Week High: ${stockData.financials['52WeekHigh']}</td>
                                                </tr>
                                                <tr>
                                                    <td>Low Price (Day): ${stockPrice.l}</td>
                                                    <td>Industry: {stockData.profile.finnhubIndustry}</td>
                                                    <td>52-Week Low: ${stockData.financials['52WeekLow']}</td>
                                                </tr>
                                                <tr>
                                                    <td>Open Price: ${stockPrice.o}</td>
                                                    <td>10-Day Average Volume: {stockData.financials['10DayAverageTradingVolume']}</td>
                                                    <td>52-Week Low Date: {stockData.financials['52WeekLowDate']}</td>
                                                </tr>
                                                <tr>
                                                    <td>Previous Close: ${stockPrice.pc}</td>
                                                    <td>Beta: {stockData.financials['beta']}</td>
                                                    <td>52-Week Return: {stockData.financials['52WeekPriceReturnDaily']}%</td>
                                                </tr>
                                            </table>
                                        </div>

                                        <div className="dashboard-stock-summary">
                                            <h3>COMPANY / Stock Summary will go here</h3> 
                                            <p>Lorem ipsum odor amet, consectetuer adipiscing elit. Consectetur nulla sodales mattis, ridiculus luctus vehicula dolor. Pretium litora parturient mi vitae 
                                                sed consequat sagittis; at nullam. Eros eros vehicula lorem dui id viverra hendrerit. Dolor convallis euismod justo; netus ligula imperdiet rutrum maximus.</p>
                                            <p>Lorem ipsum odor amet, consectetuer adipiscing elit. Consectetur nulla sodales mattis, ridiculus luctus vehicula dolor. Pretium litora parturient mi vitae 
                                                sed consequat sagittis; at nullam. Eros eros vehicula lorem dui id viverra hendrerit. Dolor convallis euismod justo; netus ligula imperdiet rutrum maximus.</p>
                                        </div>
                                    </div>
                                )}
                                {searchError && <p className="error">{searchError}</p>}
                            </div>
                        </section>
                        
                        <section className="dashboard-sub-right">
                        <div className="dashboard-buy-sell-panel">
                            <div>
                                {/* Toggle Buttons */}
                                <button
                                    className={`dashboard-tab-button ${mode === "Buy" ? "active" : ""}`}
                                    onClick={() => setMode("Buy")}
                                >
                                    Buy
                                </button>
                                <button
                                    className={`dashboard-tab-button ${mode === "Sell" ? "active" : ""}`}
                                    onClick={() => setMode("Sell")}
                                >
                                    Sell
                                </button>
                            </div>

                            {/* Display the user's current virtual balance */}
                            <p>Buying Power: ${virtualBalance != null ? virtualBalance.toFixed(2) : 'Loading...'}</p>

                            {/* Sell Mode Panel */}
                            {mode === "Sell" && (
                                <div>
                                    <p>Curr. Price/Share: ${stockPrice?.c ?? 'N/A'}</p>
                                    <p>Shares Held: {currentSharesHeld} Shares</p>
                                    <label>
                                        Sell Amount (Shares):
                                        <input
                                            type="number"
                                            value={sellAmount}
                                            onChange={(e) => setSellAmount(e.target.value)}
                                            className="dashboard-search-bar"
                                        />
                                    </label>
                                    <p>Total Sale: ${sellAmount ? (sellAmount * stockPrice.c).toFixed(2) : "0.00"}</p>
                                    <button className="dashboard-purchase-button" onClick={handleTransaction}>Sell</button>
                                </div>
                            )}

                            {/* Buy Mode Panel */}
                            {mode === "Buy" && (
                                <div>
                                    <p>Curr. Price/Share: ${stockPrice?.c ?? 'N/A'}</p>
                                    <label>
                                        Buy Amount (Shares):
                                        <input
                                            type="number"
                                            value={transactionAmount}
                                            onChange={(e) => setTransactionAmount(e.target.value)}
                                            className="dashboard-search-bar" 
                                        />
                                    </label>
                                    <p>Total Purchase: ${transactionAmount && stockPrice?.c != null ? (transactionAmount * stockPrice.c).toFixed(2) : "0.00"}</p>
                                    <button className="dashboard-purchase-button" onClick={handleTransaction}>Buy</button>
                                </div>
                            )}
                        </div>
                        </section>
                    </section>

                    <section className="dashboard-main-right">
                    <div className="dashboard-news-bubble">
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
                        <div className="dashboard-news-bubble">
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
                        <div className="dashboard-news-bubble">
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
                    </section>
                </section>
            </div>

            {/* Main content area with blurred background */}
        </div>
    );
}

export default Dashboard;

