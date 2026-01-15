import { ContentMap } from '@/types/content';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/content`;

export async function getContent(locale: string = 'vi'): Promise<ContentMap> {
  try {
    const res = await fetch(`${API_URL}?lang=${locale}`, {
      cache: 'no-store', // CMS → luôn lấy mới
    });

    if (!res.ok) {
      console.error('Content API error:', res.status);
      return {};
    }

    const result = await res.json().catch(() => null);
    return result?.data || {};
  } catch (error) {
    console.error('Fetch content failed:', error);
    return {};
  }
}

