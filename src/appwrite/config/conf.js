import { config } from "./config";
import { Client, ID, Databases, Storage, Query } from "appwrite";

export class DatabaseServices {
  client = new Client();
  databases;
  bucket;

  constructor() {
    this.client
      .setEndpoint(config.appwriteURL) // Appwrite API endpoint
      .setProject(config.appwritePROJECTID); // Appwrite Project ID
    this.databases = new Databases(this.client); // Initialize database service
    this.bucket = new Storage(this.client); // Initialize storage service
  }

  // Create a new post
  async createPost({ titles, slug, content, featureImage, status, userID }) {
    try {
      return await this.databases.createDocument(
        config.appwriteDATABASEID,
        config.appwriteCOLLECTIONID,
        slug, // Unique document ID
        { titles, content, featureImage, status, userID }
      );
    } catch (error) {
      console.error("Error creating post:", error);
      throw new Error("Failed to create post.");
    }
  }
  // Update an existing post
  async updatePost(slug, { titles, content, featureImage, status }) {
    try {
      return await this.databases.updateDocument(
        config.appwriteDATABASEID,
        config.appwriteCOLLECTIONID,
        slug,
        { titles, content, featureImage, status }
      );
    } catch (error) {
      console.error("Error updating post:", error);
      throw new Error("Failed to update post.");
    }
  }

  // Delete a post
  async deletePost(slug) {
    try {
      await this.databases.deleteDocument(
        config.appwriteDATABASEID,
        config.appwriteCOLLECTIONID,
        slug
      );
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      return false;
    }
  }

  // Fetch a specific post by its slug
  async getPost(slug) {
    try {
      return await this.databases.getDocument(
        config.appwriteDATABASEID,
        config.appwriteCOLLECTIONID,
        slug
      );
    } catch (error) {
      console.error("Error fetching post:", error);
      return null;
    }
  }

  // Fetch multiple posts with optional queries
  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      return await this.databases.listDocuments(
        config.appwriteDATABASEID,
        config.appwriteCOLLECTIONID,
        queries
      );
    } catch (error) {
      console.error("Error fetching posts:", error);
      return null;
    }
  }

  // Upload a file to the Appwrite bucket
  async uploadFile(file) {
    if (!file) {
      throw new Error("No file provided for upload.");
    }

    try {
      return await this.bucket.createFile(
        config.appwriteBUCKETID, // Bucket ID from config
        ID.unique(), // Generate a unique file ID
        file // File object
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("File upload failed.");
    }
  }

  // Delete a file from the Appwrite bucket
  async deleteFile(fileId) {
    try {
      await this.bucket.deleteFile(config.appwriteBUCKETID, fileId);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  // Get file preview URL
 // Generate file preview URL
getFilePreview(fileId) {
  try {
    const previewURL = `${config.appwriteURL}/storage/buckets/${config.appwriteBUCKETID}/files/${fileId}/preview?project=${config.appwritePROJECTID}`;
    if (previewURL) {
      console.log("Generated Preview URL:", previewURL);
    }    
    return previewURL;
  } catch (error) {
    console.error("Error generating file preview URL:", error);
    return null;
  }
}

}

// Create a singleton instance
const dbservice = new DatabaseServices();
export default dbservice;
