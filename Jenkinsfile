// Load the shared library from GitHub
library identifier: "shared-lib@main", retriever: modernSCM(
    [
        $class       : 'GitSCMSource',
        remote       : 'https://github.com/UchihaIthachi/jenkins-shared-library',
        credentialsId: 'github-pat',
    ]
)

pipeline {
    agent any
    tools {
        nodejs 'nodejs-22.8.0' // Ensure this version is installed in Jenkins
    }
    environment {
        POSTGRES_URL = credentials('postgres_url')
        POSTGRES_PRISMA_URL = credentials('postgres_prisma_url')
        POSTGRES_URL_NO_SSL = credentials('postgres_url_no_ssl')
        POSTGRES_URL_NON_POOLING = credentials('postgres_url_non_pooling')
        POSTGRES_USER = credentials('postgres_user')
        POSTGRES_HOST = credentials('postgres_host')
        POSTGRES_PASSWORD = credentials('postgres_password')
        POSTGRES_DATABASE = credentials('postgres_database')
        UPLOADTHING_SECRET = credentials('uploadthing_secret')
        NEXT_PUBLIC_UPLOADTHING_APP_ID = credentials('next_public_uploadthing_app_id')
        NEXT_PUBLIC_STREAM_KEY = credentials('next_public_stream_key')
        STREAM_SECRET = credentials('stream_secret')
        CRON_SECRET = credentials('cron_secret')
        VERCEL_TOKEN = credentials('vercel_token') // Use your simple ID here
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
                    echo "package.json contents: ${readFile('package.json')}"

                    // Load script.groovy for Windows
                    if (fileExists('script.groovy')) {
                        script = load "script.groovy"
                        echo "script.groovy found"
                    } else {
                        error "script.groovy not found"
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
        stage('Install Vercel CLI and Verify Vercel Installation') {
            steps {
                script {
                    bat 'npm install -g vercel@latest'
                    bat 'vercel --version'
                }
            }
        }

        stage("Build Project") {
            steps {
                script {
                    // Write the secrets to a `.env` file
                    def envContent = """
POSTGRES_URL=${POSTGRES_URL}
POSTGRES_PRISMA_URL=${POSTGRES_PRISMA_URL}
POSTGRES_URL_NO_SSL=${POSTGRES_URL_NO_SSL}
POSTGRES_URL_NON_POOLING=${POSTGRES_URL_NON_POOLING}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_HOST=${POSTGRES_HOST}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DATABASE=${POSTGRES_DATABASE}
UPLOADTHING_SECRET=${UPLOADTHING_SECRET}
NEXT_PUBLIC_UPLOADTHING_APP_ID=${NEXT_PUBLIC_UPLOADTHING_APP_ID}
NEXT_PUBLIC_STREAM_KEY=${NEXT_PUBLIC_STREAM_KEY}
STREAM_SECRET=${STREAM_SECRET}
CRON_SECRET=${CRON_SECRET}
VERCEL_TOKEN=${VERCEL_TOKEN}
"""
                    // Create the .env file
                    writeFile file: '.env', text: envContent
                    
                    // Run the build command
                    bat 'npm run build'
                }
            }
        }

        stage("Increment Version") {
            steps {
                script {
                    // Ensure the method is called from the loaded script
                    def newVersion = script.versionIncrement()
                    env.IMAGE_TAG = newVersion
                    echo "New Image Version Tag is ${env.IMAGE_TAG}"
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
            script {
                echo 'Pipeline executed successfully!'
                script.commitVersionUpdate()
            }
        }
    }
}
