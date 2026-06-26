export const store = {
  state: {
    currentTab: "home",
    theme: localStorage.getItem("theme") || "light",
    favorites: JSON.parse(localStorage.getItem("favorites") || "[]"),
    userLocation: null,
  },
  listeners: [],
  
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  },
  
  setTheme(theme) {
    localStorage.setItem("theme", theme);
    this.setState({ theme });
  },
  
  setFavorites(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
    this.setState({ favorites });
  }
};
