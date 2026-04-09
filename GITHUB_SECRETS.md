# GitHub Actions Secrets

Add these secrets in **Settings → Secrets and variables → Actions** of your GitHub repository.

## Required Secrets

| Secret Name | Description | Example / Notes |
|-------------|-------------|-----------------|
| `VPS_HOST` | VPS server IP address or hostname | `203.0.113.42` or `vps.example.com` |
| `VPS_SSH_USER` | SSH username on the VPS | `root` |
| `VPS_SSH_KEY` | **Private** SSH private key for connecting to VPS | Paste the full `-----BEGIN OPENSSH PRIVATE KEY----- ... -----END OPENSSH PRIVATE KEY-----` |
| `VPS_SSH_PASSPHRASE` | Passphrase for the SSH key (if any) | Leave empty if key has no passphrase |
| `VPS_SSH_PORT` | SSH port number (optional, defaults to `22`) | `22` |
| `SSL_EMAIL` | Email for Let's Encrypt SSL certificate registration | `admin@docimal.site` |
| `FRONTEND_ENV` | Nội dung file `.env` cho frontend (mỗi dòng một `KEY=VALUE`) | (xem bên dưới) |
| `BACKEND_ENV` | Nội dung file `.env` cho backend (mỗi dòng một `KEY=VALUE`) | (xem bên dưới) |

---

## `VPS_HOST`

Your VPS public IP address. Find it from your cloud provider (AWS EC2, DigitalOcean, Vultr, etc.) or run on the server:

```bash
curl -4 ifconfig.me
```

---

## `VPS_SSH_USER`

Run `whoami` on your VPS to get the current user. Usually `root` or `ubuntu`.

---

## `VPS_SSH_KEY`

On your **local machine** (not the server), run:

```bash
# List existing keys
ls ~/.ssh/

# Generate a new key if needed (recommended)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github-actions
cat ~/.ssh/github-actions.pub   # ← add this to VPS ~/.ssh/authorized_keys
```

Then paste the **private key** content (the one without `.pub`) into the secret:

```bash
cat ~/.ssh/github-actions
# Copy everything including -----BEGIN... and -----END... lines
```

On the VPS, add the public key to `~/.ssh/authorized_keys`:

```bash
echo "ssh-ed25519 AAAA... github-actions-deploy" >> ~/.ssh/authorized_keys
```

---

## `VPS_SSH_PASSPHRASE`

Leave empty if your SSH key has no passphrase. If you set a passphrase when generating the key, enter it here.

---

## `VPS_SSH_PORT`

Usually `22`. If your VPS uses a custom SSH port, change this accordingly.

---

## `SSL_EMAIL`

Email address used when registering/renewing the Let's Encrypt SSL certificate via certbot. certbot sends expiry notices to this address.

---

## `FRONTEND_ENV`

Là **toàn bộ nội dung file `.env.production`** của frontend, mỗi dòng một `KEY=VALUE`. Ví dụ:

```
NEXT_PUBLIC_API_URL=https://demo.docimal.site/api
NEXT_PUBLIC_APP_URL=https://demo.docimal.site
NEXT_PUBLIC_APP_NAME=Apple Store Demo
```

### Cách lấy giá trị

Trên máy local, xem file `.env.production` của frontend rồi copy toàn bộ nội dung:

```bash
cat /path/to/frontend/.env.production
```

Paste kết quả vào secret `FRONTEND_ENV` (giữ nguyên format `KEY=VALUE`, mỗi dòng một biến).

> **Lưu ý:** Không để dòng trống thừa ở cuối file trong secret. GitHub Actions sẽ ghi đúng nội dung vào file `.env` trên VPS.

---

## `BACKEND_ENV`

Là **toàn bộ nội dung file `.env`** của backend. Ví dụ:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/apple_store
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
PORT=3001
```

### Cách lấy giá trị

```bash
cat /path/to/backend/.env
```

Paste kết quả vào secret `BACKEND_ENV`.

> **Lưu ý:** Không để ký tự xuống dòng thừa ở cuối file trong secret.

---

## Sau khi thêm secrets

Push lên nhánh `main` hoặc `dev` để kích hoạt workflow, hoặc chạy thủ công từ **Actions → Deploy to VPS → Run workflow**.

### Deployment Flow

1. **Build & Push** → Docker images built and pushed to GHCR
2. **SSL Certificate** → certbot requests/renews certs via standalone on port 8888 (avoids port 80 conflict with docimal-client)
3. **Deploy via SSH** → VPS pulls images, runs `docker compose`
4. **Public ports**: HTTP → `8073`, HTTPS → `8074`
5. **Domain**: `https://demo.docimal.site:8074`
6. **API**: `https://demo.docimal.site:8074/api`

### DNS Requirement

Trước khi deploy lần đầu, đảm bảo DNS record cho `demo.docimal.site` trỏ về VPS IP (`VPS_HOST`).
