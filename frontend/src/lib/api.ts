export async function apiFetch<T>(
  url: string,
  method = 'GET',
  body?: any,
  token?: string
): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}
