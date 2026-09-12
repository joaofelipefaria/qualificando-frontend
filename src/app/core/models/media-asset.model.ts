export type MediaType = 'VIDEO' | 'IMAGE' | 'DOCUMENT';

/**
 * A media file that has been uploaded and is available to be referenced
 * from course module content (see ModuleContentBlock in module-content.model.ts).
 *
 * In the mock gateway `url` is a browser-local object URL (created with
 * URL.createObjectURL), so it is only valid for the lifetime of the current
 * tab/session. A real backend implementation would instead persist the file
 * (e.g. to S3/MinIO) and return a durable, publicly resolvable URL here.
 */
export interface MediaAsset {
  id: number;
  courseId: number;
  type: MediaType;
  name: string;
  url: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedAt: string;
}
