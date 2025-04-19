(function () {
    'use strict';

    let isTesting = false; // Guard flag to prevent overlapping tests

    function saveProgress(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    
    function loadProgress(key) {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
    }
    
    const INITIAL_RESULTS_KEY = 'atr_optimizer_initialResults';
    const ATR_RESULTS_KEY = 'atr_optimizer_atrResults';
    let allATRResultsGlobal = loadProgress(ATR_RESULTS_KEY) || [];
    
    setInterval(() => {
        saveProgress(ATR_RESULTS_KEY, allATRResultsGlobal);
        console.log("Content: 💾 Auto-saved ATR results...");
    }, 30000);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function setRealInputValue(element, value) {
        element.focus();
        element.select();
        await sleep(50);
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, composed: true }));
        element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        const enterKeyEvents = [
            new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }),
            new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }),
            new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true })
        ];
        for (const event of enterKeyEvents) {
            element.dispatchEvent(event);
            await sleep(10);
        }
        element.blur();
        await sleep(50);
        element.focus();
        await sleep(50);
        element.blur();
    }

    async function triggerTradingViewUpdate() {
        const applyButton = document.querySelector('button[data-name="backtesting-apply-button"]');
        const runButton = document.querySelector('button[data-name="backtesting-run-button"]');
        if (applyButton) {
            applyButton.click();
            await sleep(300);
            return true;
        }
        if (runButton) {
            runButton.click();
            await sleep(300);
            return true;
        }
        return false;
    }

    async function openStrategyTesterTab() {
        const testerBtn = document.querySelector('button[aria-label="Open Strategy Tester"][data-name="backtesting"]');
        if (testerBtn) {
            if (testerBtn.getAttribute("data-active") === "false") {
                testerBtn.click();
                console.log("Content: 🖥️ Opened Strategy Tester tab.");
                await sleep(1000);
            } else {
                console.log("Content: 🖥️ Strategy Tester tab already active.");
            }
        } else {
            console.log("Content: ❗ Strategy Tester button not found!");
        }
    }

    async function openStrategySettings() {
        const dropdownBtn = document.querySelector('button[data-strategy-title]');
        if (dropdownBtn) {
            dropdownBtn.click();
            await sleep(500);
            const settingsBtn = document.querySelector('div[role="menuitem"][aria-label="Settings…"]');
            if (settingsBtn) {
                settingsBtn.click();
                await sleep(500);
                console.log("Content: ⚙️ Opened Strategy Settings.");
            } else {
                console.log("Content: ❗ Settings menu item not found!");
            }
        } else {
            console.log("Content: ❗ Strategy dropdown button not found!");
        }
    }

    // Default parameters; these will be overwritten by user settings if available.
    let initialFastMARange = [5, 10, 15, 20, 25, 30];
    let initialSlowMARange = [20, 30, 40, 50, 60, 70, 80, 90, 100];
    let maTypes = ["SMA", "EMA"];
    let kcLengthRange = [4, 5, 6, 7];
    let chosenMAType = "SMA"; // default
    const inputBoxIndices = [1, 2];
    const kcInputIndex = 0;
    let MIN_TRADES = 40;
    let MAX_DRAWDOWN = 20;
    let MIN_PROFIT_FACTOR = 1.5;
    let TOP_STRATEGIES_COUNT = 3;
    let ATR_DRAWNDOWN_THRESHOLD = 20;
    let atrStopLossValues = [1.5, 2, 3, 4];
    let atrTakeProfitValues = [2, 3, 4];

    // Load settings from storage and override defaults.
    chrome.storage.sync.get(
      {
        maType: "SMA",
        fastRange: "5,10,15,20,25,30",
        slowRange: "20,30,40,50,60,70,80,90,100",
        kcRange: "4,5,6,7",
        minTrades: 40,
        maxDrawdown: 20,
        minProfitFactor: 1.5,
        topStrategiesCount: 3,
        atrDrawdownThreshold: 20,
        atrStopLossValues: "1.5,2,3,4",
        atrTakeProfitValues: "2,3,4"
      },
      (items) => {
        chosenMAType = items.maType;
        // Convert comma-separated strings to number arrays.
        initialFastMARange = items.fastRange.split(",").map(Number);
        initialSlowMARange = items.slowRange.split(",").map(Number);
        kcLengthRange = items.kcRange.split(",").map(Number);
        MIN_TRADES = items.minTrades;
        MAX_DRAWDOWN = items.maxDrawdown;
        MIN_PROFIT_FACTOR = items.minProfitFactor;
        TOP_STRATEGIES_COUNT = items.topStrategiesCount;
        ATR_DRAWNDOWN_THRESHOLD = items.atrDrawdownThreshold;
        atrStopLossValues = items.atrStopLossValues.split(",").map(Number);
        atrTakeProfitValues = items.atrTakeProfitValues.split(",").map(Number);
        console.log("Content: Settings loaded:", { chosenMAType, initialFastMARange, initialSlowMARange, kcLengthRange, MIN_TRADES, MAX_DRAWDOWN, MIN_PROFIT_FACTOR, TOP_STRATEGIES_COUNT, ATR_DRAWNDOWN_THRESHOLD, atrStopLossValues, atrTakeProfitValues });
      }
    );

    function getProfitValue() {
        const profitElement = document.querySelector(".highlightedValue-LVMgafTl");
        if (profitElement) {
            const profitText = profitElement.textContent.trim().replace(/−/g, "-");
            const profit = parseFloat(profitText.replace(/[^0-9.-]+/g, ""));
            return isNaN(profit) ? null : profit;
        }
        return null;
    }

    function getMetrics() {
        const metricElements = document.querySelectorAll(".containerCell-hwB8aI49");
        if (metricElements.length < 5) return null;
        const totalTradesElement = metricElements[2].querySelector(".value-LVMgafTl");
        const totalTrades = totalTradesElement ? parseInt(totalTradesElement.textContent.trim()) : 0;
        const drawdownText = metricElements[1].querySelector(".change-LVMgafTl")?.textContent || "0%";
        return {
            profit: getProfitValue(),
            drawdown: parseFloat(drawdownText.replace(/[^0-9.-]+/g, "")),
            totalTrades: totalTrades,
            percentProfitable: parseFloat(metricElements[3].querySelector(".value-LVMgafTl")?.textContent || "0"),
            profitFactor: parseFloat(metricElements[4].querySelector(".value-LVMgafTl")?.textContent || "0")
        };
    }

    async function waitForProfitChange(previousProfit, timeout = 5000, pollInterval = 100) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            let currentProfit = getProfitValue();
            if (currentProfit !== null && currentProfit !== previousProfit) {
                return currentProfit;
            }
            await sleep(pollInterval);
        }
        return null;
    }

    function getCoinName() {
        const button = document.querySelector(".title-l31H9iuA");
        if (!button) return "Unknown";
        const text = button.textContent.trim();
        const match = text.match(/^(\w+)USDT/);
        return match ? match[1] : "Unknown";
    }

    async function setMAType(maType, inputFields) {
        const maButton = document.querySelector("#in_3");
        if (!maButton) return false;
        maButton.click();
        await sleep(300);
        const dropdownItems = document.querySelectorAll(".menuBox-Kq3ruQo8 .item-jFqVJoPk");
        for (const item of dropdownItems) {
            const label = item.querySelector(".label-jFqVJoPk");
            if (label && label.textContent.trim().toUpperCase() === maType.toUpperCase()) {
                item.click();
                await sleep(300);
                const fastInputField = inputFields[inputBoxIndices[0]];
                fastInputField.focus();
                await setRealInputValue(fastInputField, fastInputField.value || "5");
                return true;
            }
        }
        return false;
    }

    function toggleKCChannel(checked) {
        const labels = document.querySelectorAll('label');
        for (const label of labels) {
            if (label.innerText.includes("Use KC Momentum")) {
                const checkbox = label.querySelector('input[type="checkbox"]');
                if (!checkbox) return false;
                if (checkbox.checked !== checked) {
                    checkbox.click();
                }
                return true;
            }
        }
        return false;
    }

    function toggleATROption(optionLabel, checked) {
        const labels = document.querySelectorAll('.label-ZOx_CVY3');
        for (const label of labels) {
            if (label.textContent.trim() === optionLabel) {
                const parent = label.closest('label');
                const checkbox = parent.querySelector('input[type="checkbox"]');
                if (checkbox && checkbox.checked !== checked) {
                    checkbox.click();
                }
                return true;
            }
        }
        return false;
    }

    function playCompletionSound() {
        const audio = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
        audio.play().catch(() => {});
    }

    function saveResults(filename, data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        console.log(`Content: 📁 Results saved to ${filename}`);
    }

    async function runTests(kcLengthRange, fastMARange, slowMARange, maType, coinName, inputFields) {
        const results = [];
        let testCount = 1;
        for (const kcLength of kcLengthRange) {
            await setRealInputValue(inputFields[kcInputIndex], kcLength);
            await triggerTradingViewUpdate();
            await sleep(200);
            for (const fastMA of fastMARange) {
                for (const slowMA of slowMARange) {
                    if (slowMA <= fastMA) continue;
                    console.log(`🔢 [${testCount}] Testing: KC ${kcLength}, MA: ${fastMA}/${slowMA}, MA Type: ${maType}`);
                    await setRealInputValue(inputFields[inputBoxIndices[0]], fastMA);
                    await setRealInputValue(inputFields[inputBoxIndices[1]], slowMA);
                    await triggerTradingViewUpdate();
                    await sleep(200);
                    const previousProfit = getProfitValue();
                    const newProfit = await waitForProfitChange(previousProfit);
                    if (newProfit === null) {
                        console.log(`⌛ [${testCount}] Timeout: No profit update.`);
                        results.push({ kcLength, fastMA, slowMA, maType, status: "timeout", note: "No update" });
                        testCount++;
                        continue;
                    }
                    const metrics = getMetrics();
                    if (metrics && metrics.totalTrades >= MIN_TRADES && metrics.drawdown <= MAX_DRAWDOWN && metrics.profitFactor >= MIN_PROFIT_FACTOR) {
                        console.log(`✅ [${testCount}] Approved: PF ${metrics.profitFactor}, DD ${metrics.drawdown}% (${maType})`);
                        results.push({ kcLength, fastMA, slowMA, maType, profit: newProfit, drawdown: metrics.drawdown, totalTrades: metrics.totalTrades, profitFactor: metrics.profitFactor, status: "approved" });
                    } else {
                        console.log(`❌ [${testCount}] Excluded: PF ${metrics ? metrics.profitFactor : 'n/a'}, DD ${metrics ? metrics.drawdown : 'n/a'}% (${maType})`);
                        // Include metrics for excluded results if available.
                        let result = { kcLength, fastMA, slowMA, maType, status: "excluded", note: "Filtered out" };
                        if (metrics) {
                            result.profit = newProfit;
                            result.drawdown = metrics.drawdown;
                            result.totalTrades = metrics.totalTrades;
                            result.profitFactor = metrics.profitFactor;
                        }
                        results.push(result);
                    }
                    testCount++;
                }
            }
        }
        return results;
    }

    async function runATRTests(strategy, atrStopLossValues, atrTakeProfitValues, inputFields) {
        const atrResults = [];
        await setRealInputValue(inputFields[kcInputIndex], strategy.kcLength);
        await setRealInputValue(inputFields[inputBoxIndices[0]], strategy.fastMA);
        await setRealInputValue(inputFields[inputBoxIndices[1]], strategy.slowMA);
        toggleATROption("Use Fixed Stop Loss (ATR)", true);
        toggleATROption("Use Dynamic Take Profit (ATR)", true);
        for (const atrSL of atrStopLossValues) {
            for (const atrTP of atrTakeProfitValues) {
                console.log(`🔢 [ATR] Testing: SL ${atrSL}, TP ${atrTP} (MA Type: ${strategy.maType})`);
                await setRealInputValue(inputFields[3], atrSL);
                await setRealInputValue(inputFields[5], atrTP);
                await triggerTradingViewUpdate();
                await sleep(300);
                const previousProfit = getProfitValue();
                const newProfit = await waitForProfitChange(previousProfit);
                if (newProfit === null) {
                    console.log(`⌛ [ATR] Timeout for SL ${atrSL}, TP ${atrTP}`);
                    atrResults.push({ kcLength: strategy.kcLength, fastMA: strategy.fastMA, slowMA: strategy.slowMA, maType: strategy.maType, atrStopLoss: atrSL, atrTakeProfit: atrTP, status: "timeout", note: "No update" });
                    continue;
                }
                const metrics = getMetrics();
                if (metrics && metrics.totalTrades >= MIN_TRADES && metrics.drawdown <= MAX_DRAWDOWN && metrics.profitFactor >= MIN_PROFIT_FACTOR && metrics.drawdown <= ATR_DRAWNDOWN_THRESHOLD) {
                    console.log(`✅ [ATR] Approved: SL ${atrSL}, TP ${atrTP}, PF ${metrics.profitFactor} (${strategy.maType})`);
                    const result = { kcLength: strategy.kcLength, fastMA: strategy.fastMA, slowMA: strategy.slowMA, maType: strategy.maType, atrStopLoss: atrSL, atrTakeProfit: atrTP, profit: newProfit, drawdown: metrics.drawdown, totalTrades: metrics.totalTrades, profitFactor: metrics.profitFactor, status: "approved" };
                    atrResults.push(result);
                    allATRResultsGlobal.push(result);
                } else {
                    console.log(`❌ [ATR] Excluded for SL ${atrSL}, TP ${atrTP} (Conditions not met; PF ${metrics ? metrics.profitFactor : 'n/a'}, DD ${metrics ? metrics.drawdown : 'n/a'}%)`);
                    let result = { kcLength: strategy.kcLength, fastMA: strategy.fastMA, slowMA: strategy.slowMA, maType: strategy.maType, atrStopLoss: atrSL, atrTakeProfit: atrTP, status: "excluded", note: "Filtered out" };
                    if (metrics) {
                        result.profit = newProfit;
                        result.drawdown = metrics.drawdown;
                        result.totalTrades = metrics.totalTrades;
                        result.profitFactor = metrics.profitFactor;
                    }
                    atrResults.push(result);
                }
            }
        }
        return atrResults;
    }

    async function startTesting() {
        if (isTesting) {
            console.log("Content: ⚠️ Testing is already running.");
            return;
        }
        isTesting = true;
        const startTime = Date.now();
        console.log("Content: ⏱️ Starting testing process...");
        if (!toggleKCChannel(true)) {
            console.log("Content: ❗ Failed to activate KC channel. Exiting.");
            isTesting = false;
            return;
        }
        toggleATROption("Use Fixed Stop Loss (ATR)", false);
        toggleATROption("Use Dynamic Take Profit (ATR)", false);

        const inputFields = document.querySelectorAll(".input-RUSovanF");
        if (inputFields.length === 0 || inputBoxIndices.some(i => i >= inputFields.length) || kcInputIndex >= inputFields.length) {
            console.log("Content: ❗ Input fields not found or indices out of range!");
            isTesting = false;
            return;
        }
        const coinName = getCoinName();
        let initialResults = [];
        // Use the chosenMAType from settings for testing
        if (await setMAType(chosenMAType, inputFields)) {
            const results = await runTests(kcLengthRange, initialFastMARange, initialSlowMARange, chosenMAType, coinName, inputFields);
            initialResults = initialResults.concat(results);
        }
        // Sort initial test results: approved first (sorted by profitFactor descending), then the rest
        initialResults.sort((a, b) => {
            if (a.status === "approved" && b.status !== "approved") return -1;
            if (a.status !== "approved" && b.status === "approved") return 1;
            if (a.status === "approved" && b.status === "approved") return b.profitFactor - a.profitFactor;
            return 0;
        });
        saveProgress(INITIAL_RESULTS_KEY, initialResults);
        const validResults = initialResults.filter(r => r.status === "approved");
        const topStrategies = validResults.slice(0, TOP_STRATEGIES_COUNT);
        console.log("Content: 🔝 Top strategies:", topStrategies);

        let allATRResults = [];
        for (const strat of topStrategies) {
            const atrResults = await runATRTests(strat, atrStopLossValues, atrTakeProfitValues, inputFields);
            allATRResults = allATRResults.concat(atrResults);
        }
        // Sort ATR results: approved first (sorted by profitFactor descending) then non-approved
        const approvedATR = allATRResults.filter(r => r.status === "approved").sort((a, b) => b.profitFactor - a.profitFactor);
        const nonApprovedATR = allATRResults.filter(r => r.status !== "approved").sort((a, b) => {
            if (a.profitFactor && b.profitFactor) return b.profitFactor - a.profitFactor;
            return 0;
        });
        const sortedATRResults = approvedATR.concat(nonApprovedATR);
        const endTime = Date.now();
        const durationMinutes = ((endTime - startTime) / 60000).toFixed(2);
        console.log("Content: ⏱️ Testing duration: " + durationMinutes + " minutes.");
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${coinName}_${timestamp}_ATR_test_results.json`;
        saveResults(filename, {
            validResults: approvedATR,
            allResults: sortedATRResults,
            summary: {
                totalATRTests: allATRResults.length,
                approvedATR: approvedATR.length,
                timeouts: allATRResults.filter(r => r.status === "timeout").length,
                exclusions: allATRResults.filter(r => r.status === "excluded").length,
                testingDurationMinutes: durationMinutes
            }
        });
        console.log("Content: ✅ Testing completed!");
        playCompletionSound();
        isTesting = false;
    }

    function addActivationButton() {
        const btn = document.createElement('button');
        btn.innerText = 'ATR';
        btn.id = 'atrTestingButton';
        btn.style.position = 'fixed';
        btn.style.bottom = '20px';
        btn.style.right = '20px';
        btn.style.zIndex = '9999';
        btn.style.width = '60px';
        btn.style.height = '60px';
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.borderRadius = '50%';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '16px';
        btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        document.body.appendChild(btn);
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.innerText = '...';
            await openStrategyTesterTab();
            btn.innerText = '...';
            await openStrategySettings();
            btn.innerText = '...';
            await startTesting();
            btn.disabled = false;
            btn.innerText = 'ATR';
        });
    }

    window.addEventListener('load', () => {
        setTimeout(addActivationButton, 2000);
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "runOptimization") {
            console.log("Content: Received runOptimization command from background.");
            startTesting().then(() => {
                sendResponse({ result: "Optimization completed" });
            });
            return true;
        }
    });
})();
