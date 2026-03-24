FROM mcr.microsoft.com/devcontainers/base:bookworm

# Install Node.js 25
RUN curl -fsSL https://deb.nodesource.com/setup_25.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Verify installation
RUN node --version && npm --version
