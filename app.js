document.getElementById("analyzeBtn").addEventListener("click", runAnalysis);

async function runAnalysis() {

  const repo = document.getElementById("repoInput").value.trim();
  const output = document.getElementById("output");
  const loading = document.getElementById("loading");

  if (!repo) {
    output.textContent = "Please enter owner/repository";
    return;
  }

  loading.classList.remove("hidden");
  output.textContent = "";

  try {

    const base = `https://api.github.com/repos/${repo}`;

    const repoRes = await fetch(base);

    if (!repoRes.ok) {
      throw new Error("Repository not found or API limit hit");
    }

    const repoData = await repoRes.json();

    const contentsRes = await fetch(base + "/contents");

    if (!contentsRes.ok) {
      throw new Error("Could not fetch repository contents");
    }

    const contents = await contentsRes.json();

    const solidityFiles = contents.filter(f =>
      f.name.endsWith(".sol")
    );

    let contracts = [];

    for (let file of solidityFiles) {

      const codeRes = await fetch(file.download_url);
      const code = await codeRes.text();

      const functions = [...code.matchAll(/function\s+(\w+)/g)].map(m => m[1]);

      contracts.push({
        file: file.name,
        functionCount: functions.length
      });
    }

    const score = calculateScore(repoData, contracts);

    output.textContent = JSON.stringify({
      repository: repo,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      solidityFiles: solidityFiles.length,
      contracts,
      builderScore: score
    }, null, 2);

  } catch (err) {
    output.textContent = "ERROR: " + err.message;
  }

  loading.classList.add("hidden");
}

function calculateScore(repo, contracts) {

  let score = 0;

  score += Math.min(repo.stargazers_count * 2, 20);
  score += Math.min(repo.forks_count * 2, 20);

  contracts.forEach(c => {
    score += c.functionCount;
  });

  return Math.min(score, 100);
}
