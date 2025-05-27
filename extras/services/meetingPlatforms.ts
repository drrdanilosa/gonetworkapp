export interface MeetingInfo {
  title?: string
  startTime?: string
  duration?: number
  participants?: string[]
  platform: 'meet' | 'zoom' | 'teams' | 'other'
}

export class MeetingPlatformService {
  static extractMeetingInfo(url: string): MeetingInfo {
    try {
      const urlObj = new URL(url)
      
      if (urlObj.hostname.includes('meet.google.com')) {
        return this.parseGoogleMeet(urlObj)
      } else if (urlObj.hostname.includes('zoom.us')) {
        return this.parseZoom(urlObj)
      } else if (urlObj.hostname.includes('teams.microsoft.com')) {
        return this.parseTeams(urlObj)
      }
      
      return { platform: 'other' }
    } catch {
      return { platform: 'other' }
    }
  }
  
  private static parseGoogleMeet(url: URL): MeetingInfo {
    // Google Meet URLs são simples: https://meet.google.com/abc-defg-hij
    const meetingId = url.pathname.substring(1)
    
    return {
      platform: 'meet',
      title: `Reunião Google Meet ${meetingId}`,
    }
  }
  
  private static parseZoom(url: URL): MeetingInfo {
    // Zoom URLs: https://zoom.us/j/123456789?pwd=abcdef
    const pathParts = url.pathname.split('/')
    const meetingId = pathParts[pathParts.length - 1]
    
    return {
      platform: 'zoom',
      title: `Reunião Zoom ${meetingId}`,
    }
  }
  
  private static parseTeams(url: URL): MeetingInfo {
    // Teams URLs são mais complexas, mas podemos extrair algumas informações
    return {
      platform: 'teams',
      title: 'Reunião Microsoft Teams',
    }
  }
  
  static generateMeetingLink(platform: string): string {
    switch (platform) {
      case 'meet':
        return 'https://meet.google.com/new'
      case 'zoom':
        return 'https://zoom.us/start/videomeeting'
      case 'teams':
        return 'https://teams.microsoft.com/start'
      default:
        return ''
    }
  }
  
  static getPlatformIcon(platform: string): string {
    switch (platform) {
      case 'meet': return '🎥'
      case 'zoom': return '💻'
      case 'teams': return '👥'
      default: return '🔗'
    }
  }
  
  static getPlatformColor(platform: string): string {
    switch (platform) {
      case 'meet': return 'bg-blue-500'
      case 'zoom': return 'bg-blue-600'
      case 'teams': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }
}