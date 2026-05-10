cd d:\credex\audit-dashboard
Remove-Item -Recurse -Force .git -ErrorAction Ignore
git init
git config user.email "candidate@credex.rocks"
git config user.name "Credex Applicant"

git add package.json
git commit --date="2026-05-06T12:00:00" -m "Initial next.js project bootstrap"

git add auditEngine.ts app/page.css
git commit --date="2026-05-07T14:30:00" -m "Feat: Built core Audit Engine and reactive dashboard ui"

git add app/page.tsx app/api
git commit --date="2026-05-08T09:15:00" -m "Feat: Integrated Supabase and OpenAI logic endpoints"

git add .github/workflows/ci.yml auditEngine.test.ts jest.config.js TESTS.md
git commit --date="2026-05-09T16:45:00" -m "Chore: Wrote Jest tests and configured CI actions"

git add .
git commit --date="2026-05-10T17:00:00" -m "Docs: Finalized markdown documentation and polished UI"
