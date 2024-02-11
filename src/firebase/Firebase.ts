import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import {firebaseConfig} from "./FirebaseConfig";

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app)
export const auth = getAuth(app)
export const analytics = getAnalytics(app);