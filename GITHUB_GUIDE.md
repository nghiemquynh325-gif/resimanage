# Hướng dẫn Push Code lên GitHub

## 📋 Các bước thực hiện

### Bước 1: Add tất cả các thay đổi vào Git

```bash
git add .
```

Lệnh này sẽ thêm tất cả files đã thay đổi vào staging area.

---

### Bước 2: Commit các thay đổi

```bash
git commit -m "feat: major updates - filters, delete post, events attendees, cleanup"
```

**Hoặc commit message chi tiết hơn**:

```bash
git commit -m "feat: comprehensive updates

- Added resident filtering (age, gender, special status)
- Implemented delete post feature with dropdown menu
- Added attendees field to events
- Fixed RLS policies for posts and events
- Code cleanup and JSDoc documentation
- Created ARCHITECTURE.md for handoff"
```

---

### Bước 3: Kiểm tra remote repository

Kiểm tra xem đã có remote GitHub chưa:

```bash
git remote -v
```

**Nếu chưa có remote**, thêm remote (thay `YOUR_USERNAME` và `YOUR_REPO` bằng thông tin thực):

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

**Nếu đã có remote**, bỏ qua bước này.

---

### Bước 4: Push code lên GitHub

**Lần đầu tiên** (nếu branch main chưa được push):

```bash
git push -u origin main
```

**Các lần sau**:

```bash
git push
```

---

## 🔐 Xử lý Authentication

Khi push lần đầu, GitHub sẽ yêu cầu authentication:

### Option 1: Personal Access Token (Khuyến nghị)

1. Vào GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Chọn scopes: `repo` (full control of private repositories)
4. Copy token
5. Khi Git hỏi password, paste token vào

### Option 2: GitHub CLI

```bash
# Install GitHub CLI nếu chưa có
winget install --id GitHub.cli

# Login
gh auth login

# Push
git push
```

---

## 📦 Files quan trọng cần commit

Dựa trên `git status`, các files sau sẽ được commit:

### New Files (Untracked)
- `ARCHITECTURE.md` - Architecture documentation
- `fix_events_rls.sql` - Fix RLS for events
- `fix_posts_rls.sql` - Fix RLS for posts  
- `add_attendees_to_events.sql` - Add attendees column
- `tailwind.config.js` - Tailwind config

### Modified Files
- `components/feed/NewsFeed.tsx` - Removed console.error
- `components/feed/CreatePostForm.tsx` - Removed console.error
- `components/feed/PostCard.tsx` - Added delete feature + JSDoc
- `components/events/CreateEventModal.tsx` - Added attendees + JSDoc
- `pages/admin/residents/index.tsx` - Enhanced filters
- `utils/mockApi.ts` - Added deletePost, attendees support
- `types.ts` - Updated CalendarEvent type

---

## 🚫 Files nên ignore (.gitignore)

Đảm bảo `.gitignore` có các entries sau:

```
# Dependencies
node_modules/

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Temporary files
*.tmp
*.temp
```

---

## 📝 Commit Message Convention

Sử dụng conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Ví dụ**:
```bash
git commit -m "feat: add delete post functionality"
git commit -m "fix: resolve RLS policy error for events"
git commit -m "docs: add ARCHITECTURE.md"
```

---

## 🔄 Workflow đầy đủ

```bash
# 1. Check status
git status

# 2. Add all changes
git add .

# 3. Commit with message
git commit -m "feat: major updates - see description for details"

# 4. Push to GitHub
git push

# Nếu lần đầu:
# git push -u origin main
```

---

## ⚠️ Lưu ý quan trọng

### 1. Không commit sensitive data
- ❌ Không commit `.env` files
- ❌ Không commit API keys, passwords
- ❌ Không commit Supabase credentials

### 2. Kiểm tra trước khi push
```bash
# Xem những gì sẽ được commit
git diff --staged

# Xem commit history
git log --oneline -5
```

### 3. Nếu commit nhầm
```bash
# Undo commit cuối (giữ changes)
git reset --soft HEAD~1

# Undo commit và changes
git reset --hard HEAD~1
```

---

## 🎯 Next Steps sau khi push

1. **Tạo README.md** với:
   - Project description
   - Installation instructions
   - Environment setup
   - Screenshots

2. **Tạo .env.example**:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Add GitHub Actions** (optional):
   - Auto deploy to Vercel/Netlify
   - Run tests on PR

4. **Create Releases**:
   - Tag versions: `v1.0.0`
   - Write release notes

---

## 🆘 Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Error: "failed to push some refs"
```bash
# Pull changes first
git pull origin main --rebase

# Then push
git push
```

### Error: "Permission denied"
- Check your GitHub token
- Make sure you have write access to the repo

---

## ✅ Checklist

- [ ] `git add .` - Add all changes
- [ ] `git commit -m "message"` - Commit with message
- [ ] `git remote -v` - Check remote
- [ ] `git push` - Push to GitHub
- [ ] Verify on GitHub website
- [ ] Create README.md
- [ ] Add .env.example
- [ ] Update repository description

---

**Chúc bạn thành công! 🚀**
