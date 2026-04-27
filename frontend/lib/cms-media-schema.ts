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
  usageCount?: number;
  usage?: CmsMediaUsageEntry[];
};

export type CmsMediaTaskItem = {
  id: string;
  displayName: string;
  publicUrl: string;
  altText: string | null;
  createdAt: string;
  usageCount: number;
  details?: string;
  issueLabel?: string;
};

export type CmsMediaUsageEntry = {
  section: string;
  sectionLabel: string;
  field: string;
  targetField?: string;
  itemId?: string;
  itemLabel: string;
  targetId?: string;
  targetTab?: string;
  targetAnchorId?: string;
};

export type CmsBrokenMediaReference = {
  publicUrl: string;
  usage: CmsMediaUsageEntry[];
  reason: "missing_asset" | "missing_file";
};

export type CmsMediaIntegrityReport = {
  totalAssets: number;
  usedAssets: number;
  unusedAssets: number;
  assetsMissingAltText: number;
  lowQualityAssets: number;
  unusedAssetItems: CmsMediaTaskItem[];
  assetsMissingAltTextItems: CmsMediaTaskItem[];
  lowQualityAssetItems: CmsMediaTaskItem[];
  brokenReferenceCount: number;
  brokenReferences: CmsBrokenMediaReference[];
};
