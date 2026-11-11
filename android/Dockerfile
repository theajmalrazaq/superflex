FROM ubuntu:24.04

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    aapt \
    apksigner \
    zipalign \
    dalvik-exchange \
    openjdk-21-jdk-headless \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
