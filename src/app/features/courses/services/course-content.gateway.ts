import { Observable } from 'rxjs';
import { CourseModule, CourseModuleFormValue, PresencialSessionFormValue, PresencialSession } from '../../../core/models/course-module.model';
import { ModuleContentBlock, TextContentFormValue } from '../../../core/models/module-content.model';
import { MediaAsset, MediaType } from '../../../core/models/media-asset.model';

/**
 * Contract for everything related to course modules, their textual/media
 * content, and the media library. This is deliberately an abstract class
 * (not an interface) so it can be used as an Angular DI token.
 *
 * TODAY this is backed by `CourseContentMockService`, an in-memory
 * implementation with simulated latency (see that file for details and for
 * swap-to-real-backend instructions). Once quali-courses-api exposes real
 * endpoints for modules/content/media, create a `CourseContentHttpService`
 * that implements this same class using HttpClient, and flip the provider
 * in `app.config.ts`:
 *
 *   { provide: CourseContentGateway, useClass: CourseContentHttpService }
 *
 * No component or template needs to change - they all depend on
 * `CourseContentGateway`, never on the mock directly.
 */
export abstract class CourseContentGateway {
  // ----- Modules -----
  abstract listModules(courseId: number): Observable<CourseModule[]>;
  abstract getModule(moduleId: number): Observable<CourseModule>;
  abstract createModule(courseId: number, value: CourseModuleFormValue): Observable<CourseModule>;
  abstract updateModule(moduleId: number, value: CourseModuleFormValue): Observable<CourseModule>;
  abstract deleteModule(moduleId: number): Observable<void>;
  abstract reorderModules(courseId: number, orderedModuleIds: number[]): Observable<void>;

  // ----- Presencial agenda -----
  abstract addSession(moduleId: number, value: PresencialSessionFormValue): Observable<PresencialSession>;
  abstract updateSession(moduleId: number, sessionId: number, value: PresencialSessionFormValue): Observable<PresencialSession>;
  abstract deleteSession(moduleId: number, sessionId: number): Observable<void>;

  // ----- Textual/media content blocks -----
  abstract listContentBlocks(moduleId: number): Observable<ModuleContentBlock[]>;
  abstract addTextBlock(moduleId: number, value: TextContentFormValue): Observable<ModuleContentBlock>;
  abstract updateTextBlock(moduleId: number, blockId: number, value: TextContentFormValue): Observable<ModuleContentBlock>;
  abstract addMediaBlock(moduleId: number, mediaId: number, caption?: string): Observable<ModuleContentBlock>;
  abstract deleteContentBlock(moduleId: number, blockId: number): Observable<void>;
  abstract reorderContentBlocks(moduleId: number, orderedBlockIds: number[]): Observable<void>;

  // ----- Media library -----
  abstract listMedia(courseId: number): Observable<MediaAsset[]>;
  abstract uploadMedia(courseId: number, file: File, type: MediaType): Observable<MediaAsset>;
  abstract deleteMedia(mediaId: number): Observable<void>;
}
