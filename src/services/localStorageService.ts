// Local Storage Service - Simulates Firebase for demo purposes
export class LocalStorageService<T extends { id: string }> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  private getCollection(): T[] {
    const data = localStorage.getItem(this.collectionName);
    return data ? JSON.parse(data, this.dateReviver) : [];
  }

  private saveCollection(items: T[]): void {
    localStorage.setItem(this.collectionName, JSON.stringify(items));
  }

  // Helper to revive Date objects from JSON
  private dateReviver(key: string, value: any): any {
    const dateFields = ['createdAt', 'updatedAt', 'dueDate', 'timestamp', 'startDate', 'estimatedEndDate', 'actualEndDate', 'completedAt'];
    if (dateFields.includes(key) && typeof value === 'string') {
      return new Date(value);
    }
    return value;
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const items = this.getCollection();
    const newItem = {
      id: crypto.randomUUID(),
      ...data,
    } as T;
    items.push(newItem);
    this.saveCollection(items);
    return newItem;
  }

  async getById(id: string): Promise<T | null> {
    const items = this.getCollection();
    return items.find((item) => item.id === id) || null;
  }

  async getAll(): Promise<T[]> {
    return this.getCollection();
  }

  async getWhere(field: string, operator: string, value: any): Promise<T[]> {
    const items = this.getCollection();
    return items.filter((item: any) => {
      const itemValue = item[field];
      switch (operator) {
        case '==':
          return itemValue === value;
        case '!=':
          return itemValue !== value;
        case '>':
          return itemValue > value;
        case '>=':
          return itemValue >= value;
        case '<':
          return itemValue < value;
        case '<=':
          return itemValue <= value;
        case 'array-contains':
          return Array.isArray(itemValue) && itemValue.includes(value);
        default:
          return false;
      }
    });
  }

  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
    const items = this.getCollection();
    const index = items.findIndex((item) => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...data };
      this.saveCollection(items);
    }
  }

  async delete(id: string): Promise<void> {
    const items = this.getCollection();
    const filtered = items.filter((item) => item.id !== id);
    this.saveCollection(filtered);
  }

  async query(): Promise<T[]> {
    return this.getCollection();
  }
}

// Simple auth simulation
export class LocalAuthService {
  private readonly CURRENT_USER_KEY = 'currentUser';
  private readonly USERS_KEY = 'users';

  async signIn(email: string, password: string): Promise<any> {
    const users = this.getUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  async createUser(email: string, password: string, displayName: string, roleId: string): Promise<any> {
    const users = this.getUsers();
    const id = crypto.randomUUID();
    const newUser = {
      id,
      email,
      password, // In demo mode, we store password (never do this in production!)
      displayName,
      roleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async getUserData(userId: string): Promise<any | null> {
    const users = this.getUsers();
    const user = users.find((u: any) => u.id === userId);
    if (!user) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(userId: string, updates: any): Promise<void> {
    const users = this.getUsers();
    const index = users.findIndex((u: any) => u.id === userId);
    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...updates,
        updatedAt: new Date()
      };
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  onAuthStateChange(callback: (user: any) => void): () => void {
    const checkAuth = () => {
      const userData = localStorage.getItem(this.CURRENT_USER_KEY);
      callback(userData ? JSON.parse(userData, this.dateReviver) : null);
    };

    // Check immediately
    checkAuth();

    // Listen for storage events (for multi-tab support)
    const handler = (e: StorageEvent) => {
      if (e.key === this.CURRENT_USER_KEY) {
        checkAuth();
      }
    };
    window.addEventListener('storage', handler);

    return () => window.removeEventListener('storage', handler);
  }

  getCurrentUser(): any | null {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY);
    return userData ? JSON.parse(userData, this.dateReviver) : null;
  }

  private getUsers(): any[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data, this.dateReviver) : [];
  }

  private dateReviver(key: string, value: any): any {
    const dateFields = ['createdAt', 'updatedAt'];
    if (dateFields.includes(key) && typeof value === 'string') {
      return new Date(value);
    }
    return value;
  }
}
