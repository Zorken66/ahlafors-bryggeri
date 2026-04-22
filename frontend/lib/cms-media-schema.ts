export type CmsMediaAsset = {
  id: string;
  filename: string;
  displayName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string;
  altText: string | null;
  uploadedBy: string;
  createdAt: string;
};
