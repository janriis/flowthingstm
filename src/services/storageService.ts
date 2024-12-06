import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { v4 as uuid } from 'uuid';

export const storageService = {
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuid()}.${fileExtension}`;
      const fullPath = `${path}/${fileName}`;
      const storageRef = ref(storage, fullPath);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      throw error;
    }
  },

  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      throw error;
    }
  }
};