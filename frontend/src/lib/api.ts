export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg = typeof data === 'object' && data.erro ? data.erro : data.mensagem || 'Erro na requisição';
      return { error: errorMsg, status: res.status };
    }

    return { data, status: res.status };
  } catch (err: any) {
    return { error: err.message || 'Falha de conexão com o servidor', status: 500 };
  }
}
