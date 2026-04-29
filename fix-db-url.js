const { execSync, spawn } = require('child_process');

const key = 'DATABASE_URL';
const value = 'postgresql://postgres.hiangduoyhziprcuoobu:1000200030004000@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require';

console.log(`Cleaning and updating ${key}...`);

try {
  execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
} catch (e) {}

const child = spawn('npx', ['vercel', 'env', 'add', key, 'production'], {
  stdio: ['pipe', 'inherit', 'inherit'],
  shell: true
});

child.stdin.write(value);
child.stdin.end();

child.on('close', (code) => {
  if (code === 0) {
    console.log(`${key} updated successfully without newlines.`);
  } else {
    console.error(`Failed to update ${key}. Code: ${code}`);
  }
});
