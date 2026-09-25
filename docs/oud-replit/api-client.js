// ClubComm API Client - Unified Implementation
class ClubCommAPI {
  constructor() {
    this.baseURL = window.location.origin + '/api';
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);

      // Handle token expiration
      if (error.message.includes('Invalid or expired token')) {
        this.setToken(null);
        window.location.href = 'index.html';
      }

      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    if (response.success) {
      this.setToken(response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }

    return response;
  }

  async register(registrationData) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: registrationData
    });
  }

  // HJO methods
  async getPendingRegistrations() {
    return await this.request('/hjo/pending-registrations');
  }

  async approveRegistration(id, action, team = null) {
    return await this.request(`/hjo/approve-registration/${id}`, {
      method: 'POST',
      body: { action, team }
    });
  }

  // Attendance methods
  async reportAbsence(trainingDate, reason) {
    return await this.request('/attendance/absence', {
      method: 'POST',
      body: { trainingDate, reason }
    });
  }

  // Players
  async getPlayers(team = null) {
    const query = team ? `?team=${team}` : '';
    return await this.request(`/players${query}`);
  }

  async createPlayer(playerData) {
    return await this.request('/players', {
      method: 'POST',
      body: playerData
    });
  }

  // Teams
  async getTeams() {
    return await this.request('/teams');
  }

  // Training schedule
  async getTrainingSchedule(team = null, startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (team) params.append('team', team);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/training-schedule${query}`);
  }

  async createTraining(trainingData) {
    return await this.request('/training-schedule', {
      method: 'POST',
      body: trainingData
    });
  }

  // Utility methods
  logout() {
    this.setToken(null);
    localStorage.clear();
    window.location.href = 'index.html';
  }

  isAuthenticated() {
    return !!this.token;
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Create single global API instance
window.clubAPI = new ClubCommAPI();

// Auto-logout on token expiration
window.addEventListener('storage', (e) => {
  if (e.key === 'authToken' && !e.newValue) {
    window.location.href = 'index.html';
  }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClubCommAPI;
}