# Stage 1: Build C++ AVX-512 kernel and Rust binary
FROM rust:1.75-slim-bookworm AS builder

# Install C++ compiler toolchain
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache dependencies
COPY Cargo.toml Cargo.lock ./
COPY build.rs ./
COPY src ./src

# Build release binary targeting host CPU flags (-native / AVX-512)
ENV RUSTFLAGS="-C target-cpu=native"
RUN cargo build --release

# Stage 2: Minimal runtime image
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/ghost_order_book_backend ./ghost-backend

EXPOSE 8080
ENV RUST_LOG=info
ENV PORT=8080
ENTRYPOINT ["./ghost-backend"]