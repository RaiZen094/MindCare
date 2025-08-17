# MindCare Backend Docker Configuration
# Multi-stage build for Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Production runtime stage
FROM eclipse-temurin:21-jre-alpine

# tools for healthcheck
RUN apk add --no-cache wget

# non-root user
RUN addgroup -g 1001 -S spring && adduser -S spring -u 1001
USER spring

WORKDIR /app
COPY --from=build /app/target/*.jar /app/app.jar

# hint port; Render injects $PORT at runtime
EXPOSE 8080
ENV PORT=8080

# healthcheck must use the same $PORT
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider "http://localhost:${PORT}/api/public/health" || exit 1

# bind Spring Boot to the dynamic $PORT
ENTRYPOINT ["sh","-c","java -Djava.security.egd=file:/dev/./urandom -Dserver.address=0.0.0.0 -jar /app/app.jar --server.port=${PORT}"]
