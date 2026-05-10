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
        stage('Build Frontend') {
      steps {
        dir('Frontend') {
          bat 'npm ci'
          bat 'npm run build'
        }
      }
    }
    stage('Archive Artifacts') {
      steps {
        archiveArtifacts artifacts: 'Backend/target/*.jar', fingerprint: true
        archiveArtifacts artifacts: 'Frontend/dist/**', fingerprint: true
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
