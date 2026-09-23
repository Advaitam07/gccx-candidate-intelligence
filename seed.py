#!/usr/bin/env python3
"""
Root convenience wrapper for seeding the database.
Usage: python seed.py
"""
import os
import sys

# Ensure project root is in python path
ROOT = os.path.dirname(os.path.abspath(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from backend.seed import seed_database

if __name__ == "__main__":
    seed_database()
