const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'apps/portal/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

async function updateEnv(key, value) {
  return new Promise((resolve) => {
    console.log(`Cleaning and updating ${key}...`);
    try {
      execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
    } catch (e) {}

    const child = spawn('npx', ['vercel', 'env', 'add', key, 'production'], {
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: true
    });

    child.stdin.write(value.trim());
    child.stdin.end();

    child.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function main() {
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      
      if (key && value) {
        await updateEnv(key, value);
      }
    }
  }
  console.log('All environment variables cleaned and updated.');
}

main();
