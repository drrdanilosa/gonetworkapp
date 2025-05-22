import { API_URL, getHeaders, handleApiError } from './api-config';

export type GeneralInfoData = {
  eventId: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  eventLocation: string;
  hasCredentialing: 'sim' | 'não';
  accessLocation?: string;
  credentialingStart?: string;
  credentialingEnd?: string;
  credentialingResponsible?: string;
  eventAccessLocation: string;
  hasMediaRoom: 'sim' | 'não';
  mediaRoomLocation?: string;
  hasInternet: 'sim' | 'não';
  internetLogin?: string;
  internetPassword?: string;
  generalInfo: string;
};

export const getBriefing = async (eventId: string) => {
  try {
    // Na versão final, isso seria uma chamada real à API
    // const response = await fetch(`${API_URL}/briefings/${eventId}`, {
    //   headers: getHeaders(),
    // });
    
    // Por enquanto, simulamos um endpoint local
    const response = await fetch(`/api/briefings/${eventId}`);
    
    if (!response.ok) {
      throw response;
    }
    
    return await response.json();
  } catch (error) {
    throw handleApiError(error);
  }
};

export const saveBriefing = async (data: GeneralInfoData) => {
  try {
    // Na versão final, isso seria uma chamada real à API
    // const response = await fetch(`${API_URL}/briefings`, {
    //   method: 'POST',
    //   headers: getHeaders(),
    //   body: JSON.stringify(data),
    // });
    
    // Por enquanto, simulamos um endpoint local
    const response = await fetch('/api/briefings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw response;
    }
    
    return await response.json();
  } catch (error) {
    throw handleApiError(error);
  }
};
