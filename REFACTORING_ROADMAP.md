# Systematic Refactoring Roadmap
**Project:** Business Coaching Platform
**Date Started:** 2025-11-11
**Current State:** v0.1.0 - Working but needs hardening

## Safety-First Approach

### Phase 0: Preparation & Safety Net ✓

#### Step 0.1: Commit Current State
```bash
# Commit current cleanup work
git add .
git commit -m "chore: Clean up archived files before refactoring"
git push origin main
```

#### Step 0.2: Create Backup & Snapshot
```bash
# Create a snapshot tag of current working state
git tag -a v0.1.0-pre-refactor -m "Snapshot before systematic refactoring - WORKING STATE"
git push origin v0.1.0-pre-refactor

# Create development branch for refactoring
git checkout -b refactor/systematic-improvements
```

#### Step 0.3: Document Working Features
- [ ] Document all currently working features
- [ ] Take screenshots of working UI
- [ ] Export sample data from database
- [ ] Document all environment variables needed

---

## Phase 1: CRITICAL SECURITY (Week 1) 🚨

**Branch Strategy:** One branch per fix, merge to `refactor/systematic-improvements`, test, then merge to `main`

### Fix 1.1: Secure Credentials (IMMEDIATE)
**Branch:** `security/rotate-credentials`
**Risk:** LOW (only env changes)
**Rollback:** Restore `.env.local` from backup

```bash
git checkout -b security/rotate-credentials
```

**Steps:**
1. Create `.env.example` template (no real keys)
2. Add `.env.local` to `.gitignore`
3. Rotate Supabase keys (via Supabase dashboard)
4. Rotate OpenAI key (via OpenAI dashboard)
5. Test that app still works with new keys
6. Commit and merge

**Validation:**
- [ ] App loads successfully
- [ ] Can log in
- [ ] Can fetch data from Supabase
- [ ] AI features work with new OpenAI key

**Files Changed:**
- `.gitignore` (add `.env.local`)
- `.env.example` (create new)
- `.env.local` (local only - not committed)

---

### Fix 1.2: Standardize Supabase Client
**Branch:** `refactor/supabase-client-standard`
**Risk:** MEDIUM (changes data access layer)
**Rollback:** Revert commits on branch

```bash
git checkout refactor/systematic-improvements
git checkout -b refactor/supabase-client-standard
```

**Strategy:** Change files ONE AT A TIME, test after each

**Files to Fix (in order):**
1. `src/app/financials/page.tsx` (low risk - single page)
2. `src/app/goals/services/kpi-service.ts` (medium risk - used by goals)
3. Search for remaining instances: `grep -r "from '@supabase/supabase-js'" src/`

**Process per file:**
```bash
# 1. Fix one file
# 2. Test that specific feature works
# 3. Commit with descriptive message
git add src/app/financials/page.tsx
git commit -m "fix: Standardize Supabase client in financials page

- Changed from @supabase/supabase-js to @supabase/ssr
- Tested: financials page loads and displays data
- Related: Issue #1 from code review"

# 4. Repeat for next file
```

**Testing Checklist per file:**
- [ ] File compiles without TypeScript errors
- [ ] Feature loads without console errors
- [ ] Can read data successfully
- [ ] Can write data successfully (if applicable)
- [ ] No hydration errors

---

### Fix 1.3: Add Input Validation to API Routes
**Branch:** `security/api-validation`
**Risk:** LOW-MEDIUM (improves security, might break bad requests)
**Rollback:** Revert branch

```bash
git checkout refactor/systematic-improvements
git checkout -b security/api-validation
```

**Order of implementation:**
1. Create validation utilities (new file - safe)
2. Add to AI assist route (most critical - cost protection)
3. Add to wizard chat route
4. Add to other API routes

**Process:**
1. Create `src/lib/validation/schemas.ts` - NEW FILE (safe)
2. Update one API route at a time
3. Test with real requests after each
4. Document breaking changes (if any)

**Validation per route:**
- [ ] Valid requests still work
- [ ] Invalid requests return 400 errors (not 500)
- [ ] Error messages are helpful
- [ ] No OpenAI/Supabase calls on invalid input

---

### Fix 1.4: Implement Missing Auth Pages
**Branch:** `feature/complete-auth-flow`
**Risk:** LOW (new features, don't affect existing)
**Rollback:** Delete new files

```bash
git checkout refactor/systematic-improvements
git checkout -b feature/complete-auth-flow
```

**Steps:**
1. Create `src/app/auth/signup/page.tsx` - NEW FILE
2. Test signup flow manually
3. Create `src/app/auth/reset-password/page.tsx` - NEW FILE
4. Test reset flow manually
5. Commit both

**Validation:**
- [ ] Can sign up new user
- [ ] Receives confirmation email
- [ ] Can request password reset
- [ ] Can complete password reset
- [ ] Existing login still works

---

## Phase 2: CODE QUALITY (Week 2) 🧹

### Fix 2.1: Extract Reusable Multi-Step Form
**Branch:** `refactor/multi-step-form-component`
**Risk:** LOW (creating new component, not removing old yet)

**Strategy:** Create alongside existing, migrate one page at a time

**Steps:**
1. Create `src/components/forms/MultiStepForm.tsx` - NEW
2. Create `src/components/forms/MultiStepForm.test.tsx` - NEW
3. Migrate business-profile page to use it (keep backup)
4. Test business-profile thoroughly
5. Migrate goals page
6. Remove old implementations

**Safety:** Keep old implementations until new one tested on all pages

---

### Fix 2.2: Refactor Large Components
**Branch:** `refactor/component-size-reduction`
**Risk:** MEDIUM-HIGH (changing core components)

**Order (smallest to largest):**
1. `src/app/assessment/page.tsx` (743 lines) → Split into steps
2. `src/app/business-roadmap/page.tsx` (990 lines) → Split into sections
3. `src/app/business-profile/page.tsx` (1,518 lines) → Split into steps

**Process per component:**
```bash
# Before starting
git checkout refactor/systematic-improvements
git checkout -b refactor/assessment-component
cp src/app/assessment/page.tsx src/app/assessment/page.tsx.BACKUP

# Refactor in small commits
# 1. Extract first sub-component
git add .
git commit -m "refactor: Extract QuestionSection from assessment page"

# 2. Extract second sub-component
# ... commit

# 3. Update main page to use sub-components
# ... commit

# 4. Test entire flow
# If tests pass: delete backup
# If tests fail: restore backup, debug
```

**Testing per refactor:**
- [ ] Feature works identically to before
- [ ] All user interactions work
- [ ] Data saves correctly
- [ ] No console errors
- [ ] Screenshots match previous version

---

### Fix 2.3: Replace `any` Types
**Branch:** `refactor/typescript-strict-types`
**Risk:** LOW-MEDIUM (TypeScript only, might reveal bugs)

**Strategy:** Fix by file, starting with types files

**Order:**
1. Create proper types in `src/types/` directory first (safe)
2. Update one component at a time
3. Run `npm run build` after each to catch errors

**Validation:**
- [ ] `npm run build` succeeds
- [ ] No new TypeScript errors
- [ ] App runs without runtime errors

---

## Phase 3: STABILITY (Week 3) 🛡️

### Fix 3.1: Add Error Boundaries
**Branch:** `feature/error-handling`
**Risk:** LOW (adds safety, doesn't change logic)

**Steps:**
1. Create `src/components/ErrorBoundary.tsx` - NEW
2. Wrap top-level layout
3. Add boundaries to major features
4. Test by forcing errors

---

### Fix 3.2: Standardize Error Handling
**Branch:** `refactor/consistent-error-handling`
**Risk:** MEDIUM (changes error flows)

**Strategy:**
1. Create error utilities (new files - safe)
2. Update API routes one at a time
3. Update components one at a time
4. Test error scenarios after each

---

### Fix 3.3: Add Loading States
**Branch:** `feature/loading-states`
**Risk:** LOW (UI enhancement)

**Steps:**
1. Create skeleton components (new - safe)
2. Add to one page at a time
3. Test loading experience

---

## Phase 4: TESTING (Week 4) 🧪

### Fix 4.1: Add Unit Tests
**Branch:** `test/unit-tests-critical-paths`
**Risk:** NONE (tests don't affect production)

**Priority test files:**
1. `src/lib/services/**.test.ts` - Service layer
2. `src/lib/supabase/database.test.ts` - Database layer
3. Component tests for critical flows

---

## Rollback Procedures

### If Something Breaks During Refactoring:

#### Option 1: Revert Single Commit
```bash
# Find the bad commit
git log --oneline

# Revert it
git revert <commit-hash>
```

#### Option 2: Revert Entire Branch
```bash
# Go back to last good state
git checkout refactor/systematic-improvements
git branch -D refactor/problematic-branch
```

#### Option 3: Nuclear Option (Restore Original)
```bash
# Go back to tagged snapshot
git checkout v0.1.0-pre-refactor

# Create new branch from there
git checkout -b recovery-branch
```

---

## Testing Strategy

### Before ANY merge to main:

**Manual Testing Checklist:**
- [ ] Can log in successfully
- [ ] Dashboard loads with data
- [ ] Can complete business profile
- [ ] Can take assessment
- [ ] Can create goals
- [ ] Can view financials
- [ ] No console errors in browser
- [ ] No TypeScript errors: `npm run build`

**Automated Tests (when added):**
```bash
npm run test
npm run build
```

---

## Branch Merge Strategy

```
feature branches → refactor/systematic-improvements → main

# Only merge to main when entire phase tested
```

**Example workflow:**
```bash
# Work on feature
git checkout -b security/rotate-credentials
# ... make changes ...
git commit -m "security: Rotate API credentials"

# Merge to integration branch
git checkout refactor/systematic-improvements
git merge security/rotate-credentials

# Test everything in integration branch
npm run build
npm run dev
# ... manual testing ...

# If all good, merge to main
git checkout main
git merge refactor/systematic-improvements
git push origin main

# Tag the release
git tag -a v0.1.1 -m "Security improvements complete"
git push origin v0.1.1
```

---

## Progress Tracking

### Phase 1: Critical Security
- [ ] 1.1: Secure credentials
- [ ] 1.2: Standardize Supabase client
- [ ] 1.3: Add API validation
- [ ] 1.4: Complete auth flow

### Phase 2: Code Quality
- [ ] 2.1: Multi-step form component
- [ ] 2.2: Refactor large components
- [ ] 2.3: Replace `any` types

### Phase 3: Stability
- [ ] 3.1: Error boundaries
- [ ] 3.2: Consistent error handling
- [ ] 3.3: Loading states

### Phase 4: Testing
- [ ] 4.1: Unit tests
- [ ] 4.2: Integration tests
- [ ] 4.3: E2E tests

---

## Version Tagging Strategy

- `v0.1.0-pre-refactor` - Current working state (safety snapshot)
- `v0.1.1` - After Phase 1 (Security) complete
- `v0.1.2` - After Phase 2 (Code Quality) complete
- `v0.2.0` - After Phase 3 (Stability) complete
- `v0.3.0` - After Phase 4 (Testing) complete
- `v1.0.0` - Production ready

---

## Daily Workflow

### At Start of Each Work Session:
```bash
# 1. Ensure you're on the right branch
git status

# 2. Pull latest changes
git pull origin main

# 3. Create/checkout feature branch
git checkout -b feature/your-feature-name

# 4. Make changes, test, commit
# 5. Merge to integration branch
```

### At End of Each Work Session:
```bash
# 1. Ensure all changes committed
git status

# 2. Push your branch (backup)
git push origin your-branch-name

# 3. Create note of what's working/not working
echo "Status: Fixed X, Y working, Z needs testing" >> .refactor-notes.md
```

---

## Emergency Contacts & Resources

- **Backup location:** Git tag `v0.1.0-pre-refactor`
- **Database backup:** (Create before starting)
- **This roadmap:** `REFACTORING_ROADMAP.md`
- **Git documentation:** https://git-scm.com/docs

---

## Notes & Decisions

### Decision Log:
- **2025-11-11:** Decided to refactor systematically with feature branches
- **2025-11-11:** Created safety snapshot at `v0.1.0-pre-refactor`

### Issues Encountered:
(Add as you go)

### Wins:
(Celebrate progress!)
