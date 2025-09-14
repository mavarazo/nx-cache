#!/bin/bash

# --- Configuration ---
CACHE_DIR="$CACHE_DIR"
TTL_DAYS="${TTL_DAYS:-30}"
STORAGE_THRESHOLD_PERCENT="${STORAGE_THRESHOLD_PERCENT:-80}"
STORAGE_TARGET_PERCENT="${STORAGE_TARGET_PERCENT:-70}"

if [ -z "$CACHE_DIR" ]; then
    echo "cache dir is not set" >&2
    exit 1
fi

# --- Logging ---
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

# --- Step 1: ttl purge ---
find "$CACHE_DIR" -type f -mtime +$TTL_DAYS -print -delete
log "ttl purge done"

# --- Step 2: check storage size ---
USED_SPACE_PERCENT=$(df -P "$CACHE_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
log "current storage used: ${USED_SPACE_PERCENT} %"

# --- Step 3: emergency purge ---
if [[ ${USED_SPACE_PERCENT} -gt ${STORAGE_THRESHOLD_PERCENT} ]]; then
    log "storage threshold reached. starting emergency purge..."
    
    while [[ ${USED_SPACE_PERCENT} -gt ${STORAGE_TARGET_PERCENT} ]]; do
        
        log "purge 100 oldest records..."
        find "$CACHE_DIR" -type f -printf '%A@ %p\n' | sort -n | head -n 100 | cut -d' ' -f2- | xargs -r rm

        # check storage size
        USED_SPACE_PERCENT=$(df -P "$CACHE_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
        log "current storage used: ${USED_SPACE_PERCENT}%"
    done
    log "emergency purge done"
fi

log "housekeeping done"
