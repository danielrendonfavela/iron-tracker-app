import https from 'https';

function protectBranch(token, owner, repo, branch) {
  const postData = JSON.stringify({
    required_status_checks: null,
    enforce_admins: false,
    required_pull_request_reviews: null,
    restrictions: null,
    allow_force_pushes: false,
    allow_deletions: false
  });

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: `/repos/${owner}/${repo}/branches/${branch}/protection`,
    method: 'PUT',
    headers: {
      'User-Agent': 'Node-Branch-Protector',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Rama '${branch}' protegida exitosamente contra borrado.`);
          resolve(JSON.parse(data));
        } else {
          console.error(`❌ Error protegiendo '${branch}' (${res.statusCode}):`, data);
          reject(new Error(data));
        }
      });
    });
    req.on('error', e => reject(e));
    req.write(postData);
    req.end();
  });
}

// Get token from gh CLI auth token
import { execSync } from 'child_process';
try {
  const token = execSync('"C:\\Program Files\\GitHub CLI\\gh.exe" auth token').toString().trim();
  const owner = 'danielrendonfavela';
  const repo = 'iron-tracker-app';

  for (const branch of ['develop', 'uat', 'prod']) {
    await protectBranch(token, owner, repo, branch);
  }
} catch (e) {
  console.error('Error running protection script:', e);
}
