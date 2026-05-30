import { apiApp } from '../api-router.js';

export default function handler(req: any, res: any) {
  return apiApp(req, res);
}
