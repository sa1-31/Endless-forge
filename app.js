async function runAnalysis() {

  const repo = document.getElementById("repoInput").value.trim();
  const loading = document.getElementById("loading");
  const output = document.getElementById("output");

  if (!repo) {
    output.textContent = "Please enter owner/repository";
    return;
  }

  loading.classList.remove("hidden");
  output.textContent = "";

  try {
    const result = await analyzeRepo(repo);
    output.textContent = JSON.stringify(result, null, 2);
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }

  loading.classList.add("hidden");
}
