pipeline {
    agent any

    environment {
        // Vercel token for authentication
        VERCEL_TOKEN = credentials('vercel_token')
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Checkout code from the repository
                git branch: 'main', url: 'https://github.com/your-username/your-repo.git'
            }
        }

        stage('Version Increment') {
            steps {
                script {
                    // Increment the version in package.json
                    sh 'npm version patch -m "Jenkins build: %s"'

                    // Add, commit, and push the new version to Git
                    sh 'git add package.json'
                    sh 'git commit -m "chore: version bump"'
                    sh 'git push origin main'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Install Node.js dependencies
                    sh 'npm install'
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    // Build the project
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                script {
                    // Deploy to Vercel and capture the deployment URL for rollback if needed
                    DEPLOY_URL = sh(script: 'npx vercel --prod --token $VERCEL_TOKEN', returnStdout: true).trim()
                }
            }
        }

        stage('Post-Deployment Test') {
            steps {
                script {
                    // Run tests to validate the deployment (e.g., ping the URL, check status)
                    def responseCode = sh(script: "curl -o /dev/null -s -w \"%{http_code}\" ${DEPLOY_URL}", returnStdout: true).trim()
                    
                    // Check if deployment was successful (status code 200)
                    if (responseCode != '200') {
                        error "Deployment failed with status code: ${responseCode}"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment to Vercel was successful!'
        }
        failure {
            script {
                echo 'Deployment failed. Initiating rollback...'
                
                // Rollback using Vercel's command or revert to previous Git commit
                sh 'npx vercel rollback --token $VERCEL_TOKEN'

                // Revert the version bump if rollback was triggered
                sh 'git reset --hard HEAD~1'
                sh 'git push -f origin main'
            }
        }
    }
}
