import { Request, Response } from 'express';
import axios from 'axios';

export const tableauAuth = async (req: Request, res: Response) => {
    try {
        const { url, tokenName, tokenValue, siteContentUrl } = req.body;
        
        const response = await axios.post(`${url}/api/3.19/auth/signin`, {
            credentials: {
                personalAccessTokenName: tokenName,
                personalAccessTokenSecret: tokenValue,
                site: {
                    contentUrl: siteContentUrl || ""
                }
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Tableau auth error:', error);
        res.status(500).json({ error: 'Failed to authenticate with Tableau' });
    }
};

export const tableauViews = async (req: Request, res: Response) => {
    try {
        const { url, siteId, token } = req.body;
        
        const response = await axios.get(`${url}/api/3.19/sites/${siteId}/views`, {
            headers: {
                'X-Tableau-Auth': token
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Tableau views error:', error);
        res.status(500).json({ error: 'Failed to fetch Tableau views' });
    }
}; 