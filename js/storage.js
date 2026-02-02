// Storage wrapper using localStorage
window.storage = {
  get: async (key) => {
    const value = localStorage.getItem(key);
    return value ? { key, value } : null;
  },
  set: async (key, value) => {
    localStorage.setItem(key, value);
    return { key, value };
  },
  delete: async (key) => {
    localStorage.removeItem(key);
    return { key, deleted: true };
  }
};
