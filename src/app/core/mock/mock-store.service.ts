import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Community, CommunityFormValue } from '../models/community.model';
import { Company, CompanyFormValue } from '../models/company.model';
import { Job, JobFormValue } from '../models/job.model';
import { Course, CourseFormValue } from '../models/course.model';
import { CourseTech, CourseTechFormValue } from '../models/course-tech.model';
import { Student, StudentFormValue } from '../models/student.model';
import { PlatformUser, PlatformUserFormValue } from '../models/platform-user.model';
import { ProfileDetails, ProfileFormValue } from '../models/profile.model';
import { AppRole } from '../models/role.model';
import { Page } from '../models/page.model';

/**
 * TEMPORARY - centralized in-memory data store used while
 * `environment.useMockApi` is `true` (see environment.ts).
 *
 * This is the single source of truth for every mocked entity
 * (communities, companies, courses, students). It is a plain
 * `providedIn: 'root'` singleton, so all `*MockDataSource` implementations
 * that inject it share the exact same in-memory arrays for the lifetime of
 * the browser tab: creating/editing/deleting through one screen is
 * immediately visible on every other screen that reads from the store,
 * exactly like a real backend + database would behave. Nothing here is
 * persisted - a page refresh resets the data to the seed below.
 *
 * This class deliberately knows nothing about HTTP, Observables-as-a-network
 * concept, or Angular DI tokens beyond being injectable - it is pure
 * in-memory CRUD. The `*MockDataSource` classes are the ones responsible for
 * exposing this as an `Observable`-returning API shaped like the real
 * `*DataSource` contract (see e.g. `community.datasource.ts`).
 *
 * TODO: once quali-core-api/quali-courses-api are ready for the frontend to
 * fully rely on, set `environment.useMockApi = false` and (optionally, once
 * nothing references it anymore) delete this file along with the
 * `*MockDataSource` implementations. Nothing else needs to change.
 */
@Injectable({ providedIn: 'root' })
export class MockStoreService {
  private static readonly LATENCY_MS = 300;

  // ----- Seed data -----

  private communities: Community[] = [
    {
      id: 1,
      name: 'Caldas Novas',
      description: 'Programa municipal de qualificação profissional de Caldas Novas.',
      status: 'ACTIVE',
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-06-01T09:00:00Z'
    },
    {
      id: 2,
      name: 'Rio Verde',
      description: 'Programa municipal de qualificação profissional de Rio Verde.',
      status: 'ACTIVE',
      createdAt: '2026-02-10T09:00:00Z',
      updatedAt: '2026-05-20T09:00:00Z'
    },
    {
      id: 3,
      name: 'Anápolis',
      description: 'Programa municipal de qualificação profissional de Anápolis (em fase de estruturação).',
      status: 'INACTIVE',
      createdAt: '2026-03-05T09:00:00Z',
      updatedAt: '2026-03-05T09:00:00Z'
    }
  ];

  private companies: Company[] = [
    {
      id: 1,
      communityId: 1,
      name: 'Tech Partner',
      description: 'Indústria metalúrgica, oferece vagas de aprendizagem e treinamento presencial.',
      website: 'https://exemplo-empresa-a.com.br',
      ofereceTreinamentoPresencial: true,
      diasTreinamentoPresencial: ['MON', 'WED', 'FRI'],
      horarioTreinamentoInicio: '08:00',
      horarioTreinamentoFim: '12:00',
      status: 'ACTIVE'
    },
    {
      id: 2,
      communityId: 1,
      name: 'Edu Parceira',
      description: 'Rede de lojas de varejo com programa de contratação de jovens aprendizes.',
      website: 'https://exemplo-varejo.com.br',
      ofereceTreinamentoPresencial: false,
      status: 'ACTIVE'
    },
    {
      id: 3,
      communityId: 2,
      name: 'Varejo Parceiro',
      description: 'Cooperativa agroindustrial parceira do programa em Rio Verde.',
      website: 'https://exemplo-cooperativa.com.br',
      ofereceTreinamentoPresencial: true,
      diasTreinamentoPresencial: ['TUE', 'THU'],
      horarioTreinamentoInicio: '13:30',
      horarioTreinamentoFim: '17:30',
      status: 'ACTIVE'
    }
  ];

  private jobs: Job[] = [
    {
      id: 1,
      communityId: 1,
      companyId: 1,
      title: 'Auxiliar de Produção',
      description: 'Vaga de aprendizagem em linha de produção, com treinamento presencial fornecido pela empresa.',
      location: 'Caldas Novas, GO',
      type: 'APRENDIZ',
      workMode: 'PRESENCIAL',
      publishedAt: '2026-07-01T09:00:00Z',
      status: 'ACTIVE'
    },
    {
      id: 2,
      communityId: 1,
      companyId: 1,
      title: 'Assistente Administrativo',
      description: 'Rotinas administrativas, atendimento a fornecedores e apoio ao setor financeiro.',
      location: 'Caldas Novas, GO',
      type: 'CLT',
      workMode: 'PRESENCIAL',
      publishedAt: '2026-07-10T09:00:00Z',
      status: 'ACTIVE'
    },
    {
      id: 3,
      communityId: 1,
      companyId: 2,
      title: 'Operador(a) de Caixa',
      description: 'Atendimento ao cliente, abertura e fechamento de caixa em loja de varejo.',
      location: 'Caldas Novas, GO',
      type: 'CLT',
      workMode: 'PRESENCIAL',
      publishedAt: '2026-06-20T09:00:00Z',
      status: 'ACTIVE'
    },
    {
      id: 4,
      communityId: 1,
      companyId: 2,
      title: 'Estágio em Marketing',
      description: 'Apoio na criação de campanhas para redes sociais e materiais promocionais.',
      location: 'Caldas Novas, GO',
      type: 'ESTAGIO',
      workMode: 'HIBRIDO',
      publishedAt: '2026-08-01T09:00:00Z',
      status: 'ACTIVE'
    },
    {
      id: 5,
      communityId: 2,
      companyId: 3,
      title: 'Técnico(a) Agroindustrial',
      description: 'Apoio nos processos de recebimento e beneficiamento de grãos da cooperativa.',
      location: 'Rio Verde, GO',
      type: 'CLT',
      workMode: 'PRESENCIAL',
      publishedAt: '2026-06-15T09:00:00Z',
      status: 'ACTIVE'
    },
    {
      id: 6,
      communityId: 2,
      companyId: 3,
      title: 'Assistente de Logística (Temporário)',
      description: 'Apoio temporário durante o período de safra, controle de estoque e expedição.',
      location: 'Rio Verde, GO',
      type: 'TEMPORARIO',
      workMode: 'PRESENCIAL',
      publishedAt: '2026-05-20T09:00:00Z',
      status: 'INACTIVE'
    }
  ];

  private courses: Course[] = [
    {
      id: 1,
      communityId: 1,
      name: 'Introdução à Logística',
      description: 'Fundamentos de logística e cadeia de suprimentos para o mercado de trabalho local.',
      duration: '40h',
      status: 'ACTIVE',
      studentsCount: 28
    },
    {
      id: 2,
      communityId: 1,
      name: 'Atendimento ao Cliente',
      description: 'Boas práticas de atendimento presencial e digital, com oficina prática em empresa parceira.',
      duration: '32h',
      status: 'ACTIVE',
      studentsCount: 41
    },
    {
      id: 3,
      communityId: 2,
      name: 'Fundamentos de Cooperativismo',
      description: 'Introdução ao cooperativismo e economia solidária.',
      duration: '24h',
      status: 'ACTIVE',
      studentsCount: 15
    }
  ];

  private students: Student[] = [
    { id: 1, communityId: 1, userId: 101, fullName: 'Ana Souza', email: 'ana.souza@exemplo.com', education: 'Ensino Médio completo', coursePreferences: [1], status: 'ACTIVE' },
    { id: 2, communityId: 1, userId: 102, fullName: 'Bruno Lima', email: 'bruno.lima@exemplo.com', education: 'Ensino Médio completo', coursePreferences: [2], status: 'ACTIVE' },
    { id: 3, communityId: 1, userId: 103, fullName: 'Carla Mendes', email: 'carla.mendes@exemplo.com', education: 'Ensino Superior incompleto', coursePreferences: [1, 2], status: 'ACTIVE' },
    { id: 4, communityId: 1, userId: 104, fullName: 'Diego Ferreira', email: 'diego.ferreira@exemplo.com', education: 'Ensino Médio completo', status: 'INACTIVE' },
    { id: 5, communityId: 2, userId: 105, fullName: 'Elaine Costa', email: 'elaine.costa@exemplo.com', education: 'Ensino Superior completo', coursePreferences: [3], status: 'ACTIVE' },
    { id: 6, communityId: 2, userId: 106, fullName: 'Fábio Rocha', email: 'fabio.rocha@exemplo.com', education: 'Ensino Médio completo', status: 'ACTIVE' },
    { id: 7, communityId: 1, fullName: 'Gustavo Nery', email: 'gustavo.nery@exemplo.com', education: 'Ensino Médio completo', coursePreferences: [1], status: 'ACTIVE', isPcd: true, pcdDescription: 'Deficiência física - mobilidade reduzida, faz uso de cadeira de rodas.' },
    { id: 8, communityId: 1, fullName: 'Helena Prado', email: 'helena.prado@exemplo.com', education: 'Ensino Superior incompleto', coursePreferences: [2], status: 'ACTIVE', isPcd: true, pcdDescription: 'Deficiência auditiva - surdez bilateral, comunica-se por Libras.' },
    { id: 9, communityId: 2, fullName: 'Igor Batista', email: 'igor.batista@exemplo.com', education: 'Ensino Médio completo', status: 'ACTIVE', isPcd: true, pcdDescription: 'Baixa visão.' }
  ];

  private users: PlatformUser[] = [
    { id: 1, fullName: 'Admin', email: 'admin@qualificando.local', role: AppRole.ADMIN },
    { id: 101, fullName: 'Ana Souza', email: 'ana.souza@qualificando.local', role: AppRole.ALUNO, communityId: 1 },
    { id: 102, fullName: 'Bruno Lima', email: 'bruno.lima@qualificando.local', role: AppRole.ALUNO, communityId: 1 },
    { id: 103, fullName: 'Carla Mendes', email: 'carla.mendes@qualificando.local', role: AppRole.ALUNO, communityId: 1 },
    { id: 104, fullName: 'Diego Ferreira', email: 'diego.ferreira@qualificando.local', role: AppRole.ALUNO, communityId: 1 },
    { id: 105, fullName: 'Elaine Costa', email: 'elaine.costa@qualificando.local', role: AppRole.ALUNO, communityId: 1 },
    { id: 106, fullName: 'Fábio Rocha', email: 'fabio.rocha@qualificando.local', role: AppRole.ALUNO, communityId: 1 },
    { id: 201, fullName: 'Tech Partner', email: 'empresa.techpartner@qualificando.local', role: AppRole.EMPRESARIO, communityId: 1, companyId: 1 },
    { id: 202, fullName: 'Edu Parceira', email: 'empresa.eduparceira@qualificando.local', role: AppRole.EMPRESARIO, communityId: 1, companyId: 2 },
    { id: 203, fullName: 'Varejo Parceiro', email: 'empresa.varejoparceiro@qualificando.local', role: AppRole.EMPRESARIO, communityId: 2, companyId: 3 },
    { id: 301, fullName: 'Secretaria de Trabalho', email: 'secretaria.trabalho@caldasnovas.go.gov.br', role: AppRole.PODER_PUBLICO, communityId: 1 },
    { id: 302, fullName: 'Prefeitura de Caldas Novas', email: 'contato@caldasnovas.go.gov.br', role: AppRole.PODER_PUBLICO, communityId: 1 }
  ];

  /** courseId -> Set of studentIds. Mutated by enroll(). */
  private enrollments = new Map<number, Set<number>>([
    [1, new Set([1, 2, 3])],
    [2, new Set([2, 4, 5])],
    [3, new Set([1, 5, 6])]
  ]);

  private nextCommunityId = this.communities.length + 1;
  private nextCompanyId = this.companies.length + 1;
  private nextJobId = this.jobs.length + 1;
  private nextCourseId = this.courses.length + 1;
  private nextStudentId = this.students.length + 1;
  private nextUserId = Math.max(...this.users.map(u => u.id)) + 1;

  // ----- Shared helpers -----

  private simulate<T>(value: T): Observable<T> {
    return of(value).pipe(delay(MockStoreService.LATENCY_MS));
  }

  private notFound<T>(what: string, id: number): Observable<T> {
    return throwError(() => new Error(`${what} ${id} não encontrado(a).`)).pipe(delay(MockStoreService.LATENCY_MS));
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }

  private paginate<T>(items: T[], page: number, size: number): Page<T> {
    const start = page * size;
    const content = items.slice(start, start + size);
    return {
      content: content.map(item => this.clone(item)),
      totalElements: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / size)),
      number: page,
      size
    };
  }

  private matches(text: string | undefined, search: string): boolean {
    return (text ?? '').toLowerCase().includes(search.toLowerCase());
  }

  // ===== Communities =====

  listCommunities(page: number, size: number, search: string): Observable<Page<Community>> {
    const filtered = this.communities.filter(c => !search || this.matches(c.name, search) || this.matches(c.description, search));
    return this.simulate(this.paginate(filtered, page, size));
  }

  getCommunity(id: number): Observable<Community> {
    const found = this.communities.find(c => c.id === id);
    return found ? this.simulate(this.clone(found)) : this.notFound('Comunidade', id);
  }

  createCommunity(value: CommunityFormValue): Observable<Community> {
    const created: Community = {
      id: this.nextCommunityId++,
      name: value.name,
      description: value.description,
      status: value.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.communities.push(created);
    return this.simulate(this.clone(created));
  }

  updateCommunity(id: number, value: CommunityFormValue): Observable<Community> {
    const existing = this.communities.find(c => c.id === id);
    if (!existing) return this.notFound('Comunidade', id);
    existing.name = value.name;
    existing.description = value.description;
    existing.status = value.status;
    existing.updatedAt = new Date().toISOString();
    return this.simulate(this.clone(existing));
  }

  deleteCommunity(id: number): Observable<void> {
    this.communities = this.communities.filter(c => c.id !== id);
    return this.simulate(undefined);
  }

  // ===== Companies =====

  listCompanies(page: number, size: number, search: string, communityId?: number | null): Observable<Page<Company>> {
    const filtered = this.companies.filter(
      c =>
        (!search || this.matches(c.name, search) || this.matches(c.description, search)) &&
        (communityId == null || c.communityId === communityId)
    );
    return this.simulate(this.paginate(filtered, page, size));
  }

  getCompany(id: number): Observable<Company> {
    const found = this.companies.find(c => c.id === id);
    return found ? this.simulate(this.clone(found)) : this.notFound('Empresa', id);
  }

  createCompany(value: CompanyFormValue): Observable<Company> {
    const created: Company = {
      id: this.nextCompanyId++,
      communityId: value.communityId,
      name: value.name,
      description: value.description,
      logoUrl: value.logoUrl,
      website: value.website,
      ofereceTreinamentoPresencial: value.ofereceTreinamentoPresencial,
      diasTreinamentoPresencial: value.ofereceTreinamentoPresencial ? value.diasTreinamentoPresencial : undefined,
      horarioTreinamentoInicio: value.ofereceTreinamentoPresencial ? value.horarioTreinamentoInicio : undefined,
      horarioTreinamentoFim: value.ofereceTreinamentoPresencial ? value.horarioTreinamentoFim : undefined,
      status: value.status
    };
    this.companies.push(created);
    return this.simulate(this.clone(created));
  }

  updateCompany(id: number, value: CompanyFormValue): Observable<Company> {
    const existing = this.companies.find(c => c.id === id);
    if (!existing) return this.notFound('Empresa', id);
    existing.communityId = value.communityId;
    existing.name = value.name;
    existing.description = value.description;
    existing.logoUrl = value.logoUrl;
    existing.website = value.website;
    existing.ofereceTreinamentoPresencial = value.ofereceTreinamentoPresencial;
    existing.diasTreinamentoPresencial = value.ofereceTreinamentoPresencial ? value.diasTreinamentoPresencial : undefined;
    existing.horarioTreinamentoInicio = value.ofereceTreinamentoPresencial ? value.horarioTreinamentoInicio : undefined;
    existing.horarioTreinamentoFim = value.ofereceTreinamentoPresencial ? value.horarioTreinamentoFim : undefined;
    existing.status = value.status;
    return this.simulate(this.clone(existing));
  }

  deleteCompany(id: number): Observable<void> {
    this.companies = this.companies.filter(c => c.id !== id);
    return this.simulate(undefined);
  }

  // ===== Jobs =====

  listJobs(page: number, size: number, search: string, communityId?: number | null): Observable<Page<Job>> {
    const filtered = this.jobs.filter(
      j =>
        (!search || this.matches(j.title, search) || this.matches(j.description, search) || this.matches(j.location, search)) &&
        (communityId == null || j.communityId === communityId)
    );
    return this.simulate(this.paginate(filtered, page, size));
  }

  createJob(value: JobFormValue): Observable<Job> {
    const created: Job = {
      id: this.nextJobId++,
      communityId: value.communityId ?? 1, // falls back to Caldas Novas (community 1) for admins (see CurrentUserContextService)
      companyId: value.companyId,
      title: value.title,
      description: value.description,
      location: value.location,
      type: value.type,
      workMode: value.workMode,
      isPcd: value.isPcd,
      publishedAt: new Date().toISOString(),
      status: value.status
    };
    this.jobs.push(created);
    return this.simulate(this.clone(created));
  }

  updateJob(id: number, value: JobFormValue): Observable<Job> {
    const existing = this.jobs.find(j => j.id === id);
    if (!existing) return this.notFound('Vaga', id);
    existing.companyId = value.companyId;
    existing.title = value.title;
    existing.description = value.description;
    existing.location = value.location;
    existing.type = value.type;
    existing.workMode = value.workMode;
    existing.isPcd = value.isPcd;
    existing.status = value.status;
    return this.simulate(this.clone(existing));
  }

  // ===== Courses =====

  listCourses(page: number, size: number, search: string, communityId?: number | null): Observable<Page<Course>> {
    const filtered = this.courses.filter(
      c =>
        (!search || this.matches(c.name, search) || this.matches(c.description, search)) &&
        (communityId == null || c.communityId === communityId)
    );
    return this.simulate(this.paginate(filtered, page, size));
  }

  getCourse(id: number): Observable<Course> {
    const found = this.courses.find(c => c.id === id);
    return found ? this.simulate(this.clone(found)) : this.notFound('Curso', id);
  }

  createCourse(value: CourseFormValue): Observable<Course> {
    const created: Course = {
      id: this.nextCourseId++,
      communityId: value.communityId,
      name: value.name,
      description: value.description,
      duration: value.duration,
      imageUrl: value.imageUrl,
      status: value.status,
      studentsCount: 0
    };
    this.courses.push(created);
    this.enrollments.set(created.id, new Set());
    return this.simulate(this.clone(created));
  }

  updateCourse(id: number, value: CourseFormValue): Observable<Course> {
    const existing = this.courses.find(c => c.id === id);
    if (!existing) return this.notFound('Curso', id);
    existing.communityId = value.communityId;
    existing.name = value.name;
    existing.description = value.description;
    existing.duration = value.duration;
    existing.imageUrl = value.imageUrl;
    existing.status = value.status;
    return this.simulate(this.clone(existing));
  }

  deleteCourse(id: number): Observable<void> {
    this.courses = this.courses.filter(c => c.id !== id);
    this.enrollments.delete(id);
    return this.simulate(undefined);
  }

  // ===== Courses Tech =====

  private coursesTech: CourseTech[] = [
    {
      id: 101,
      communityId: 1,
      name: 'Introdução à Computação',
      description: 'Conceitos básicos de computação, hardware, software e redes.',
      duration: '20h',
      status: 'ACTIVE',
      studentsCount: 35
    },
    {
      id: 102,
      communityId: 1,
      name: 'Pacote Office',
      description: 'Word, Excel e PowerPoint para o dia a dia profissional.',
      duration: '30h',
      status: 'ACTIVE',
      studentsCount: 50
    },
    {
      id: 103,
      communityId: 1,
      name: 'Introdução à Programação',
      description: 'Lógica de programação, algoritmos e primeiros passos com código.',
      duration: '40h',
      status: 'ACTIVE',
      studentsCount: 28
    },
    {
      id: 104,
      communityId: 2,
      name: 'Programador Java Junior',
      description: 'Formação completa em Java, orientação a objetos e APIs REST.',
      duration: '80h',
      status: 'ACTIVE',
      studentsCount: 18
    },
    {
      id: 105,
      communityId: 1,
      name: 'Programador Front-end Junior',
      description: 'HTML, CSS, JavaScript e framework moderno para interfaces web.',
      duration: '60h',
      status: 'ACTIVE',
      studentsCount: 22
    }
  ];

  private enrollmentsTech = new Map<number, Set<number>>([
    [101, new Set([101, 102, 103])],
    [102, new Set([102, 104, 105])],
    [103, new Set([101, 105, 106])]
  ]);

  private nextCourseTechId = this.coursesTech.length > 0 ? Math.max(...this.coursesTech.map(c => c.id)) + 1 : 101;

  listCoursesTech(page: number, size: number, search: string, communityId?: number | null): Observable<Page<CourseTech>> {
    const filtered = this.coursesTech.filter(
      c =>
        (!search || this.matches(c.name, search) || this.matches(c.description, search)) &&
        (communityId == null || c.communityId === communityId)
    );
    return this.simulate(this.paginate(filtered, page, size));
  }

  getCourseTech(id: number): Observable<CourseTech> {
    const found = this.coursesTech.find(c => c.id === id);
    return found ? this.simulate(this.clone(found)) : this.notFound('Curso Tech', id);
  }

  createCourseTech(value: CourseTechFormValue): Observable<CourseTech> {
    const created: CourseTech = {
      id: this.nextCourseTechId++,
      communityId: value.communityId,
      name: value.name,
      description: value.description,
      duration: value.duration,
      imageUrl: value.imageUrl,
      status: value.status,
      studentsCount: 0
    };
    this.coursesTech.push(created);
    this.enrollmentsTech.set(created.id, new Set());
    return this.simulate(this.clone(created));
  }

  updateCourseTech(id: number, value: CourseTechFormValue): Observable<CourseTech> {
    const existing = this.coursesTech.find(c => c.id === id);
    if (!existing) return this.notFound('Curso Tech', id);
    existing.communityId = value.communityId;
    existing.name = value.name;
    existing.description = value.description;
    existing.duration = value.duration;
    existing.imageUrl = value.imageUrl;
    existing.status = value.status;
    return this.simulate(this.clone(existing));
  }

  deleteCourseTech(id: number): Observable<void> {
    this.coursesTech = this.coursesTech.filter(c => c.id !== id);
    this.enrollmentsTech.delete(id);
    return this.simulate(undefined);
  }

  getEnrolledStudentsForCourseTech(courseId: number): Observable<Student[]> {
    const ids = this.enrollmentsTech.get(courseId) ?? new Set<number>();
    const result = this.students.filter(s => ids.has(s.id)).map(s => this.clone(s));
    return this.simulate(result);
  }

  enrollTech(courseId: number, studentId: number): Observable<void> {
    const course = this.coursesTech.find(c => c.id === courseId);
    if (!course) return this.notFound('Curso Tech', courseId);
    const student = this.students.find(s => s.id === studentId);
    if (!student) return this.notFound('Aluno', studentId);

    const ids = this.enrollmentsTech.get(courseId) ?? new Set<number>();
    if (!ids.has(studentId)) {
      ids.add(studentId);
      this.enrollmentsTech.set(courseId, ids);
      course.studentsCount = (course.studentsCount ?? 0) + 1;
    }
    return this.simulate(undefined);
  }

  getEnrolledStudentsForCourse(courseId: number): Observable<Student[]> {
    const ids = this.enrollments.get(courseId) ?? new Set<number>();
    const result = this.students.filter(s => ids.has(s.id)).map(s => this.clone(s));
    return this.simulate(result);
  }

  // ===== Students =====

  listStudents(page: number, size: number, search: string, communityId?: number | null, pcdOnly?: boolean): Observable<Page<Student>> {
    const filtered = this.students.filter(
      s =>
        (!search || this.matches(s.fullName, search) || this.matches(s.email, search)) &&
        (communityId == null || s.communityId === communityId) &&
        (!pcdOnly || s.isPcd === true)
    );
    return this.simulate(this.paginate(filtered, page, size));
  }

  getStudent(id: number): Observable<Student> {
    const found = this.students.find(s => s.id === id);
    return found ? this.simulate(this.clone(found)) : this.notFound('Aluno', id);
  }

  createStudent(value: StudentFormValue): Observable<Student> {
    const created: Student = {
      id: this.nextStudentId++,
      communityId: value.communityId,
      userId: value.userId,
      fullName: value.fullName,
      email: value.email,
      phone: value.phone,
      address: value.address,
      education: value.education,
      coursePreferences: value.coursePreferences ?? [],
      status: value.status,
      isPcd: value.isPcd ?? false,
      pcdDescription: value.isPcd ? value.pcdDescription : undefined
    };
    this.students.push(created);
    return this.simulate(this.clone(created));
  }

  updateStudent(id: number, value: StudentFormValue): Observable<Student> {
    const existing = this.students.find(s => s.id === id);
    if (!existing) return this.notFound('Aluno', id);
    existing.communityId = value.communityId;
    existing.userId = value.userId;
    existing.fullName = value.fullName;
    existing.email = value.email;
    existing.phone = value.phone;
    existing.address = value.address;
    existing.education = value.education;
    existing.coursePreferences = value.coursePreferences ?? [];
    existing.status = value.status;
    existing.isPcd = value.isPcd ?? false;
    existing.pcdDescription = value.isPcd ? value.pcdDescription : undefined;
    return this.simulate(this.clone(existing));
  }

  deleteStudent(id: number): Observable<void> {
    this.students = this.students.filter(s => s.id !== id);
    this.enrollments.forEach(ids => ids.delete(id));
    return this.simulate(undefined);
  }

  getEnrolledCoursesForStudent(studentId: number): Observable<Course[]> {
    const result = this.courses
      .filter(c => this.enrollments.get(c.id)?.has(studentId))
      .map(c => this.clone(c));
    return this.simulate(result);
  }

  // ===== Platform users (registered via the Administration section) =====

  /**
   * Not paginated on purpose: this backs the search-filterable "linked
   * user" select on the talent form and the admin users table, both of
   * which just need a filtered array, not a `Page<T>`.
   */
  listUsers(search: string): Observable<PlatformUser[]> {
    const filtered = this.users.filter(
      u => !search || this.matches(u.fullName, search) || this.matches(u.email, search)
    );
    return this.simulate(filtered.map(u => this.clone(u)));
  }

  getUser(id: number): Observable<PlatformUser> {
    const found = this.users.find(u => u.id === id);
    return found ? this.simulate(this.clone(found)) : this.notFound('Usuário', id);
  }

  /**
   * Used by `CurrentUserContextService` to resolve the logged-in person's
   * community from their Keycloak email claim (mock-only: no real "current
   * user" endpoint exists yet). Not paginated/simulated with latency since
   * it's an internal lookup, not something a component subscribes to
   * directly.
   */
  findUserByEmail(email: string): PlatformUser | undefined {
    const found = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return found ? this.clone(found) : undefined;
  }

  createUser(value: PlatformUserFormValue): Observable<PlatformUser> {
    const created: PlatformUser = {
      id: this.nextUserId++,
      fullName: value.fullName,
      email: value.email,
      role: value.role,
      phone: value.phone,
      address: value.address,
      communityId: value.role === AppRole.ADMIN ? undefined : value.communityId,
      companyId: value.companyId
    };
    this.users.push(created);
    return this.simulate(this.clone(created));
  }

  updateUser(id: number, value: PlatformUserFormValue): Observable<PlatformUser> {
    const existing = this.users.find(u => u.id === id);
    if (!existing) return this.notFound('Usuário', id);
    existing.fullName = value.fullName;
    existing.email = value.email;
    existing.role = value.role;
    existing.phone = value.phone;
    existing.address = value.address;
    existing.communityId = value.role === AppRole.ADMIN ? undefined : value.communityId;
    existing.companyId = value.companyId;
    return this.simulate(this.clone(existing));
  }

  // ===== Own profile (the logged-in user editing their own info) =====

  /**
   * TEMPORARY MOCK: real editing of the logged-in person's own name/email
   * belongs to Keycloak (account API) and/or quali-core-api, not this
   * frontend-only store. Until that exists, edits are kept here so the
   * "Meu perfil" screen has somewhere to persist them for the session.
   * `defaults` (from the Keycloak token - see ProfileComponent) seed the
   * very first read; after that, whatever was last saved wins.
   */
  private ownProfile: ProfileDetails | null = null;

  getOwnProfile(defaults: ProfileDetails): Observable<ProfileDetails> {
    if (!this.ownProfile) {
      this.ownProfile = { ...defaults };
    }
    return this.simulate(this.clone(this.ownProfile));
  }

  updateOwnProfile(value: ProfileFormValue): Observable<ProfileDetails> {
    this.ownProfile = { ...value };
    return this.simulate(this.clone(this.ownProfile));
  }

  // ===== Enrollment =====

  enroll(courseId: number, studentId: number): Observable<void> {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return this.notFound('Curso', courseId);
    const student = this.students.find(s => s.id === studentId);
    if (!student) return this.notFound('Aluno', studentId);

    const ids = this.enrollments.get(courseId) ?? new Set<number>();
    if (!ids.has(studentId)) {
      ids.add(studentId);
      this.enrollments.set(courseId, ids);
      course.studentsCount = (course.studentsCount ?? 0) + 1;
    }
    return this.simulate(undefined);
  }
}
