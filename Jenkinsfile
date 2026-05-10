pipeline {
    agent any

    tools {
        maven 'maven3'
    }

    environment {
        DOCKER_IMAGE_BACKEND = 'justeat-backend'
        DOCKER_IMAGE_FRONTEND = 'justeat-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('Backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('Frontend') {
                    sh 'docker run --rm -v "$PWD":/app -w /app node:20-alpine sh -c "npm ci && npm run build"'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker compose build'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh 'docker compose up -d'
                }
            }
        }
    }

    post {
        success {
            echo 'Build and deployment successful!'
        }
        failure {
            echo 'Build or deployment failed.'
        }
        always {
            cleanWs()
        }
    }
}
