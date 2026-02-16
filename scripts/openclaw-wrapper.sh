#!/usr/bin/env bash
# =============================================================================
# OpenClaw/PicoClaw Command Wrapper
# =============================================================================
# This script ensures commands are run as the correct user
# =============================================================================

# Colors for output
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect upstream (default to openclaw)
UPSTREAM="${UPSTREAM:-openclaw}"
STATE_DIR="/data/.${UPSTREAM}"

# Check if we need to switch users
if [ "$(id -u)" = "0" ] && id "$UPSTREAM" >/dev/null 2>&1; then
    # Running as root, upstream user exists - switch to it
    # Pass arguments using _ "$@" pattern (_ is $0 placeholder, "$@" passes args)
    exec su -s /bin/bash "$UPSTREAM" -c "cd /data && HOME=${STATE_DIR} OPENCLAW_STATE_DIR=${STATE_DIR} exec /usr/local/bin/${UPSTREAM}.real \"\$@\"" _ "$@"
elif [ "$(id -u)" != "0" ] && [ "$(id -un)" != "$UPSTREAM" ] && id "$UPSTREAM" >/dev/null 2>&1; then
    # Not running as root or upstream user, switch to upstream user
    echo -e "${BLUE}[INFO]${NC} Switching to $UPSTREAM user..."
    exec su -s /bin/bash "$UPSTREAM" -c "cd /data && HOME=${STATE_DIR} OPENCLAW_STATE_DIR=${STATE_DIR} exec /usr/local/bin/${UPSTREAM}.real \"\$@\"" _ "$@"
else
    # Already running as correct user or upstream user doesn't exist
    exec "/usr/local/bin/${UPSTREAM}.real" "$@"
fi
