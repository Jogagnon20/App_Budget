// ================================================
// Storage Service - Gestion du localStorage
// ================================================

class StorageService {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? { key, value } : null;
    } catch (error) {
      console.error('Erreur lecture storage:', error);
      return null;
    }
  }

  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch (error) {
      console.error('Erreur écriture storage:', error);
      throw error;
    }
  }

  async delete(key) {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true };
    } catch (error) {
      console.error('Erreur suppression storage:', error);
      throw error;
    }
  }
}

// Instance globale
window.storage = new StorageService();