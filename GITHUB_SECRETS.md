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

## How to Find / Set These Values

### 1. `VPS_HOST`
Your VPS public IP address. Find it from your cloud provider (AWS EC2, DigitalOcean, Vultr, etc.) or run `curl -4 ifconfig.me` on the server.

### 2. `VPS_SSH_USER`
Run `whoami` on your VPS to get the current user. Usually `root` or `ubuntu`.

### 3. `VPS_SSH_KEY`
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

### 4. `VPS_SSH_PASSPHRASE`
Leave empty if your SSH key has no passphrase. If you set a passphrase when generating the key, enter it here.

### 5. `VPS_SSH_PORT`
Usually `22`. If your VPS uses a custom SSH port, change this accordingly.

## Verification

After adding secrets, push to `main` or `master` branch to trigger the workflow and verify it works.
