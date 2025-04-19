// background.js

async function optimizeParameters() {
    console.log("Background: Running optimization in background...");
    try {
        const tabs = await chrome.tabs.query({ url: "*://*.tradingview.com/*" });
        
        if (!tabs || tabs.length === 0) {
            console.warn("Background: No TradingView tabs found.");
            return;
        }
  
        for (const tab of tabs) {
            try {
                const response = await chrome.tabs.sendMessage(tab.id, { 
                    action: "runOptimization" 
                });
                console.log("Background: Optimization response from tab", tab.id, response);
            } catch (error) {
                console.error("Background: Error in tab", tab.id, error.message);
            }
        }
    } catch (error) {
        console.error("Background: General error:", error);
    }
  }
  
// Comment out or remove this automatic trigger.
// setInterval(optimizeParameters, 10000);
  