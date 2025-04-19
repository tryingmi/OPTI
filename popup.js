document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("settingsForm");

  // Load saved settings or use defaults
  chrome.storage.sync.get({
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
  }, (items) => {
    form.maType.value = items.maType;
    form.fastRange.value = items.fastRange;
    form.slowRange.value = items.slowRange;
    form.kcRange.value = items.kcRange;
    form.minTrades.value = items.minTrades;
    form.maxDrawdown.value = items.maxDrawdown;
    form.minProfitFactor.value = items.minProfitFactor;
    form.topStrategiesCount.value = items.topStrategiesCount;
    form.atrDrawdownThreshold.value = items.atrDrawdownThreshold;
    form.atrStopLossValues.value = items.atrStopLossValues;
    form.atrTakeProfitValues.value = items.atrTakeProfitValues;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const maType = form.elements["maType"].value;
    const fastRange = form.elements["fastRange"].value;
    const slowRange = form.elements["slowRange"].value;
    const kcRange = form.elements["kcRange"].value;
    const minTrades = parseInt(form.elements["minTrades"].value);
    const maxDrawdown = parseFloat(form.elements["maxDrawdown"].value);
    const minProfitFactor = parseFloat(form.elements["minProfitFactor"].value);
    const topStrategiesCount = parseInt(form.elements["topStrategiesCount"].value);
    const atrDrawdownThreshold = parseFloat(form.elements["atrDrawdownThreshold"].value);
    const atrStopLossValues = form.elements["atrStopLossValues"].value;
    const atrTakeProfitValues = form.elements["atrTakeProfitValues"].value;

    chrome.storage.sync.set({
      maType,
      fastRange,
      slowRange,
      kcRange,
      minTrades,
      maxDrawdown,
      minProfitFactor,
      topStrategiesCount,
      atrDrawdownThreshold,
      atrStopLossValues,
      atrTakeProfitValues
    }, () => {
      alert("Settings saved!");
    });
  });
});
