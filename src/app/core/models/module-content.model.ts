export type ModuleContentType = 'TEXT' | 'MEDIA';

interface ModuleContentBlockBase {
  id: number;
  moduleId: number;
  order: number;
}

/** A block of free-form textual content inside a module (e.g. a lesson write-up). */
export interface TextContentBlock extends ModuleContentBlockBase {
  type: 'TEXT';
  title?: string;
  body: string;
}

/** A block that references an already-uploaded MediaAsset (video, image or document). */
export interface MediaContentBlock extends ModuleContentBlockBase {
  type: 'MEDIA';
  mediaId: number;
  caption?: string;
}

export type ModuleContentBlock = TextContentBlock | MediaContentBlock;

export interface TextContentFormValue {
  title?: string;
  body: string;
}

export interface MediaContentFormValue {
  mediaId: number;
  caption?: string;
}
