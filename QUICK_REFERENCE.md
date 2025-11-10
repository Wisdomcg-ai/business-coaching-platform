# Quick Reference Card

Keep this handy while refactoring!

## 🚀 Start New Feature

```bash
git checkout refactor/systematic-improvements
git checkout -b feature/descriptive-name
# ... make changes ...
git add .
git commit -m "type: descriptive message"
```

## ✅ Before Merging

```bash
# Run tests
./scripts/test-before-merge.sh

# Manual testing checklist:
# [ ] Can log in
# [ ] Dashboard loads
# [ ] Feature you changed works
# [ ] No console errors
# [ ] npm run build succeeds
```

## 🔀 Merge Workflow

```bash
# 1. Merge to integration branch
git checkout refactor/systematic-improvements
git merge feature/your-feature

# 2. Test again

# 3. Merge to main
git checkout main
git merge refactor/systematic-improvements
git push origin main

# 4. Tag milestone (optional)
git tag -a v0.x.x -m "Description"
git push origin v0.x.x
```

## 🚨 Emergency Rollback

```bash
# Interactive menu
./scripts/rollback.sh

# Or quick rollback to snapshot
git checkout v0.1.0-pre-refactor
git checkout -b recovery-branch
```

## 📊 Check Status

```bash
git status                    # What changed?
git branch --show-current    # Where am I?
git log --oneline -5         # Recent commits
git diff                     # See changes
```

## 🛠️ Useful Scripts

```bash
./scripts/pre-refactor-snapshot.sh    # Create safety snapshot
./scripts/test-before-merge.sh        # Run all tests
./scripts/rollback.sh                 # Rollback options
```

## 📝 Commit Message Format

```
type: Short description

Longer explanation if needed

- Detail 1
- Detail 2

Related: Issue #123
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code improvement (no functionality change)
- `security:` Security fix
- `docs:` Documentation
- `test:` Adding tests
- `chore:` Maintenance

## 🎯 Current Phase Checklist

### Phase 1: Security (Week 1)
```bash
# 1.1: Secure credentials
git checkout -b security/rotate-credentials
# - Rotate all API keys
# - Add .env.local to .gitignore
# - Create .env.example

# 1.2: Standardize Supabase client
git checkout -b refactor/supabase-client
# - Fix src/app/financials/page.tsx
# - Fix src/app/goals/services/kpi-service.ts
# - Search and fix others

# 1.3: Add API validation
git checkout -b security/api-validation
# - Create validation schemas
# - Add to /api/ai-assist/route.ts
# - Add to /api/wizard/chat/route.ts

# 1.4: Complete auth
git checkout -b feature/complete-auth
# - Create /auth/signup/page.tsx
# - Create /auth/reset-password/page.tsx
```

## 📁 Project Structure

```
business-coaching-platform/
├── src/
│   ├── app/                    # Next.js pages & routes
│   │   ├── api/               # API endpoints
│   │   ├── auth/              # Auth pages
│   │   ├── dashboard/         # Main dashboard
│   │   ├── goals/             # Goals wizard
│   │   └── ...
│   ├── components/            # React components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # UI components
│   ├── lib/                   # Utilities & services
│   │   ├── services/          # Business logic
│   │   ├── supabase/          # Database layer
│   │   └── validation/        # Input validation
│   └── types/                 # TypeScript types
├── scripts/                   # Automation scripts
├── .env.local                 # Secrets (NEVER commit!)
├── .env.example              # Template (safe to commit)
├── REFACTORING_ROADMAP.md    # Detailed plan
└── GETTING_STARTED.md        # Getting started guide
```

## 🔍 Find Things

```bash
# Find files
find src/ -name "*component*"

# Search in files
grep -r "createClient" src/

# Count instances
grep -r "any" src/ | wc -l

# Find large files
find src/ -size +200k
```

## 🧪 Testing Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Test production build
npm run lint         # Check code style
npm test             # Run tests (when added)
```

## 📍 Important Files

| File | Purpose |
|------|---------|
| `REFACTORING_ROADMAP.md` | Detailed refactoring plan |
| `GETTING_STARTED_WITH_REFACTORING.md` | Step-by-step guide |
| `CURRENT_STATE.md` | Snapshot documentation |
| `QUICK_REFERENCE.md` | This file! |
| `.env.example` | Environment variables template |

## 🎨 Code Style Guide

### Component Structure
```typescript
'use client'  // Only if needed

import { ... } from '...'  // External
import { ... } from '@/...' // Internal

interface Props {
  // Props here
}

export default function ComponentName({ props }: Props) {
  // 1. Hooks
  const [state, setState] = useState()

  // 2. Effects
  useEffect(() => {}, [])

  // 3. Handlers
  const handleClick = () => {}

  // 4. Render
  return <div>...</div>
}
```

### Service Function
```typescript
export async function serviceName(params: Type): Promise<Result> {
  try {
    // Logic here
    return { success: true, data }
  } catch (error) {
    console.error('Error:', error)
    return { success: false, error: 'Message' }
  }
}
```

## 🐛 Common Issues & Fixes

### "Changes not showing up"
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### "Module not found"
```bash
npm install
```

### "TypeScript errors"
```bash
npm run build
# Fix errors shown
```

### "Merge conflict"
```bash
# Open conflicted files, resolve manually
git add .
git commit -m "fix: Resolve merge conflicts"
```

### "Lost work"
```bash
# Check if it's in stash
git stash list
git stash pop

# Check other branches
git branch -a
git checkout other-branch

# Check reflog (git history)
git reflog
git checkout <commit-hash>
```

## 💾 Backup Locations

If you need to recover:

1. **Git tag:** `v0.1.0-pre-refactor`
   ```bash
   git checkout v0.1.0-pre-refactor
   ```

2. **Local backup:** `../business-coaching-platform-snapshot-*`
   ```bash
   ls -la ../business-coaching-platform-snapshot-*
   cp -r ../snapshot-folder/* .
   ```

3. **Remote backup:** `origin/main`
   ```bash
   git checkout origin/main
   ```

## 📞 When Stuck

1. **Check status:** `git status`
2. **View changes:** `git diff`
3. **Check errors:** Browser console (F12)
4. **Review docs:** `cat REFACTORING_ROADMAP.md`
5. **Rollback:** `./scripts/rollback.sh`

## 🎯 Daily Workflow

### Morning
```bash
git status                           # Check state
git checkout refactor/systematic-improvements
git pull origin main                 # Get latest
```

### During Work
```bash
# Small commits frequently
git add .
git commit -m "descriptive message"
```

### Evening
```bash
git push origin your-branch-name     # Backup
echo "Today: Fixed X, Y works, need to test Z" >> .refactor-notes.md
```

## 📊 Progress Check

```bash
# Completed tasks
git tag

# Current work
git branch --show-current

# What's changed
git log --oneline -10

# Uncommitted changes
git status
```

---

**Pro Tip:** Print this page and keep it next to your keyboard! 📄

**Remember:** When in doubt, commit, push, and ask for help. You can always rollback! 🚀
