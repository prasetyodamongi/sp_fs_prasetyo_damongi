import { apiFetch } from './api';
import { getToken } from './auth';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    createdAt: string;
    assigneeId?: string | null;

    assignee?: {
        id: string;
        email: string;
        name?: string;
    } | null;
}

interface ProjectData {
    id: string;
    title: string;
    ownerId: string;
    members: {
        id: string;
        user: { id: string; email: string };
    }[];
    tasks: Task[];
}

export const fetchProjectData = async (projectId: string) => {
    const token = getToken();
    if (!token) throw new Error('No token');

    const project = await apiFetch<ProjectData>(`/projects/${projectId}`, 'GET', undefined, token);
    const sortedTasks = project.tasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return {
        ...project,
        tasks: sortedTasks
    };
};

export const createNewTask = async (
    projectId: string,
    taskData: { title: string; description: string; assigneeId?: string }
) => {
    const token = getToken();
    if (!token) throw new Error('No token');

    return apiFetch<Task>(
        `/tasks/project/${projectId}`,
        'POST',
        {
            ...taskData,
            status: 'TODO',
        },
        token
    );
};

export const updateTaskStatus = async (taskId: string, status: Task['status'], userId: string) => {
    const token = getToken();
    if (!token) throw new Error('No token');
    return apiFetch<Task>(`/tasks/${taskId}`, 'PUT', { status, assigneeId: userId }, token);
};

export const modifyTask = async (taskId: string, taskData: Partial<Task>) => {
    const token = getToken();
    if (!token) throw new Error('No token');
    return apiFetch<Task>(`/tasks/${taskId}`, 'PUT', taskData, token);
};

export const removeTask = async (taskId: string) => {
    const token = getToken();
    if (!token) throw new Error('No token');
    return apiFetch(`/tasks/${taskId}`, 'DELETE', undefined, token);
};

export const getCurrentUserId = () => {
    const token = getToken();
    if (!token) return null;
    const userToken = JSON.parse(atob(token.split('.')[1])) as { userId: string };
    return userToken.userId;
};