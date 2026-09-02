#!/usr/bin/env python3
"""
Python wrapper for data transformation script - SIH26091 (GramVistaar)
Executes Node.js transform script to process Excel workbooks into data/village_metrics.json.
"""
import subprocess
import sys

def main():
    print("[Python] Running data transformation script...")
    result = subprocess.run(["node", "scripts/transform_data.js"], check=True)
    sys.exit(result.returncode)

if __name__ == "__main__":
    main()
