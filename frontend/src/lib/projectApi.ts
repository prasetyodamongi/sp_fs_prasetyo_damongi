import { apiFetch } from './api';
import { getToken } from './auth';
import { Task } from './taskApi';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string;
  members: {
    id: string;
    user: {
      id: string;
      email: string;
    };
  }[];
  tasks: Task[];
}

export const getProjects = async (): Promise<Project[]> => {
  const token = getToken();
  if (!token) throw new Error('No token');
  return apiFetch<Project[]>('/projects', 'GET', undefined, token);
};

export const createProject = async (name: string): Promise<Project> => {
  const token = getToken();
  if (!token) throw new Error('No token');
  return apiFetch<Project>('/projects', 'POST', { name }, token);
};

export const sendProjectInvite = async (projectId: string, email: string): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('No token');
  return apiFetch(`/projects/${projectId}/invite`, 'POST', { email }, token);
};

export const removeProjectMember = async (projectId: string, userId: string) => {
  const token = getToken();
  if (!token) throw new Error('No token');
  return apiFetch(`/projects/${projectId}/remove-member`, 'POST', { userId }, token);
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('No token');
  return apiFetch(`/projects/${projectId}`, 'DELETE', undefined, token);
};

export const getProjectDetails = async (projectId: string): Promise<Project> => {
  const token = getToken();
  if (!token) throw new Error('No token');
  return apiFetch<Project>(`/projects/${projectId}`, 'GET', undefined, token);
};