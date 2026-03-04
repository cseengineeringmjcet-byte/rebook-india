import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    onAuthStateChanged,
    User,
} from 'firebase/auth'
import { auth } from './config'
import { createUserDoc, getUserDoc } from './firestore'

export const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    area: string
) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await createUserDoc(cred.user.uid, {
        full_name: fullName,
        email,
        phone,
        area,
        role: 'buyer',
        avatar_url: '',
    })
    return cred.user
}

export const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
}

export const signOutUser = async () => {
    await signOut(auth)
}

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    const userDoc = await getUserDoc(cred.user.uid)
    if (!userDoc) {
        await createUserDoc(cred.user.uid, {
            full_name: cred.user.displayName || '',
            email: cred.user.email || '',
            phone: '',
            area: '',
            role: 'buyer',
            avatar_url: cred.user.photoURL || '',
        })
    }
    return cred.user
}

export const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
}

export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback)
}
