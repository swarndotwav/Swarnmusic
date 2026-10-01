import { getAccessToken } from './googleDriveAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webContentLink?: string;
  webViewLink?: string;
  iconLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export const isAudioMime = (mime: string, name: string) => {
  if (mime.startsWith('audio/')) return true;
  const ext = name.toLowerCase().split('.').pop();
  return ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'opus'].includes(ext || '');
};

export const isLyricsOrDocMime = (mime: string, name: string) => {
  if (mime.includes('text') || mime.includes('document')) return true;
  const ext = name.toLowerCase().split('.').pop();
  return ['txt', 'md', 'doc', 'docx', 'pdf'].includes(ext || '');
};

export const listDriveFiles = async (
  category: 'all' | 'audio' | 'lyrics' = 'all'
): Promise<DriveFileItem[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token not available. Please sign in with Google.');
  }

  let query = "trashed = false";
  if (category === 'audio') {
    query += " and (mimeType contains 'audio/' or name contains '.mp3' or name contains '.wav' or name contains '.m4a')";
  } else if (category === 'lyrics') {
    query += " and (mimeType contains 'text/' or mimeType contains 'document' or name contains '.txt' or name contains '.doc')";
  }

  const fields = 'files(id, name, mimeType, size, webContentLink, webViewLink, iconLink, createdTime, modifiedTime)';
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=modifiedTime desc&pageSize=50`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Failed to fetch Google Drive files (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
};

export const fetchDriveFileContent = async (fileId: string): Promise<Blob> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token not available.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download file from Google Drive (HTTP ${res.status})`);
  }

  return await res.blob();
};

export const uploadToDrive = async (
  fileName: string,
  mimeType: string,
  content: Blob | string,
  description?: string
): Promise<DriveFileItem> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token not available.');
  }

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: description || 'Created from swarnmusic Artisanal Platform',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const blobContent = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaPartHeader = `${delimiter}Content-Type: ${mimeType}\r\n\r\n`;

  const requestBlob = new Blob([metadataPart, mediaPartHeader, blobContent, closeDelimiter], {
    type: `multipart/related; boundary=${boundary}`,
  });

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: requestBlob,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Failed to upload file to Google Drive (HTTP ${res.status})`);
  }

  return await res.json();
};

export const deleteFromDrive = async (fileId: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token not available.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Failed to delete file from Google Drive (HTTP ${res.status})`);
  }

  return true;
};

export const exportUserDetailsToDrive = async (
  currentUser: any,
  registeredArtists: any[] = []
): Promise<DriveFileItem> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token not available. Please sign in with Google first.');
  }

  const payload = {
    exportDate: new Date().toISOString(),
    platform: 'swarnmusic (Artisanal Indian Classical & Acoustic Platform)',
    profile: {
      id: currentUser.id,
      name: currentUser.name,
      stageName: currentUser.stageName || '',
      role: currentUser.role,
      genre: currentUser.genre,
      email: currentUser.email,
      phone: currentUser.phone,
      bio: currentUser.bio,
      location: currentUser.location || '',
      joinedDate: currentUser.joinedDate || '',
      musicalInfluences: currentUser.musicalInfluences || [],
      instrumentsPlayed: currentUser.instrumentsPlayed || [],
      socialLinks: currentUser.socialLinks || {},
    },
    uploadedWorks: (currentUser.works || []).map((work: any) => ({
      id: work.id,
      title: work.title,
      genre: work.genre,
      roleAttributed: work.roleAttributed,
      type: work.type,
      description: work.description,
      ragaOrMeter: work.ragaOrMeter,
      lyricsContent: work.lyricsContent,
      duration: work.duration,
      averageRating: work.averageRating,
      ratingsCount: work.ratingsCount,
      reviews: work.reviews || [],
      createdAt: work.createdAt,
    })),
    communityRosterSnapshot: registeredArtists.map((a: any) => ({
      id: a.id,
      name: a.name,
      stageName: a.stageName,
      role: a.role,
      genre: a.genre,
      worksCount: a.works?.length || 0,
    })),
  };

  const safeName = (currentUser.name || 'User').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `swarnmusic_profile_${safeName}_${new Date().toISOString().split('T')[0]}.json`;
  const jsonContent = JSON.stringify(payload, null, 2);

  return await uploadToDrive(
    fileName,
    'application/json',
    jsonContent,
    `Full creator profile and works backup for ${currentUser.name} from swarnmusic`
  );
};

