pipeline {
    agent any

    tools {
        maven 'maven3'
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
                    bat 'mvn clean package -DskipTests'
                }
            }
        }
        stage('Build Docker Images') {
            steps {
                script {
                    bat 'docker compose build'
                }
            }
        }
    }

    post {
        always{
            cleanWs()
        }
        success {
            echo 'Build and deployment successful!'
        }
        failure {
            echo 'Build or deployment failed.'
        }
    }
}
