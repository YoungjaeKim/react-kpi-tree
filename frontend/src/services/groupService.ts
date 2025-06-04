import { Group } from '../types';

const API_URL = process.env.REACT_APP_API_URL;

export const groupService = {
    async fetchGroups(archived: boolean = false): Promise<Group[]> {
        const response = await fetch(`${API_URL}/graphs/group?archived=${archived}`);
        if (!response.ok) {
            throw new Error('Failed to fetch groups');
        }
        return response.json();
    },

    async createGroup(title: string): Promise<void> {
        const response = await fetch(`${API_URL}/graphs/group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title }),
        });

        if (!response.ok) {
            throw new Error('Failed to create group');
        }
    },

    async archiveGroup(groupId: string): Promise<void> {
        const response = await fetch(`${API_URL}/graphs/group/${groupId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ archived: true }),
        });

        if (!response.ok) {
            throw new Error('Failed to archive group');
        }
    }
}; 