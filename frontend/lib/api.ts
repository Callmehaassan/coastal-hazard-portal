import type { Region, HazardReading } from './types';
export type { Region, HazardReading };

export async function getRegions(): Promise<Region[]> {
  const response = await fetch('/api/regions', { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch regions');
  return response.json();
}

export async function getHazards(
  type: string,
  district?: string,
  yearStart?: number,
  yearEnd?: number
): Promise<HazardReading[]> {
  const params = new URLSearchParams();
  if (district) params.append('district', district);
  if (yearStart) params.append('year_start', yearStart.toString());
  if (yearEnd) params.append('year_end', yearEnd.toString());
  
  const url = `/api/hazards/${type}?${params.toString()}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch hazards');
  return response.json();
}

export async function exportReport(
  regionId: number | null,
  format: string,
  yearStart: number,
  yearEnd: number,
  hazardType?: string,
  hotspot?: string
): Promise<Blob> {
  // Use the frontend proxy route for all formats
  const response = await fetch('/api/reports/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      region_id: regionId,
      format,
      year_start: yearStart,
      year_end: yearEnd,
      hazard_type: hazardType,
      hotspot,
    }),
  });
  
  if (!response.ok) throw new Error('Failed to export report');
  return response.blob();
}

export async function login(email: string, password: string): Promise<any> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail ?? 'Login failed');
  }
  return response.json();
}

export interface CurrentUser {
  email: string;
  role: string;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await fetch('/api/auth/me', { cache: 'no-store' });
  if (!response.ok) throw new Error('Not authenticated');
  return response.json();
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', { method: 'POST' });
  if (!response.ok) throw new Error('Failed to logout');
}

export async function runPipeline(): Promise<any> {
  const response = await fetch('/api/pipeline/run', { method: 'POST' });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail ?? 'Failed to trigger pipeline');
  }
  return response.json();
}
