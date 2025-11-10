# Getting Started with Systematic Refactoring

This guide will help you safely refactor your codebase without losing any work.

## 🎯 Overview

We're going to improve your codebase in small, controlled steps with multiple safety nets:
1. **Git tags** - Snapshot of working state you can always return to
2. **Feature branches** - Isolate changes, easy to undo
3. **Local backups** - Physical copy of code before changes
4. **Testing scripts** - Verify nothing broke before merging

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] All current work committed to git
- [ ] Access to Supabase dashboard (to rotate keys)
- [ ] Access to OpenAI dashboard (to rotate keys)
- [ ] Working development environment (can run `npm run dev`)

## 🚀 Step-by-Step: First Time Setup

### Step 1: Create Safety Snapshot (5 minutes)

Run the automated snapshot script:

```bash
./scripts/pre-refactor-snapshot.sh
```

This will:
- ✅ Commit any uncommitted changes
- ✅ Create git tag `v0.1.0-pre-refactor`
- ✅ Push to remote (backup in cloud)
- ✅ Create local backup copy
- ✅ Create refactoring branch
- ✅ Document current state

**Result:** You now have 3 backups of your working code!

### Step 2: Verify Snapshot (2 minutes)

Check that everything was created:

```bash
# Check tag exists
git tag | grep pre-refactor

# Check backup directory exists
ls -la ../business-coaching-platform-snapshot-*

# Check documentation created
cat CURRENT_STATE.md
```

### Step 3: Review Roadmap (5 minutes)

Read the full roadmap:

```bash
cat REFACTORING_ROADMAP.md
```

Key points:
- **Phase 1:** Security fixes (Week 1)
- **Phase 2:** Code quality (Week 2)
- **Phase 3:** Stability (Week 3)
- **Phase 4:** Testing (Week 4)

## 🔧 Your First Refactor: Secure Credentials (CRITICAL)

Let's do the first fix together as a demonstration of the safe process.

### Fix 1.1: Secure Your API Credentials

**Why:** Your `.env.local` file with real API keys might be committed to git (security risk!)

**Time:** 15-20 minutes

**Risk Level:** LOW (only environment variables)

#### Step-by-step:

```bash
# 1. Create feature branch
git checkout -b security/rotate-credentials

# 2. Check if .env.local is in git (it shouldn't be!)
git ls-files | grep .env.local

# 3. If it IS in git, we need to remove it
git rm --cached .env.local
git commit -m "security: Remove .env.local from git tracking"
```

Now rotate your keys:

```bash
# 4. Update .gitignore to ensure .env.local never gets committed
echo "" >> .gitignore
echo "# Environment variables (never commit these!)" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore

git add .gitignore
git commit -m "security: Add .env.local to .gitignore"
```

```bash
# 5. .env.example is already created (template without real keys)
# Users will copy this and add their own keys
git add .env.example
git commit -m "docs: Add .env.example template"
```

Now rotate your actual API keys:

**Rotate Supabase Keys:**
1. Go to Supabase Dashboard → Project Settings → API
2. Click "Reset" on Service Role Key
3. Copy new keys to your `.env.local` (local only, not committed)

**Rotate OpenAI Key:**
1. Go to OpenAI Dashboard → API Keys
2. Create new key
3. Delete old key
4. Copy new key to your `.env.local`

**Test that everything still works:**

```bash
# 6. Start development server
npm run dev

# 7. Open browser to http://localhost:3000
# 8. Try to log in
# 9. Try to use AI features
# 10. Check that no errors in console
```

**If everything works:**

```bash
# 11. Push your feature branch (backup)
git push origin security/rotate-credentials

# 12. Merge to refactoring branch
git checkout refactor/systematic-improvements
git merge security/rotate-credentials

# 13. Test again on refactoring branch
npm run dev
# ... test manually ...

# 14. If all good, merge to main
git checkout main
git merge refactor/systematic-improvements
git push origin main

# 15. Tag this achievement
git tag -a v0.1.1-security -m "Security: Credentials secured"
git push origin v0.1.1-security
```

**If something broke:**

```bash
# Rollback using the script
./scripts/rollback.sh

# Or manually:
git checkout refactor/systematic-improvements
git branch -D security/rotate-credentials
```

🎉 **Congratulations!** You just completed your first safe refactor!

## 📊 The Pattern (for all future refactors)

Every refactor follows this pattern:

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make small changes
# ... edit files ...

# 3. Commit frequently with descriptive messages
git add .
git commit -m "descriptive message about what changed"

# 4. Test locally
npm run dev
# ... manual testing ...

# 5. Run automated checks
./scripts/test-before-merge.sh

# 6. Merge to integration branch
git checkout refactor/systematic-improvements
git merge feature/your-feature-name

# 7. Test again

# 8. If good, merge to main
git checkout main
git merge refactor/systematic-improvements
git push

# 9. Tag the milestone (optional but recommended)
git tag -a v0.x.x -m "Description"
git push origin v0.x.x
```

## 🚨 Emergency Rollback Procedures

If anything goes wrong, you have multiple escape hatches:

### Option 1: Undo Last Commit
```bash
git revert HEAD
```

### Option 2: Delete Feature Branch (Start Over)
```bash
git checkout refactor/systematic-improvements
git branch -D feature/problematic-branch
```

### Option 3: Return to Pre-Refactor State
```bash
git checkout v0.1.0-pre-refactor
git checkout -b recovery-branch
```

### Option 4: Copy from Local Backup
```bash
# Find your backup
ls -la ../business-coaching-platform-snapshot-*

# Copy files back
cp -r ../business-coaching-platform-snapshot-YYYYMMDD-HHMMSS/* .
```

### Option 5: Use Rollback Script
```bash
./scripts/rollback.sh
# Follow interactive prompts
```

## 🧪 Testing Before Each Merge

Before merging any branch to main, run:

```bash
./scripts/test-before-merge.sh
```

This checks:
- ✅ TypeScript compiles
- ✅ No exposed secrets
- ✅ Linting passes
- ✅ Tests pass (when added)

## 📅 Recommended Schedule

### Week 1: Security (CRITICAL)
**Goal:** Fix security vulnerabilities

- **Day 1-2:** Rotate credentials, fix .gitignore
- **Day 3-4:** Standardize Supabase client usage
- **Day 4-5:** Add API input validation
- **Weekend:** Implement missing auth pages

**Test thoroughly before moving to Week 2!**

### Week 2: Code Quality
**Goal:** Make code maintainable

- **Day 1-2:** Create reusable multi-step form
- **Day 3-5:** Refactor largest components (one per day)

### Week 3: Stability
**Goal:** Add error handling and UX improvements

- **Day 1-2:** Error boundaries and consistent error handling
- **Day 3-4:** Loading states and skeletons
- **Day 5:** Replace `any` types

### Week 4: Testing
**Goal:** Prevent regressions

- **Day 1-3:** Write unit tests for services
- **Day 4-5:** Add integration tests

## 💡 Tips for Success

### DO:
✅ Commit frequently with descriptive messages
✅ Test after every change
✅ Keep feature branches small (1-3 files)
✅ Ask for help if stuck
✅ Celebrate wins (tag milestones!)

### DON'T:
❌ Make multiple unrelated changes in one branch
❌ Skip testing before merging
❌ Work directly on main branch
❌ Rush - take time to test thoroughly
❌ Be afraid to rollback if something breaks

## 🎓 Learning Resources

### Git Commands You'll Use:
```bash
git status              # Check current state
git branch             # List branches
git checkout -b name   # Create new branch
git add .              # Stage changes
git commit -m "msg"    # Commit changes
git merge branch       # Merge branch
git log --oneline      # View history
git revert commit      # Undo commit
```

### Testing Commands:
```bash
npm run dev            # Start dev server
npm run build          # Test build
npm run lint           # Check code style
npm test               # Run tests (when added)
```

## 📞 When You Need Help

### Something Broke?
1. Don't panic! You have backups
2. Run `./scripts/rollback.sh`
3. Review what changed: `git diff`
4. Check console errors in browser
5. Restore from snapshot if needed

### Not Sure How to Fix Something?
1. Check `REFACTORING_ROADMAP.md` for guidance
2. Review the code review document
3. Create an issue to track the problem
4. Take a break and come back fresh

### Want to Verify You're On Track?
```bash
# Check current branch
git branch --show-current

# Check what's changed
git status

# View recent commits
git log --oneline -5

# See all tags (milestones)
git tag
```

## 🎯 Your Immediate Next Steps

Right now, do this:

1. ✅ Run `./scripts/pre-refactor-snapshot.sh`
2. ✅ Verify snapshot was created successfully
3. ✅ Read Phase 1 of `REFACTORING_ROADMAP.md`
4. ✅ Start with "Fix 1.1: Secure Credentials" (described above)
5. ✅ Test thoroughly
6. ✅ Celebrate your first safe refactor! 🎉

## 📊 Progress Tracking

Use this checklist to track your progress:

### Phase 1: Security ⏳
- [ ] 1.1: Credentials secured and rotated
- [ ] 1.2: Supabase client standardized
- [ ] 1.3: API validation added
- [ ] 1.4: Auth pages completed
- [ ] **Milestone:** Tag `v0.1.1` created

### Phase 2: Code Quality ⏳
- [ ] 2.1: Multi-step form component created
- [ ] 2.2: Large components refactored
- [ ] 2.3: `any` types replaced
- [ ] **Milestone:** Tag `v0.1.2` created

### Phase 3: Stability ⏳
- [ ] 3.1: Error boundaries added
- [ ] 3.2: Error handling standardized
- [ ] 3.3: Loading states added
- [ ] **Milestone:** Tag `v0.2.0` created

### Phase 4: Testing ⏳
- [ ] 4.1: Unit tests written
- [ ] 4.2: Integration tests added
- [ ] 4.3: E2E tests implemented
- [ ] **Milestone:** Tag `v0.3.0` created

---

**Remember:** This is a marathon, not a sprint. Take your time, test thoroughly, and don't hesitate to rollback if something doesn't feel right. You have multiple safety nets!

Good luck! 🚀
