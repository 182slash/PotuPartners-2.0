#!/usr/bin/env bash
# =============================================================================
# setup.sh — PotuPartners VPS Provisioning Script
# Target: Ubuntu 22.04 LTS on DigitalOcean (4GB RAM / 2 vCPU minimum)
#
# Usage (run as root on fresh droplet):
#   curl -fsSL https://raw.githubusercontent.com/your-org/potupartners/main/scripts/setup.sh | sudo bash
#
# Or copy to server and run:
#   chmod +x setup.sh && sudo bash setup.sh
# =============================================================================
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
APP_USER="potupartners"
APP_DIR="/opt/potupartners"
LOG_DIR="/var/log/potupartners"
DOMAIN="api.potupartners.site"
NODE_VERSION="20"
PYTHON_VERSION="3.11"
NGINX_SITE="potupartners"

# Colours
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}→${NC} $*"; }
success() { echo -e "${GREEN}✅${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠️ ${NC} $*"; }
error()   { echo -e "${RED}❌${NC} $*"; exit 1; }

# ─── Guard: must run as root ──────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
    error "This script must be run as root. Use: sudo bash setup.sh"
fi

echo ""
echo "══════════════════════════════════════════════════════"
echo "  PotuPartners — VPS Setup"
echo "  Target: Ubuntu 22.04 LTS"
echo "══════════════════════════════════════════════════════"
echo ""

# =============================================================================
# STEP 1 — System update
# =============================================================================
info "Updating system packages..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq
apt-get install -y -qq \
    curl wget git unzip build-essential \
    software-properties-common apt-transport-https \
    ca-certificates gnupg lsb-release \
    fail2ban ufw snapd \
    libmupdf-dev libffi-dev libssl-dev \
    postgresql-client
success "System packages updated"

# =============================================================================
# STEP 2 — Create app user
# =============================================================================
info "Creating app user: $APP_USER"
if ! id "$APP_USER" &>/dev/null; then
    useradd --system --create-home --shell /bin/bash "$APP_USER"
    success "User $APP_USER created"
else
    warn "User $APP_USER already exists — skipping"
fi

# =============================================================================
# STEP 3 — UFW Firewall
# =============================================================================
info "Configuring UFW firewall..."
ufw --force reset > /dev/null
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh         comment 'SSH'
ufw allow 80/tcp      comment 'HTTP'
ufw allow 443/tcp     comment 'HTTPS'
# Block direct access to internal ports from outside
ufw deny 4000         comment 'Block direct API access (use Nginx)'
ufw deny 8000         comment 'Block direct RAG access (internal only)'
ufw --force enable
success "Firewall configured"

# =============================================================================
# STEP 4 — Fail2Ban
# =============================================================================
info "Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime    = 3600
findtime   = 600
maxretry   = 5
ignoreip   = 127.0.0.1/8

[sshd]
enabled  = true
port     = ssh
logpath  = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled  = true
port     = http,https
logpath  = /var/log/nginx/error.log

[nginx-limit-req]
enabled  = true
filter   = nginx-limit-req
action   = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath  = /var/log/nginx/potupartners-error.log
findtime = 600
maxretry = 30
EOF
systemctl enable fail2ban --quiet
systemctl restart fail2ban
success "Fail2Ban configured"

# =============================================================================
# STEP 5 — Node.js 20
# =============================================================================
info "Installing Node.js ${NODE_VERSION}..."
if ! command -v node &>/dev/null || [[ $(node --version | cut -d. -f1 | tr -d 'v') -lt $NODE_VERSION ]]; then
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - > /dev/null
    apt-get install -y nodejs > /dev/null
    success "Node.js $(node --version) installed"
else
    success "Node.js $(node --version) already installed"
fi

# Install global npm tools
info "Installing global npm tools (pm2, typescript)..."
npm install -g pm2 typescript ts-node --silent
success "PM2 $(pm2 --version) installed"

# =============================================================================
# STEP 6 — Python 3.11
# =============================================================================
info "Installing Python ${PYTHON_VERSION}..."
if ! python3 --version 2>/dev/null | grep -q "$PYTHON_VERSION"; then
    add-apt-repository -y ppa:deadsnakes/ppa > /dev/null
    apt-get update -qq
    apt-get install -y "python${PYTHON_VERSION}" "python${PYTHON_VERSION}-venv" "python${PYTHON_VERSION}-dev" pip
    update-alternatives --install /usr/bin/python3 python3 "/usr/bin/python${PYTHON_VERSION}" 1
    success "Python $(python3 --version) installed"
else
    success "Python $(python3 --version) already installed"
fi

# =============================================================================
# STEP 7 — Nginx
# =============================================================================
info "Installing Nginx..."
apt-get install -y nginx > /dev/null
systemctl enable nginx --quiet
# Remove default site
rm -f /etc/nginx/sites-enabled/default
success "Nginx $(nginx -v 2>&1 | grep -oP 'nginx/\K[^ ]+')" installed

# =============================================================================
# STEP 8 — Certbot (Let's Encrypt)
# =============================================================================
info "Installing Certbot..."
snap install --classic certbot > /dev/null
ln -sf /snap/bin/certbot /usr/bin/certbot
success "Certbot installed"

# =============================================================================
# STEP 9 — App directory structure
# =============================================================================
info "Creating application directories..."
mkdir -p "$APP_DIR"/{backend,rag-service,logs,backups,nginx-cache}
mkdir -p "$APP_DIR/rag-service/chroma_db"
mkdir -p "$LOG_DIR"
touch "$LOG_DIR"/{api-out.log,api-error.log,api-combined.log,rag-out.log,rag-error.log,rag-combined.log}
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$LOG_DIR"
success "Directories created at $APP_DIR"

# =============================================================================
# STEP 10 — Python virtual environment
# =============================================================================
info "Creating Python virtual environment for RAG service..."
if [[ ! -d "$APP_DIR/rag-service/venv" ]]; then
    sudo -u "$APP_USER" python3 -m venv "$APP_DIR/rag-service/venv"
    sudo -u "$APP_USER" "$APP_DIR/rag-service/venv/bin/pip" install --upgrade pip setuptools wheel --quiet
    success "Python venv created at $APP_DIR/rag-service/venv"
else
    warn "Python venv already exists — skipping"
fi

# =============================================================================
# STEP 11 — PM2 startup on reboot
# =============================================================================
info "Configuring PM2 to start on boot..."
env PATH=$PATH:/usr/bin pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" --silent | tail -1 | bash
success "PM2 startup configured"

# =============================================================================
# STEP 12 — Log rotation
# =============================================================================
info "Configuring log rotation..."
cat > /etc/logrotate.d/potupartners << EOF
$LOG_DIR/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    su $APP_USER $APP_USER
}

/var/log/nginx/potupartners-*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \$(cat /var/run/nginx.pid)
        fi
    endscript
}
EOF
success "Log rotation configured (14-day retention)"

# =============================================================================
# STEP 13 — SSH hardening
# =============================================================================
info "Hardening SSH configuration..."
SSHD_CONFIG="/etc/ssh/sshd_config"
# Backup
cp "$SSHD_CONFIG" "${SSHD_CONFIG}.bak.$(date +%Y%m%d)"
# Apply settings (use sed to update or append)
declare -A SSH_SETTINGS=(
    ["PermitRootLogin"]="no"
    ["PasswordAuthentication"]="no"
    ["PubkeyAuthentication"]="yes"
    ["X11Forwarding"]="no"
    ["MaxAuthTries"]="3"
    ["ClientAliveInterval"]="300"
    ["ClientAliveCountMax"]="2"
)
for key in "${!SSH_SETTINGS[@]}"; do
    value="${SSH_SETTINGS[$key]}"
    if grep -qE "^#?${key}" "$SSHD_CONFIG"; then
        sed -i "s/^#*${key}.*/${key} ${value}/" "$SSHD_CONFIG"
    else
        echo "${key} ${value}" >> "$SSHD_CONFIG"
    fi
done
# Test config before restarting
if sshd -t 2>/dev/null; then
    systemctl restart sshd
    success "SSH hardened (root login disabled, password auth disabled)"
else
    warn "SSH config test failed — reverting to backup"
    cp "${SSHD_CONFIG}.bak.$(date +%Y%m%d)" "$SSHD_CONFIG"
fi

# =============================================================================
# STEP 14 — System limits (for Socket.io connections)
# =============================================================================
info "Adjusting system limits for WebSocket connections..."
cat >> /etc/security/limits.conf << 'EOF'

# PotuPartners — allow many simultaneous connections
potupartners soft nofile 65536
potupartners hard nofile 65536
EOF

cat >> /etc/sysctl.conf << 'EOF'

# PotuPartners tuning
net.core.somaxconn = 65536
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.ip_local_port_range = 1024 65535
fs.file-max = 200000
EOF
sysctl -p > /dev/null
success "System limits adjusted"

# =============================================================================
# Done!
# =============================================================================
echo ""
echo "══════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅  Base VPS setup complete!${NC}"
echo ""
echo "  NEXT STEPS (in order):"
echo ""
echo "  1. Upload environment files:"
echo "     scp backend/.env $APP_USER@<IP>:$APP_DIR/backend/.env"
echo "     scp rag-service/.env $APP_USER@<IP>:$APP_DIR/rag-service/.env"
echo ""
echo "  2. Clone or rsync source code:"
echo "     rsync -avz --exclude=node_modules backend/ $APP_USER@<IP>:$APP_DIR/backend/"
echo "     rsync -avz --exclude=venv rag-service/ $APP_USER@<IP>:$APP_DIR/rag-service/"
echo ""
echo "  3. Install dependencies and build:"
echo "     ssh $APP_USER@<IP> 'cd $APP_DIR/backend && npm ci && npm run build && npm run migrate'"
echo "     ssh $APP_USER@<IP> 'cd $APP_DIR/rag-service && source venv/bin/activate && pip install -r requirements.txt'"
echo ""
echo "  4. Install Nginx config:"
echo "     scp nginx/potupartners.conf $APP_USER@<IP>:/tmp/"
echo "     ssh root@<IP> 'cp /tmp/potupartners.conf /etc/nginx/sites-available/$NGINX_SITE'"
echo "     ssh root@<IP> 'ln -s /etc/nginx/sites-available/$NGINX_SITE /etc/nginx/sites-enabled/'"
echo "     ssh root@<IP> 'nginx -t && systemctl reload nginx'"
echo ""
echo "  5. Obtain SSL certificate:"
echo "     ssh root@<IP> 'certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m ssl@potupartners.site'"
echo ""
echo "  6. Start services:"
echo "     scp ecosystem.config.js $APP_USER@<IP>:$APP_DIR/"
echo "     ssh $APP_USER@<IP> 'cd $APP_DIR && pm2 start ecosystem.config.js --env production && pm2 save'"
echo ""
echo "  7. Seed the database:"
echo "     ssh $APP_USER@<IP> 'cd $APP_DIR/backend && ADMIN_PASSWORD=YourSecurePass123 npx ts-node src/scripts/seed.ts'"
echo ""
echo "  8. Verify:"
echo "     curl https://$DOMAIN/health"
echo ""
echo "══════════════════════════════════════════════════════"
