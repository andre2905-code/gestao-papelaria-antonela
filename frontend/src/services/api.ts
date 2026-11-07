

const API_BASE_URL = import.meta.env.VITE_API_URL;

console.log('API_BASE_URL carregada:', API_BASE_URL);

function getCsrfToken(): string {
    const token = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
        ?.substring('XSRF-TOKEN='.length);

    return token ? decodeURIComponent(token) : '';
}

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const method = (options.method ?? 'GET').toUpperCase();
    const headers = new Headers(options.headers);

    headers.set('Accept', 'application/json');

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        headers.set('X-XSRF-TOKEN', getCsrfToken());
    }

    const url = `${API_BASE_URL}${endpoint}`;

    console.log('Requisição enviada:', {
        baseURL: API_BASE_URL,
        endpoint,
        url,
        method,
        headers: [...headers.entries()],
    });

    const response = await fetch(url, {
        ...options,
        method,
        credentials: 'include',
        headers,
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
        if (contentType?.includes('application/json')) {
            const data = await response.json();
            throw new Error(
                data.message || `Erro na requisição: ${response.status}`
            );
        }

        throw new Error(`Erro na API: ${response.status}`);
    }

    if (!contentType?.includes('application/json')) {
        throw new Error('A API não retornou uma resposta JSON.');
    }

    return await response.json() as T;
}
