FROM ubuntu:22.04

# Prevent interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive

# Install GNU Octave and gnuplot (for headless plotting)
RUN apt-get update && \
    apt-get install -y octave gnuplot && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /workspace

# By default, run octave in CLI mode
CMD ["octave", "--no-gui"]
