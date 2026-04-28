const fs = require('fs');
const { execSync } = require('child_process');

const envContent = fs.readFileSync('apps/portal/.env', 'utf-8');
const lines = envContent.split('\n');

for (const line of lines) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    
    // Remove surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);

    if (key && value) {
      console.log(`Setting ${key}...`);
      try {
        // Run vercel env rm to remove existing empty variable first, ignore error if it doesn't exist
        try { execSync(`npx vercel env rm ${key} production -y`); } catch(e) {}
        
        // Add the new variable
        execSync(`npx vercel env add ${key} production`, { input: value });
        console.log(`Successfully set ${key}`);
      } catch (err) {
        console.error(`Failed to set ${key}:`, err.message);
      }
    }
  }
}
