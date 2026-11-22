# ==============================================================================
# CivicPulse V2 — Production Multi-Stage Dockerfile
# Optimized for Java 25, Maven, and Render Free Tier (512MB RAM Ceiling)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Stage (Maven + Eclipse Temurin JDK 25)
# ------------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-25 AS builder

WORKDIR /build

# Copy Maven POM file
COPY pom.xml .

# Copy application source code
COPY src ./src

# Build production executable fat-JAR (skipping tests; validated in local CI)
RUN mvn clean package -DskipTests

# ------------------------------------------------------------------------------
# Stage 2: Runtime Stage (Lightweight Eclipse Temurin JRE 25)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:25-jre

WORKDIR /app

# Install curl explicitly for container health check
# (eclipse-temurin:25-jre does not include curl or wget by default)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Create dedicated unprivileged system user and group for security
RUN groupadd -r civicpulse && useradd -r -g civicpulse -m -d /app civicpulse

# Create uploads directory and set non-root ownership
RUN mkdir -p /app/uploads && chown -R civicpulse:civicpulse /app

# Copy the packaged Spring Boot executable JAR from the builder stage
COPY --from=builder /build/target/*.jar /app/app.jar
RUN chown civicpulse:civicpulse /app/app.jar

# Switch to unprivileged runtime user
USER civicpulse

# Render dynamically sets PORT at runtime; default to 8080
ENV PORT=8080

# Conservative JVM memory tuning optimized for Render free-tier instances (512MB RAM limit):
# - MaxRAMPercentage=60.0 caps heap at ~307MB, reserving ~205MB for metaspace, thread stacks, native allocations & OS
# - UseSerialGC minimizes GC thread and memory overhead for single-core / low-memory containers
# - ExitOnOutOfMemoryError ensures prompt, clean container restart if memory limit is breached
# - Non-blocking entropy source for fast cryptographic initialization
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=60.0 -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

# Health check probing the actual Spring Boot /api/health endpoint using the dynamic PORT
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT:-8080}/api/health" || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
