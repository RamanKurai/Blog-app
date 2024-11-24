import { config } from "../config/config";
import { Client, Account, ID } from "appwrite";

export class AuthService {
  constructor() {
    this.client = new Client()
      .setEndpoint(config.appwriteURL)  // Set endpoint from config
      .setProject(config.appwritePROJECTID); // Set project ID from config
    this.account = new Account(this.client);
  }

  async createAccount({ email, password, name }) {
    try {
      const userAccount = await this.account.create(ID.unique(), email, password, name);
      // Automatically log in the user after account creation
      await this.account.createEmailPasswordSession(email, password); 
      return userAccount;
    } catch (error) {
      console.error("Appwrite Server Error in createAccount:", error);
      throw error;
    }
  }
  
  

  async login({ email, password }) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.error("Appwrite Server Error in signin:", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      console.error("Appwrite Server Error in getCurrentUser:", error);
      throw error;
    }
  }

  async logout() {
    try {
      return await this.account.deleteSessions();
    } catch (error) {
      console.error("Appwrite Server Error in logout:", error);
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;
