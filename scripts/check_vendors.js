require("dotenv").config({ path: ".env.local" });
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

const app = initializeApp({
    credential: cert(serviceAccount)
});
const db = getFirestore(app);

async function checkVendors() {
    const snap = await db.collection("vendors").limit(3).get();
    snap.docs.forEach(doc => {
        console.log(doc.id, "=>", doc.data());
    });
    process.exit(0);
}

checkVendors();
