const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// استخدام ملف .env الخاص بالـ Portal
const envPath = path.join(__dirname, 'apps/portal/.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

const projectNames = ['sahab-dijital'];

lines.forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);

    if (key && value) {
      projectNames.forEach(project => {
        try {
          console.log(`Updating ${key} for Portal...`);
          execSync(`echo "${value}" | npx vercel env add ${key} production`, { stdio: 'ignore' });
        } catch (e) {
          // إذا كان موجوداً، سنقوم بحذفه وإضافته مجدداً لضمان التحديث
          try {
            execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
            execSync(`echo "${value}" | npx vercel env add ${key} production`, { stdio: 'ignore' });
          } catch (err) {}
        }
      });
    }
  }
});
