FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy the pre-built JAR (run: mvn package -DskipTests before docker build)
COPY target/*.jar app.jar

EXPOSE 8090

ENTRYPOINT ["java", "-jar", "app.jar"]
