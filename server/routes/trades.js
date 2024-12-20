const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Trade = require('../models/trade');

// Trade route
router.post('/trade', async (req, res) => {
  const { userId, stockSymbol, transactionType, quantity, transactionValue } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Calculate total value of transaction
    const totalValue = quantity * transactionValue;

    // Process buy or sell
    if (transactionType === 'buy') {
      if (user.virtualBalance >= totalValue) {
        // Subtract funds from virtual balance
        user.virtualBalance -= totalValue;

        // Update portfolio
        const stockIndex = user.portfolio.findIndex((stock) => stock.stockSymbol === stockSymbol);
        if (stockIndex >= 0) {
          // Update existing stock in portfolio
          const existingStock = user.portfolio[stockIndex];
          const newTotalQuantity = existingStock.quantity + quantity;
          const newAveragePrice = 
            ((existingStock.quantity * existingStock.averagePrice) + totalValue) / newTotalQuantity;

          user.portfolio[stockIndex].quantity = newTotalQuantity;
          user.portfolio[stockIndex].averagePrice = newAveragePrice;
        } else {
          // Add new stock to portfolio
          user.portfolio.push({ stockSymbol, quantity, averagePrice: transactionValue });
        }
      } else {
        return res.status(400).json({ msg: 'Insufficient virtual balance to complete the transaction' });
      }
    } else if (transactionType === 'sell') {
      // Find the stock in portfolio
      const stockIndex = user.portfolio.findIndex((stock) => stock.stockSymbol === stockSymbol);
      if (stockIndex >= 0) {
        const existingStock = user.portfolio[stockIndex];

        // Ensure user has enough shares to sell
        if (existingStock.quantity >= quantity) {
          // Update portfolio and add funds to virtual balance
          existingStock.quantity -= quantity;
          user.virtualBalance += totalValue;

          // Remove stock from portfolio if quantity == 0
          if (existingStock.quantity === 0) {
            user.portfolio.splice(stockIndex, 1);
          }
        } else {
          return res.status(400).json({ msg: 'Not enough shares to sell' });
        }
      } else {
        return res.status(400).json({ msg: 'Stock not found in portfolio' });
      }
    } else {
      return res.status(400).json({ msg: 'Invalid transaction type' });
    }

    // Create new trade document with detailed information
    const newTrade = new Trade({
      userId,
      stockSymbol,
      transactionType,
      quantity,
      transactionValue,
      totalValue,
    });

    // Save the trade and update user data
    await newTrade.save();
    user.tradeHistory.push(newTrade._id);
    await user.save();

    // Return updated portfolio and virtual balance along with trade details
    res.json({ 
      msg: 'Trade successful', 
      trade: newTrade, 
      virtualBalance: user.virtualBalance, 
      portfolio: user.portfolio 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
      const trades = await Trade.find({ userId }).sort({ date: -1 });
      res.status(200).json({ trades });
  } catch (error) {
      console.error('Error fetching trade history:', error);
      res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
