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
                git branch: 'master', url: 'https://github.com/UchihaIthachi/social-media-app'
            }
        }

        stage('Version Increment') {
            steps {
                script {
                    // Increment the version in package.json
                    bat 'npm version patch -m "Jenkins build: %s"'

                    // Add, commit, and push the new version to Git
                    bat 'git add package.json'
                    bat 'git commit -m "chore: version bump"'
                    bat 'git push origin main'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Install Node.js dependencies
                    bat 'npm install'
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    // Build the project
                    bat 'npm run build'
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                script {
                    // Deploy to Vercel and capture the deployment URL for rollback if needed
                    DEPLOY_URL = bat(script: 'npx vercel --prod --token %VERCEL_TOKEN%', returnStdout: true).trim()
                }
            }
        }

        stage('Post-Deployment Test') {
            steps {
                script {
                    // Run tests to validate the deployment (e.g., ping the URL, check status)
                    def responseCode = bat(script: "curl -o NUL -s -w \"%{http_code}\" ${DEPLOY_URL}", returnStdout: true).trim()
                    
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
                bat 'npx vercel rollback --token %VERCEL_TOKEN%'

                // Revert the version bump if rollback was triggered
                bat 'git reset --hard HEAD~1'
                bat 'git push -f origin main'
            }
        }
    }
}
