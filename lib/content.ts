import { ContentMap } from '@/types/content';

const API_URL = 'http://localhost:3000/api/content';

export async function getContent(): Promise<ContentMap> {
  try {
    const res = await fetch(API_URL, {
      cache: 'no-store', // CMS → luôn lấy mới
    });

    if (!res.ok) {
      console.error('Content API error:', res.status);
      return {};
    }

    return res.json();
  } catch (error) {
    console.error('Fetch content failed:', error);
    return {};
  }
}
