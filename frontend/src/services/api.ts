const API_BASE_URL = 'http://localhost:8000/api';

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...options,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`[API Mock Fallback] Falha ao conectar em ${endpoint}, utilizando estado local.`);
    throw error;
  }
}