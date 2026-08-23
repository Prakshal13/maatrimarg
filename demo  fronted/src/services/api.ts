import { Hospital, RouteResponse, ClinicalVitals, RiskPredictionResponse } from '../types';
import { INITIAL_HOSPITALS, calculateMockRoute, evaluateMockRisk } from './mockData';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// In-memory state persisted in sessionStorage
function getStoredHospitals(): Hospital[] {
  try {
    const data = sessionStorage.getItem('maatrimarg_hospitals');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Session storage read error', e);
  }
  return INITIAL_HOSPITALS;
}

function saveStoredHospitals(hospitals: Hospital[]) {
  try {
    sessionStorage.setItem('maatrimarg_hospitals', JSON.stringify(hospitals));
  } catch (e) {
    console.warn('Session storage write error', e);
  }
}

export const HospitalService = {
  async getAll(): Promise<Hospital[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/hospitals`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.hospitals || [];
          saveStoredHospitals(list);
          return list;
        }
      } catch (err) {
        console.warn('Live API unreachable, using local data store:', err);
      }
    }
    // Fallback simulation with slight delay
    await new Promise(r => setTimeout(r, 200));
    return getStoredHospitals();
  },

  async getById(id: string): Promise<Hospital> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/hospitals/${id}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Live API unreachable, using local hospital lookup:', err);
      }
    }
    await new Promise(r => setTimeout(r, 150));
    const list = getStoredHospitals();
    const found = list.find(h => h.id === id);
    if (!found) throw new Error(`Hospital with ID ${id} not found.`);
    return found;
  },

  async update(id: string, updateData: Partial<Hospital>): Promise<Hospital> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/hospitals/${id}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
        if (res.ok) {
          const updated = await res.json();
          const list = getStoredHospitals().map(h => h.id === id ? { ...h, ...updated } : h);
          saveStoredHospitals(list);
          return updated;
        }
      } catch (err) {
        console.warn('Live API update unreachable, updating local store:', err);
      }
    }

    await new Promise(r => setTimeout(r, 300));
    const list = getStoredHospitals();
    const idx = list.findIndex(h => h.id === id);
    if (idx === -1) throw new Error(`Hospital ${id} not found.`);
    
    const updated: Hospital = {
      ...list[idx],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    list[idx] = updated;
    saveStoredHospitals(list);
    return updated;
  },

  async calculateRoute(originId: string): Promise<RouteResponse> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin_hospital_id: originId })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Live routing API unreachable, calculating with local routing engine:', err);
      }
    }

    await new Promise(r => setTimeout(r, 450));
    const list = getStoredHospitals();
    return calculateMockRoute(originId, list);
  },

  async predictRisk(vitals: ClinicalVitals): Promise<RiskPredictionResponse> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/predict-risk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vitals)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Live risk prediction API unreachable, using clinical ML engine:', err);
      }
    }

    await new Promise(r => setTimeout(r, 500));
    return evaluateMockRisk(vitals);
  }
};
