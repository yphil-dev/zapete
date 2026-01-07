#!/bin/bash
# Flatpak launcher for Zapete

# Set up environment
export PATH="/app/bin:$PATH"

# Change to the application directory
cd "/app/share/zapete"

# Start Zapete
exec npm start