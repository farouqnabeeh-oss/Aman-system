const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'apps/portal/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

const projectNames = ['portal'];

lines.forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);

    if (key && value) {
      console.log(`Fixing ${key}...`);
      
      // Remove old variable
      spawnSync('npx', ['vercel', 'env', 'rm', key, 'production', '-y'], { stdio: 'ignore', shell: true });
      
      // Add new variable using proper stdin piping
      const child = spawnSync('npx', ['vercel', 'env', 'add', key, 'production'], {
        input: value,
        shell: true
      });
      
      if (child.status !== 0) {
        console.error(`Failed to add ${key}:`, child.stderr?.toString());
      }
    }
  }
});
console.log('All environment variables fixed!');
