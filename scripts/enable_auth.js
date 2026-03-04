require("dotenv").config({ path: ".env.local" });
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

const app = initializeApp({
    credential: cert(serviceAccount)
});

async function enableEmailPassword() {
    try {
        const auth = getAuth(app);
        await auth.projectConfigManager().updateProjectConfig({
            signIn: {
                email: {
                    enabled: true,
                    passwordRequired: true,
                },
            },
        });
        console.log("Successfully enabled Email/Password sign-in provider!");
        process.exit(0);
    } catch (error) {
        console.error("Error updating project config:", error);
        process.exit(1);
    }
}

enableEmailPassword();
