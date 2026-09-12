import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CourseTechContentGateway } from './course-tech-content.gateway';
import {
  CourseModule,
  CourseModuleFormValue,
  PresencialSession,
  PresencialSessionFormValue
} from '../../../core/models/course-module.model';
import { ModuleContentBlock, TextContentFormValue } from '../../../core/models/module-content.model';
import { MediaAsset, MediaType } from '../../../core/models/media-asset.model';

/**
 * TEMPORARY MOCK - see CourseTechContentGateway for the swap-to-real-backend plan.
 *
 * Everything lives in memory (component-tree-wide, since this is a singleton
 * `providedIn: 'root'`-style service) and is lost on page refresh. Uploaded
 * media is kept as `URL.createObjectURL(file)` blob URLs, which only work
 * for the current browser tab - a real backend would persist the file and
 * return a durable URL.
 *
 * Every method simulates network latency via `delay(LATENCY_MS)` so the UI
 * (loading spinners, disabled buttons while saving, etc.) behaves the same
 * way it will once wired to real HTTP calls.
 */
@Injectable({ providedIn: 'root' })
export class CourseTechContentMockService extends CourseTechContentGateway {
  private static readonly LATENCY_MS = 350;

  private nextModuleId = 4;
  private nextSessionId = 4;
  private nextBlockId = 6;
  private nextMediaId = 4;

  private modules: CourseModule[] = [
    {
      id: 1,
      courseId: 101,
      title: 'Introdução ao curso',
      description: 'Conteúdo introdutório em vídeo e texto, no seu próprio ritmo.',
      order: 1,
      modality: 'ONLINE',
      status: 'ACTIVE',
      points: 10
    },
    {
      id: 2,
      courseId: 101,
      title: 'Oficina prática presencial',
      description: 'Encontro presencial com a empresa parceira para prática supervisionada.',
      order: 2,
      modality: 'PRESENCIAL',
      status: 'ACTIVE',
      points: 30,
      presencial: {
        companyId: 1,
        sessions: [
          { id: 1, date: '2026-09-10', startTime: '08:00', endTime: '12:00', location: 'Unidade Centro, Sala 4' },
          { id: 2, date: '2026-09-17', startTime: '08:00', endTime: '12:00', location: 'Unidade Centro, Sala 4' }
        ]
      }
    },
    {
      id: 3,
      courseId: 102,
      title: 'Fundamentos',
      description: 'Material de base do curso.',
      order: 1,
      modality: 'ONLINE',
      status: 'ACTIVE',
      points: 15
    }
  ];

  private media: MediaAsset[] = [
    {
      id: 1,
      courseId: 101,
      type: 'IMAGE',
      name: 'capa-modulo-introducao.jpg',
      url: 'https://picsum.photos/seed/quali-tech-modulo-1/640/360',
      mimeType: 'image/jpeg',
      uploadedAt: '2026-08-01T10:00:00Z'
    },
    {
      id: 2,
      courseId: 101,
      type: 'DOCUMENT',
      name: 'apostila-introducao-tech.pdf',
      url: 'https://example.org/docs/apostila-introducao-tech.pdf',
      mimeType: 'application/pdf',
      uploadedAt: '2026-08-01T10:05:00Z'
    },
    {
      id: 3,
      courseId: 102,
      type: 'IMAGE',
      name: 'capa-fundamentos-tech.jpg',
      url: 'https://picsum.photos/seed/quali-tech-modulo-3/640/360',
      mimeType: 'image/jpeg',
      uploadedAt: '2026-08-02T09:00:00Z'
    }
  ];

  private contentBlocks: ModuleContentBlock[] = [
    { id: 1, moduleId: 1, type: 'TEXT', order: 1, title: 'Bem-vindo(a)!', body: 'Neste módulo você vai conhecer os objetivos do curso, a carga horária e como funciona a avaliação.' },
    { id: 2, moduleId: 1, type: 'MEDIA', order: 2, mediaId: 1, caption: 'Visão geral do módulo' },
    { id: 3, moduleId: 1, type: 'TEXT', order: 3, title: 'Material de apoio', body: 'Baixe a apostila em anexo para acompanhar as aulas.' },
    { id: 4, moduleId: 1, type: 'MEDIA', order: 4, mediaId: 2, caption: 'Apostila em PDF' },
    { id: 5, moduleId: 3, type: 'TEXT', order: 1, title: 'Antes de começar', body: 'Reserve cerca de 2 horas por semana para este módulo.' }
  ];

  private simulate<T>(value: T): Observable<T> {
    return of(value).pipe(delay(CourseTechContentMockService.LATENCY_MS));
  }

  private notFound<T>(what: string, id: number): Observable<T> {
    return throwError(() => new Error(`${what} ${id} não encontrado(a).`)).pipe(delay(CourseTechContentMockService.LATENCY_MS));
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }

  // ----- Modules -----

  listModules(courseId: number): Observable<CourseModule[]> {
    const result = this.modules
      .filter(m => m.courseId === courseId)
      .sort((a, b) => a.order - b.order)
      .map(m => this.clone(m));
    return this.simulate(result);
  }

  getModule(moduleId: number): Observable<CourseModule> {
    const found = this.modules.find(m => m.id === moduleId);
    if (!found) return this.notFound('Módulo', moduleId);
    return this.simulate(this.clone(found));
  }

  createModule(courseId: number, value: CourseModuleFormValue): Observable<CourseModule> {
    const created: CourseModule = {
      id: this.nextModuleId++,
      courseId,
      title: value.title,
      description: value.description,
      order: value.order,
      modality: value.modality,
      status: value.status,
      points: value.points ?? 0,
      presencial: value.modality === 'PRESENCIAL' && value.presencialCompanyId
        ? { companyId: value.presencialCompanyId, sessions: [] }
        : undefined
    };
    this.modules.push(created);
    return this.simulate(this.clone(created));
  }

  updateModule(moduleId: number, value: CourseModuleFormValue): Observable<CourseModule> {
    const existing = this.modules.find(m => m.id === moduleId);
    if (!existing) return this.notFound('Módulo', moduleId);

    existing.title = value.title;
    existing.description = value.description;
    existing.order = value.order;
    existing.status = value.status;
    existing.modality = value.modality;
    existing.points = value.points ?? 0;

    if (value.modality === 'PRESENCIAL') {
      existing.presencial = {
        companyId: value.presencialCompanyId ?? existing.presencial?.companyId ?? 0,
        sessions: existing.presencial?.sessions ?? []
      };
    } else {
      existing.presencial = undefined;
    }

    return this.simulate(this.clone(existing));
  }

  deleteModule(moduleId: number): Observable<void> {
    this.modules = this.modules.filter(m => m.id !== moduleId);
    this.contentBlocks = this.contentBlocks.filter(b => b.moduleId !== moduleId);
    return this.simulate(undefined);
  }

  reorderModules(courseId: number, orderedModuleIds: number[]): Observable<void> {
    orderedModuleIds.forEach((id, index) => {
      const module = this.modules.find(m => m.id === id && m.courseId === courseId);
      if (module) module.order = index + 1;
    });
    return this.simulate(undefined);
  }

  // ----- Presencial agenda -----

  addSession(moduleId: number, value: PresencialSessionFormValue): Observable<PresencialSession> {
    const module = this.modules.find(m => m.id === moduleId);
    if (!module || !module.presencial) return this.notFound('Módulo presencial', moduleId);

    const session: PresencialSession = { id: this.nextSessionId++, ...value };
    module.presencial.sessions.push(session);
    module.presencial.sessions.sort((a, b) => a.date.localeCompare(b.date));
    return this.simulate(this.clone(session));
  }

  updateSession(moduleId: number, sessionId: number, value: PresencialSessionFormValue): Observable<PresencialSession> {
    const module = this.modules.find(m => m.id === moduleId);
    const session = module?.presencial?.sessions.find(s => s.id === sessionId);
    if (!session) return this.notFound('Encontro', sessionId);

    Object.assign(session, value);
    module!.presencial!.sessions.sort((a, b) => a.date.localeCompare(b.date));
    return this.simulate(this.clone(session));
  }

  deleteSession(moduleId: number, sessionId: number): Observable<void> {
    const module = this.modules.find(m => m.id === moduleId);
    if (module?.presencial) {
      module.presencial.sessions = module.presencial.sessions.filter(s => s.id !== sessionId);
    }
    return this.simulate(undefined);
  }

  // ----- Content blocks -----

  listContentBlocks(moduleId: number): Observable<ModuleContentBlock[]> {
    const result = this.contentBlocks
      .filter(b => b.moduleId === moduleId)
      .sort((a, b) => a.order - b.order)
      .map(b => this.clone(b));
    return this.simulate(result);
  }

  private nextBlockOrder(moduleId: number): number {
    const existing = this.contentBlocks.filter(b => b.moduleId === moduleId);
    return existing.length ? Math.max(...existing.map(b => b.order)) + 1 : 1;
  }

  addTextBlock(moduleId: number, value: TextContentFormValue): Observable<ModuleContentBlock> {
    const block: ModuleContentBlock = {
      id: this.nextBlockId++,
      moduleId,
      type: 'TEXT',
      order: this.nextBlockOrder(moduleId),
      title: value.title,
      body: value.body
    };
    this.contentBlocks.push(block);
    return this.simulate(this.clone(block));
  }

  updateTextBlock(moduleId: number, blockId: number, value: TextContentFormValue): Observable<ModuleContentBlock> {
    const block = this.contentBlocks.find(b => b.id === blockId && b.moduleId === moduleId && b.type === 'TEXT');
    if (!block) return this.notFound('Bloco de conteúdo', blockId);

    (block as import('../../../core/models/module-content.model').TextContentBlock).title = value.title;
    (block as import('../../../core/models/module-content.model').TextContentBlock).body = value.body;
    return this.simulate(this.clone(block));
  }

  addMediaBlock(moduleId: number, mediaId: number, caption?: string): Observable<ModuleContentBlock> {
    const media = this.media.find(m => m.id === mediaId);
    if (!media) return this.notFound('Mídia', mediaId);

    const block: ModuleContentBlock = {
      id: this.nextBlockId++,
      moduleId,
      type: 'MEDIA',
      order: this.nextBlockOrder(moduleId),
      mediaId,
      caption
    };
    this.contentBlocks.push(block);
    return this.simulate(this.clone(block));
  }

  deleteContentBlock(moduleId: number, blockId: number): Observable<void> {
    this.contentBlocks = this.contentBlocks.filter(b => !(b.id === blockId && b.moduleId === moduleId));
    return this.simulate(undefined);
  }

  reorderContentBlocks(moduleId: number, orderedBlockIds: number[]): Observable<void> {
    orderedBlockIds.forEach((id, index) => {
      const block = this.contentBlocks.find(b => b.id === id && b.moduleId === moduleId);
      if (block) block.order = index + 1;
    });
    return this.simulate(undefined);
  }

  // ----- Media library -----

  listMedia(courseId: number): Observable<MediaAsset[]> {
    const result = this.media.filter(m => m.courseId === courseId).map(m => this.clone(m));
    return this.simulate(result);
  }

  uploadMedia(courseId: number, file: File, type: MediaType): Observable<MediaAsset> {
    const asset: MediaAsset = {
      id: this.nextMediaId++,
      courseId,
      type,
      name: file.name,
      // Mock-only: a real backend would upload the file and return a durable URL.
      url: URL.createObjectURL(file),
      mimeType: file.type || undefined,
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString()
    };
    this.media.push(asset);
    return this.simulate(this.clone(asset));
  }

  deleteMedia(mediaId: number): Observable<void> {
    this.media = this.media.filter(m => m.id !== mediaId);
    this.contentBlocks = this.contentBlocks.filter(b => !(b.type === 'MEDIA' && b.mediaId === mediaId));
    return this.simulate(undefined);
  }
}
