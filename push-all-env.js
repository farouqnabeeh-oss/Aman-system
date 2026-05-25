const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// All env vars from apps/portal/.env
const envVars = {
  DATABASE_URL: "postgresql://postgres.hiangduoyhziprcuoobu:1000200030004000@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require",
  DIRECT_URL: "postgresql://postgres.hiangduoyhziprcuoobu:1000200030004000@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require",
  SUPABASE_URL: "https://hiangduoyhziprcuoobu.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYW5nZHVveWh6aXByY3Vvb2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjA5NDUsImV4cCI6MjA5MjU5Njk0NX0.vY9a2plMO8Zpsx4sEtIuHLKe02LuCoIc3WamQEx6E1Q",
  SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYW5nZHVveWh6aXByY3Vvb2J1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzAyMDk0NSwiZXhwIjoyMDkyNTk2OTQ1fQ.sIjltflHSOIulndNumihbjRBlyS9JYPOxeUNyUfHbak",
  JWT_ACCESS_SECRET: "Jw5v5ehVFw701KNFQ4QwXN8S6O36ky0WHUG2rKjdzaq3KpCySi/fxUA7jbTHoejAr71yp2cf3KAx1iTCmVcAAA==",
  JWT_REFRESH_SECRET: "refresh-token-shield-security-key-2024",
  JWT_ACCESS_EXPIRY: "3600s",
  JWT_REFRESH_EXPIRY: "7d",
  SUPABASE_JWT_KID: "9bdf05b7-b514-4f10-8b2f-2664d19d2409",
  SUPABASE_JWKS_URL: "https://hiangduoyhziprcuoobu.supabase.co/auth/v1/.well-known/jwks.json",
  PORT: "5000",
  NODE_ENV: "production",
  CORS_ORIGINS: "https://aman-portal-final.vercel.app",
  LOCAL_UPLOAD_DIR: "uploads",
  MAX_FILE_SIZE_MB: "10",
  NEXT_PUBLIC_SUPABASE_URL: "https://hiangduoyhziprcuoobu.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYW5nZHVveWh6aXByY3Vvb2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjA5NDUsImV4cCI6MjA5MjU5Njk0NX0.vY9a2plMO8Zpsx4sEtIuHLKe02LuCoIc3WamQEx6E1Q",
};

const envTypes = ['production', 'development'];
const tmpDir = path.join(__dirname, '.tmp_env_push');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

let success = 0, failed = 0;

for (const [key, value] of Object.entries(envVars)) {
  for (const envType of envTypes) {
    // Remove existing (ignore errors)
    try {
      execSync(`npx vercel env rm "${key}" ${envType} --yes`, { stdio: 'pipe', cwd: path.join(__dirname, 'apps', 'portal') });
    } catch (_) { }

    // Clean surrounding quotes if present
    const cleanValue = value.replace(/^\"|\"$/g, '').replace(/\\u0026/g, '&');
    // Escape double quotes
    const escapedValue = cleanValue.replace(/"/g, '\\"');
    // Debug output
    console.log(`🔧 Pushing ${key} [${envType}] = ${cleanValue}`);
    try {
      execSync(`npx vercel env add ${key} ${envType} --value "${escapedValue}" --yes --force --project portal`, {
        cwd: path.join(__dirname, 'apps', 'portal'),
        stdio: 'inherit'
      });
      console.log(`✅ ${key} [${envType}]`);
      success++;
    } catch (e) {
      console.error(`❌ FAILED: ${key} [${envType}]`);
      console.error(e.message);
      failed++;
    }
  }
}

console.log(`\n📊 Done: ${success} succeeded, ${failed} failed.`);
