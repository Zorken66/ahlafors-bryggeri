#!/usr/bin/env bash
set -u

LOG_FILE="/var/www/ahlafors-bryggerier/shared/logs/pm2-watchdog.log"
LOCK_FILE="/tmp/ahlafors-pm2-watchdog.lock"
STATE_DIR="/var/www/ahlafors-bryggerier/shared/state"
LAST_RESTART_FILE="$STATE_DIR/pm2-watchdog-last-restart"
PM2_SERVICE="pm2-deploy"
RESTART_COOLDOWN_SECONDS="900"

DOMAINS=(
  "https://ahlaforsfabriker.se/"
  "https://ahlaforsgym.se/"
  "https://ahlaforsbryggerier.se/"
)

PORTS=(
  "3000"
  "3001"
  "3002"
)

mkdir -p "$(dirname "$LOG_FILE")" "$STATE_DIR"

log() {
  printf '%s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" >> "$LOG_FILE"
}

check_port() {
  local port="$1"
  curl -fsS -I --max-time 8 "http://127.0.0.1:${port}/" >/dev/null 2>&1
}

check_domain() {
  local url="$1"
  curl -fsS -I --max-time 12 "$url" >/dev/null 2>&1
}

collect_failures() {
  local failed=0

  if ! systemctl is-active --quiet "$PM2_SERVICE"; then
    log "FAIL service $PM2_SERVICE is not active"
    failed=1
  fi

  for port in "${PORTS[@]}"; do
    if ! check_port "$port"; then
      log "FAIL local port $port"
      failed=1
    fi
  done

  for domain in "${DOMAINS[@]}"; do
    if ! check_domain "$domain"; then
      log "FAIL public URL $domain"
      failed=1
    fi
  done

  return "$failed"
}

restart_pm2_service() {
  local now
  local last_restart
  local age

  now="$(date -u '+%s')"
  last_restart="0"

  if [[ -f "$LAST_RESTART_FILE" ]]; then
    last_restart="$(cat "$LAST_RESTART_FILE" 2>/dev/null || printf '0')"
  fi

  if [[ "$last_restart" =~ ^[0-9]+$ ]]; then
    age=$((now - last_restart))
    if (( age < RESTART_COOLDOWN_SECONDS )); then
      log "ACTION skipped restart for $PM2_SERVICE due to cooldown age=${age}s cooldown=${RESTART_COOLDOWN_SECONDS}s"
      return 0
    fi
  fi

  log "ACTION restarting $PM2_SERVICE"
  if sudo -n systemctl restart "$PM2_SERVICE" >> "$LOG_FILE" 2>&1; then
    printf '%s\n' "$now" > "$LAST_RESTART_FILE"
    return 0
  fi

  log "ACTION restart failed for $PM2_SERVICE"
  return 1
}

(
  flock -n 9 || exit 0

  if collect_failures; then
    exit 0
  fi

  restart_pm2_service || exit 1
  sleep 10

  if collect_failures; then
    log "RECOVERY ok"
    exit 0
  fi

  log "RECOVERY failed"
  exit 1
) 9>"$LOCK_FILE"
