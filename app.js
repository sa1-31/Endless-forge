import { analyzeRepo } from "./analyzer.js";

window.runAnalysis = async function () {

  const repo = document.getElementById("repoInput").value;
  const loading = document.getElementById("loading");
  const output = document.getElementById("output");

  loading.classList.remove("hidden");
  output.textContent = "";

  try {
    const result = await analyzeRepo(repo);
    output.textContent = JSON.stringify(result, null, 2);
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }

  loading.classList.add("hidden");
};
