import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  Auth,
  User,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { firebaseConfig } from './firebase.config';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private readonly app: FirebaseApp;
  private readonly auth: Auth;

  private currentUser: User | null = null;
  private initialized = false;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);

    if (environment.useFirebaseEmulator) {
      connectAuthEmulator(this.auth, 'http://localhost:9099', { disableWarnings: true });
    }

    onAuthStateChanged(this.auth, user => {
      this.currentUser = user;
      this.initialized = true;
    });
  }

  async init(): Promise<boolean> {
    if (this.initialized) {
      return this.currentUser !== null;
    }

    return new Promise<boolean>(resolve => {
      const unsubscribe = onAuthStateChanged(this.auth, user => {
        this.currentUser = user;
        this.initialized = true;
        unsubscribe();
        resolve(user !== null);
      });
    });
  }

  async login(email: string, password: string): Promise<void> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    this.currentUser = userCredential.user;
    this.initialized = true;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUser = null;
  }

  get authenticated(): boolean {
    return this.currentUser !== null;
  }

  get user(): User | null {
    return this.currentUser;
  }

  async getToken(): Promise<string | undefined> {
    if (!this.currentUser) {
      return undefined;
    }

    return this.currentUser.getIdToken();
  }
}
