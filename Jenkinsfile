pipeline {
    agent any
    tools {
        nodejs 'nodejs-22.8.0' // Make sure this version is installed in Jenkins
    }
    environment {
        VERCEL_TOKEN = credentials('vercel_token') // Jenkins credential ID for Vercel token
    }
    stages {
        stage("Init") {
            steps {
                script {
                    echo "Pipeline initiated by ${params.NAME}"

                    // Print Node.js and npm versions
                    bat 'node --version'
                    bat 'npm --version'
                    
                    // Check for package.json
                    if (!fileExists('package.json')) {
                        error "package.json not found"
                    }
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                script {
                    bat 'npm install --legacy-peer-deps'
                }
            }
        }

        stage("Build Project") {
            steps {
                script {
                    // Build the project
                    bat 'npm run build'
                }
            }
        }
        stage("Deploy to Vercel") {
            steps {
                script {
                    try {
                        // Deploy to Vercel
                        bat """
                            vercel --token $VERCEL_TOKEN --prod --confirm
                        """
                    } catch (Exception e) {
                        echo "Deployment to Vercel failed: ${e.message}"
                        currentBuild.result = 'FAILURE'
                        error "Deployment to Vercel failed"
                    }
                }
            }
        }
    }
    post {
        failure {
            script {
                echo "Pipeline failed. Initiating rollback..."

                try {
                    // Rollback the Vercel deployment to the previous production deployment
                    echo "Rolling back to the previous Vercel deployment..."
                    bat """
                        vercel rollback --token $VERCEL_TOKEN
                    """
                } catch (Exception e) {
                    echo "Rollback failed: ${e.message}"
                }
            }
        }
        success {
            echo 'Pipeline executed successfully!'
        }
    }
}
