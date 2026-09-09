(function () {
  var script = document.createElement("script");
  script.src = "https://tracker.metricool.com/resources/be.js";
  script.async = true;
  script.onerror = function () {
    // Silent fail — tracker.metricool.com inaccessible en local/dev
    console.warn("[Metricool] Tracker non disponible (hors-ligne ou env. local).");
  };
  script.onload = function () {
    if (typeof beTracker !== "undefined" && beTracker.t) {
      beTracker.t({ hash: "2061ac24b46721639658bdb7d9297dd2" });
    }
  };
  document.head.appendChild(script);
})();
