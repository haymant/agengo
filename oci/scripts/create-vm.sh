#!/bin/bash
# ================================================
# OCI A1.Flex Retry Script for VM.Standard.A1.Flex
# Runs until the instance is successfully created
# ================================================

set -euo pipefail

# ================== CONFIGURATION ==================
COMPARTMENT_ID="oocid1.tenancy.oc1..aaaaaaaaqojykb7m4cpmmvcg64yq3ukm4tknx5gj6grcxxfra5fdoifezewq"
SUBNET_ID="ocid1.subnet.oc1.ap-singapore-1.aaaaaaaatmjmocjh3xvq23l26prw7bj3v562ae2t4nnzdantatv2n5uvcqba"
AVAILABILITY_DOMAIN="ap-singapore-1-AD-1"          # Change to AD-2 or AD-3 if needed
DISPLAY_NAME="traco-relay-server"
SHAPE="VM.Standard.A1.Flex"
OCPUS=1                                            # Start small (1 OCPU + 6GB). Increase later if needed
MEMORY_GB=6

IMAGE_ID="ocid1.image.oc1.ap-singapore-1.aaaaaaaa3rjnbq273x5kzisyx6os5r57735jnhytwkmwx7c5gm4ybkvzi2ua"
SSH_PUBLIC_KEY_FILE="$HOME/.ssh/dev@lizhao.net-2026-04-04T15_38_44.011Z_public.pem"

# Optional: Add more ADs for round-robin
AVAILABILITY_DOMAINS=(
  "ap-singapore-1-AD-1"
  "ap-singapore-1-AD-2"
  "ap-singapore-1-AD-3"
)

LOGFILE="a1-flex-creation.log"
SLEEP_SECONDS=30          # Retry every 30 seconds (adjust as needed)
# ===================================================

echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting A1.Flex creation retry loop" | tee -a "$LOGFILE"
echo "Target: $SHAPE | $OCPUS OCPU | ${MEMORY_GB}GB | AD rotation enabled" | tee -a "$LOGFILE"

attempt=0
ad_index=0

while true; do
  attempt=$((attempt + 1))
  current_ad="${AVAILABILITY_DOMAINS[$ad_index]}"
  ad_index=$(( (ad_index + 1) % ${#AVAILABILITY_DOMAINS[@]} ))

  echo "$(date '+%Y-%m-%d %H:%M:%S') - Attempt $attempt | AD: $current_ad" | tee -a "$LOGFILE"

  OUTPUT=$(oci compute instance launch \
    --availability-domain "$current_ad" \
    --compartment-id "$COMPARTMENT_ID" \
    --shape "$SHAPE" \
    --shape-config "{\"ocpus\": $OCPUS, \"memoryInGBs\": $MEMORY_GB}" \
    --display-name "$DISPLAY_NAME" \
    --image-id "$IMAGE_ID" \
    --subnet-id "$SUBNET_ID" \
    --assign-public-ip true \
    --ssh-authorized-keys-file "$SSH_PUBLIC_KEY_FILE" \
    --availability-config '{"recoveryAction": "RESTORE_INSTANCE"}' \
    2>&1)

  EXIT_CODE=$?

  if [ $EXIT_CODE -eq 0 ]; then
    INSTANCE_ID=$(echo "$OUTPUT" | jq -r '.data.id')
    echo "$(date '+%Y-%m-%d %H:%M:%S') - SUCCESS! Instance created." | tee -a "$LOGFILE"
    echo "Instance OCID: $INSTANCE_ID" | tee -a "$LOGFILE"
    echo "You can now monitor it with: oci compute instance get --instance-id $INSTANCE_ID" | tee -a "$LOGFILE"
    exit 0
  else
    # Check if it's a capacity error
    if echo "$OUTPUT" | grep -qE "Out of capacity|Out of host capacity|capacity"; then
      echo "$(date '+%Y-%m-%d %H:%M:%S') - Capacity unavailable. Retrying in $SLEEP_SECONDS seconds..." | tee -a "$LOGFILE"
    else
      echo "$(date '+%Y-%m-%d %H:%M:%S') - Unexpected error:" | tee -a "$LOGFILE"
      echo "$OUTPUT" | tee -a "$LOGFILE"
      echo "Retrying anyway in $SLEEP_SECONDS seconds..." | tee -a "$LOGFILE"
    fi
  fi

  sleep "$SLEEP_SECONDS"
done