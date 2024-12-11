import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC_yikHGuxdFY9ts0CSRGBe9svJpimR70U",
    authDomain: "association-game-d4d53.firebaseapp.com",
    projectId: "association-game-d4d53",
    storageBucket: "association-game-d4d53.appspot.com",
    messagingSenderId: "375271186328",
    appId: "1:375271186328:web:4924b092f739e5c41415ed",
    measurementId: "G-RKHZQTHHJG"
};


firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

db.getLobbyDocRef = async (lobbyId) => {
    try {
        const querySnapshot = await db.collection('lobbies')
            .where('lobbyId', '==', lobbyId)
            .get();

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].ref;
        } else {
            console.error('Lobby mit dieser ID wurde nicht gefunden.');
            return null;
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Lobby-Daten:', error);
        return null;
    }
};

export { db };