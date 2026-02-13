export async function analyzeRepo(repoFullName) {

  const base = `https://api.github.com/repos/${repoFullName}`;

  const repoData = await fetch(base).then(r => r.json());
  const contents = await fetch(base + "/contents").then(r => r.json());

  const solidityFiles = contents.filter(f =>
    f.name.endsWith(".sol")
  );

  let contracts = [];

  for (let file of solidityFiles) {
    const code = await fetch(file.download_url).then(r => r.text());

    const functions = [...code.matchAll(/function\s+(\w+)/g)].map(m => m[1]);

    const hasOwner = code.includes("onlyOwner");
    const hasReentrancyGuard = code.includes("ReentrancyGuard");
    const usesDelegateCall = code.includes("delegatecall");

    contracts.push({
      file: file.name,
      functionCount: functions.length,
      hasOwner,
      hasReentrancyGuard,
      usesDelegateCall
    });
  }

  const score = calculateScore(repoData, contracts);

  return {
    repository: repoFullName,
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    solidityFiles: solidityFiles.length,
    contracts,
    builderScore: score
  };
}

function calculateScore(repo, contracts) {

  let score = 0;

  score += Math.min(repo.stargazers_count * 2, 20);
  score += Math.min(repo.forks_count * 2, 20);

  contracts.forEach(c => {
    score += c.functionCount;
    if (c.hasOwner) score += 10;
    if (c.hasReentrancyGuard) score += 15;
    if (c.usesDelegateCall) score -= 10;
  });

  return Math.max(0, Math.min(score, 100));
}
