export interface Playlist {
  id: number;
  title: string;
  description: string | null;
  dateCreated: string;
  lastUsedAt: string;
  trackIds: number[];
}
