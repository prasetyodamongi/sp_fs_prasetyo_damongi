import { apiFetch } from './api';
import { getToken } from './auth';

export interface User {
    id: string;
    email: string;
}

export const searchUsers = async (emailQuery: string): Promise<User[]> => {
    const token = getToken();
    if (!token) throw new Error('No token');

    return apiFetch<User[]>(
        `/users/search?email=${encodeURIComponent(emailQuery)}`,
        'GET',
        undefined,
        token
    );
};

export const getUserById = async (userId: string): Promise<User> => {
    const token = getToken();
    if (!token) throw new Error('No token');

    return apiFetch<User>(`/users/${userId}`, 'GET', undefined, token);
};