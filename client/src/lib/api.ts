// Détection dynamique de l'URL API (Utilise le Proxy Vite en dev)
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // En dev, on utilise le proxy relatif. En prod, window.location.origin
  return import.meta.env.DEV ? '' : window.location.origin;
};

const API_URL = getBaseUrl();
console.log(`[KORA-API] Tentative de connexion sur : ${API_URL}`);

export const fetchConfig = async () => {
  try {
    const response = await fetch(`${API_URL}/api/config`);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error(`[API_ERROR] Échec de la récupération de la config sur ${API_URL}:`, err.message);
    throw err;
  }
};

export const updateConfig = async (config: any, token: string) => {
  const response = await fetch(`${API_URL}/api/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(config)
  });
  if (!response.ok) throw new Error('Failed to update config');
  return response.json();
};

export const loginAdmin = async (credentials: any) => {
  const response = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const submitQuote = async (data: any) => {
  const response = await fetch(`${API_URL}/api/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Quote submission failed');
  return response.json();
};

export const submitContact = async (data: any) => {
  const response = await fetch(`${API_URL}/api/contact-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Contact submission failed');
  return response.json();
};

export const submitChatSummary = async (data: any) => {
  const response = await fetch(`${API_URL}/api/chat-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Chat summary submission failed');
  return response.json();
};

export const chatWithAlexa = async (message: string) => {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!response.ok) throw new Error('Chat failed');
  return response.json();
};
