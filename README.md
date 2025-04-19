# Enhanced ATR Optimizer Chrome Extension

**🚀 Supercharge Your Trading with Automated Strategy Optimization**

Say goodbye to tedious manual parameter tweaking! The **Enhanced ATR Optimizer** Chrome extension revolutionizes trading strategy optimization by automating the testing of hundreds of parameter combinations on TradingView. Designed for traders who want data-driven results without the hassle, this tool optimizes moving averages, Keltner Channels, and ATR-based stop loss/take profit levels—all while running efficiently in the background with a sleek, customizable popup interface.

Built with precision and power, this extension saves hours of manual work, uncovers high-performing strategies, and exports detailed results for analysis. Whether you’re a day trader or a long-term strategist, the Enhanced ATR Optimizer is your key to unlocking trading success.

---

## 🌟 Key Features

- **Automated Testing at Scale**: Test a vast array of moving average, Keltner Channel, and ATR combinations to find the best-performing strategies—hands-free.
- **Background Execution**: Runs optimization silently in the background, keeping your workflow uninterrupted.
- **Customizable via Popup**: Fine-tune ranges, thresholds, and MA types (SMA/EMA) through an intuitive settings popup.
- **Seamless TradingView Integration**: Interacts directly with TradingView’s Strategy Tester, pulling real-time metrics like profit, drawdown, and profit factor.
- **Progress Persistence**: Autosaves intermediate results every 30 seconds to `localStorage`, ensuring no data is lost during long test runs.
- **Exportable Results**: Downloads comprehensive test outcomes as a JSON file, complete with approved strategies and summary stats.
- **One-Click Activation**: Launch the process with a stylish "ATR" button added to TradingView’s interface.

## 🔧 Configuration Options

| Setting                     | Description                                       | Default                     |
| --------------------------- | ------------------------------------------------- | --------------------------- |
| **MA Type**                 | Choose between **SMA** or **EMA**                 | `SMA`                       |
| **Fast/Slow MA Ranges**     | Comma-separated window sizes for your MAs         | `5,10,15,20,25,30 / 20–100` |
| **KC Length Range**         | Keltner Channel lengths for volatility filtering  | `4,5,6,7`                   |
| **Min Trades**              | Minimum trades to consider a valid strategy       | `40`                        |
| **Max Drawdown (%)**        | Maximum drawdown threshold                        | `20`                        |
| **Min Profit Factor**       | Minimum profit factor to retain a strategy        | `1.5`                       |
| **Top Strategies Count**    | How many top strategies to take into ATR tests    | `3`                         |
| **ATR Drawdown Threshold**  | Max drawdown (%) for ATR-based tests              | `20`                        |
| **ATR SL / TP Multipliers** | Comma-separated ATR multipliers for stop-loss/TPs | `1.5,2,3,4 / 2,3,4`         |


## 📸 Screenshots

![image](https://github.com/user-attachments/assets/86ef377b-2bdf-48b0-afd8-c77465229984)

---

## 🛠️ How It Works

1. **Set Your Preferences**: Open the popup to configure moving average ranges, Keltner Channel lengths, ATR values, and performance thresholds.
2. **Launch Optimization**: Click the "ATR" button on TradingView to kick off the process—or let it run automatically in the background.
3. **Automated Magic**: The extension:
   - Opens the Strategy Tester and settings panel.
   - Iterates through parameter combinations.
   - Simulates user inputs to adjust values.
   - Triggers backtests and collects performance metrics.
4. **Get Results**: Once complete, a bell rings, and a JSON file is generated with the top strategies, ready for your review.

---

## 💡 Why This Project Shines

This isn’t just a tool—it’s a showcase of technical ingenuity solving a real-world problem:

- **Trader Pain Point Solved**: Manual strategy testing is slow and error-prone. This extension automates it, delivering precision and speed.
- **Technical Mastery**: Combines advanced DOM manipulation, event simulation, and asynchronous programming to control TradingView’s interface flawlessly.
- **User-Centric Design**: Offers customizable settings and persistent progress, making it both powerful and approachable.
- **Reliability Built-In**: Autosaving and robust error handling ensure a smooth experience, even during extensive test runs.

---

## 🧑‍💻 Technical Highlights

This project demonstrates deep expertise in:

- **JavaScript (ES6+)**: Uses `async/await`, promises, and modern event handling for efficient execution.
- **Chrome Extension Development**: Leverages `chrome.storage.sync` for settings, `chrome.tabs` for background control, and `chrome.scripting` for content injection.
- **DOM Manipulation & Event Simulation**: Mimics user interactions with TradingView by setting input values and dispatching custom events.
- **Asynchronous Automation**: Manages timing with `sleep` functions and polling loops to wait for UI updates.
- **Data Management**: Persists results with `localStorage` and exports them as structured JSON files.
- **Modular Code**: Organized into clear, reusable functions for maintainability and scalability.

---

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/enhanced-atr-optimizer.git
   cd enhanced-atr-optimizer
   ```
2. **Load into Chrome**:
   - Go to `chrome://extensions/`.  
   - Enable **Developer mode**.  
   - Click **Load unpacked** and select this project folder.
3. **Prepare TradingView**:
   - Open TradingView and load a strategy that uses moving averages and Keltner Channels.
4. **Configure & Run**:
   - Click the extension icon → adjust settings → save.  
   - On the chart, click the green **ATR** button to start optimization.
5. **Review Results**:
   - Listen for the completion bell and download the JSON results file.

---

## 📈 Sample Output

```json
{
  "validResults": [
    {
      "kcLength": 5,
      "fastMA": 15,
      "slowMA": 50,
      "maType": "EMA",
      "atrStopLoss": 2,
      "atrTakeProfit": 3,
      "profit": 12500,
      "drawdown": 12.5,
      "totalTrades": 45,
      "profitFactor": 2.1
    }
  ],
  "summary": {
    "totalATRTests": 48,
    "approvedATR": 5,
    "timeouts": 2,
    "exclusions": 41,
    "testingDurationMinutes": "15.32"
  }
}
```

---

## 🔮 Future Enhancements

- **Broader Indicator Support**: Add optimization for RSI, MACD, or custom indicators.  
- **Advanced Filters**: Multi-metric sorting or user‑defined ranking.  
- **Cloud Integration**: Sync results to a remote service for backup and analysis.  
- **Scheduled Runs**: Automate tests on a schedule via the background script.

---

## 📄 License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.


