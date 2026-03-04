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

async function checkIds() {
    const vendorsSnap = await db.collection("vendors").get();
    console.log("VENDORS:");
    vendorsSnap.docs.forEach(doc => {
        console.log(doc.id, "=>", doc.data().shop_name || doc.data().shopName);
    });

    const booksSnap = await db.collection("books").get();
    console.log("\nBOOKS:");
    const counts = {};
    booksSnap.docs.forEach(doc => {
        const vId = doc.data().vendor_id || doc.data().vendorId;
        counts[vId] = (counts[vId] || 0) + 1;
    });
    console.log("Books per vendor ID:", counts);
    process.exit(0);
}

checkIds();
