echo "Deploying Backend to Cloud Run..."
cd backend
gcloud run deploy linkos-backend --source . --project linkos-myhack-2026 --region asia-southeast1 --allow-unauthenticated --env-vars-file .env --quiet

echo "Building Frontend..."
cd ..\frontend
npm run build

echo "Deploying Frontend to Firebase Hosting..."
firebase deploy --only hosting --project linkos-myhack-2026

cd ..
echo "Full deployment completed successfully!"
