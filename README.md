```plaintext
atr-optimizer-chrome-extension/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

# 🚀 ATR Optimizer Chrome Extension

&#x20;&#x20;

**Transform TradingView into an automated strategy lab** 🔬💹

> **ATR Optimizer** lets you **mass-test** moving-average & Keltner Channel parameters, then layer in **ATR-based** stop‑loss and take‑profit rules—all with a single click.

---

## 🎯 Key Highlights

- **Full Automation**: One-click optimization on any TradingView chart. No manual inputs once configured.
- **Parameter Sweeps**: Roll through custom Fast/Slow MA and KC length ranges.
- **Dynamic Risk Control**: Apply ATR-driven stop‑loss & take‑profit multipliers to top strategies.
- **Smart Filtering**: Enforce minimum trades, maximum drawdown, and profit‑factor thresholds.
- **Top-N Selection**: Automatically rank and pick your best strategies.
- **Persistence & Export**: Auto-save results, export as JSON, and share your findings.

---

## 📸 Screenshots



---

## 🛠️ Installation & Quickstart

1. **Clone the repo**

   ```bash
   git clone https://github.com/yourusername/atr-optimizer-chrome-extension.git
   cd atr-optimizer-chrome-extension
   ```

2. **Add your icons**

   - Drop `icon16.png`, `icon48.png`, `icon128.png` into the `icons/` folder.

3. **Load as a Chrome Extension**

   - Open `chrome://extensions/` in your browser.
   - Enable **Developer mode**.
   - Click **Load unpacked**, select this project directory.

4. **Configure & Run**

   - Click the extension icon → set your parameter ranges in the pop‑up.
   - Go to any TradingView chart → click the floating **ATR** button.
   - Watch as the console logs each test and final results export automatically.

---

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

---

## ⚡ Example Workflow

```bash
# 1. Launch and configure:
> Click the green ⚙️ icon → enter your custom ranges → Save.

# 2. Optimize:
> Open a TradingView chart → click the floating ATR button → let it run.

# 3. Analyze:
> Inspect the browser console for progress logs and download `*_ATR_test_results.json`.
```

---

## 📈 Architectural Overview

- **Manifest V3**: Lightweight service worker (`background.js`) triggers `content.js` on TradingView pages.
- **Content Script**: Injects UI, sweeps parameter spaces, captures metrics from the DOM.
- **Persistent Settings**: `chrome.storage.sync` powers the settings pop‑up (`popup.html` + `popup.js`).
- **Result Management**: Real-time auto-saving to `localStorage` with one-click JSON export.

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

