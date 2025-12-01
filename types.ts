
export interface ThumbnailState {
  title: string;
  imageFile: File | null;
  referenceImageFile: File | null;
  imagePreviewUrl: string | null;
  generatedImageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  editingMode: 'none' | 'general';
}

export interface GenerateThumbnailParams {
  title: string;
  imageFile: File;
  referenceImageFile?: File;
}
