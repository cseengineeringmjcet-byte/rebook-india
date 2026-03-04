const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: 'AIzaSyDAwlYwWmuBEUxS9p-jxp_9KgVAE79fepI',
    authDomain: 'rebookindia-29be8.firebaseapp.com',
    projectId: 'rebookindia-29be8',
    storageBucket: 'rebookindia-29be8.firebasestorage.app',
    messagingSenderId: '1014316461662',
    appId: '1:1014316461662:web:5c5b3037f031d50cabcecf',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const booksSnap = await getDocs(query(collection(db, 'books'), where('is_available', '==', true)));
    console.log("Total books:", booksSnap.docs.length);
    if (booksSnap.docs.length > 0) {
        console.log("Sample book:", booksSnap.docs[0].data());
    }
}
run().catch(console.error).finally(() => process.exit(0));
