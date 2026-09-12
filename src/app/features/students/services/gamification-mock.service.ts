import { Injectable } from '@angular/core';
import { StudentGamificationSummary } from '../../../core/models/gamification.model';

/**
 * PLACEHOLDER / TEMPORARY MOCK - see StudentGamificationSummary for context.
 *
 * Fabricates a deterministic points/level summary from the student id so
 * gamification has something real to render in the UI. No ledger, no
 * events, no badges yet - just a total and a level derived from it.
 *
 * TODO: replace with a real HTTP-backed service once quali-courses-api
 * exposes a gamification/points endpoint, and delete this mock.
 */
@Injectable({ providedIn: 'root' })
export class GamificationMockService {
  private static readonly POINTS_PER_LEVEL = 150;
  private static readonly LEVEL_LABELS = ['Iniciante', 'Aprendiz', 'Dedicado(a)', 'Avançado(a)', 'Referência'];

  getSummary(studentId: number): StudentGamificationSummary {
    const totalPoints = 40 + ((studentId * 53) % 620);
    const level = Math.min(
      GamificationMockService.LEVEL_LABELS.length,
      1 + Math.floor(totalPoints / GamificationMockService.POINTS_PER_LEVEL)
    );
    const levelLabel = GamificationMockService.LEVEL_LABELS[level - 1];
    const nextLevelThreshold = level * GamificationMockService.POINTS_PER_LEVEL;
    const pointsToNextLevel = level >= GamificationMockService.LEVEL_LABELS.length
      ? 0
      : Math.max(0, nextLevelThreshold - totalPoints);

    return { studentId, totalPoints, level, levelLabel, pointsToNextLevel };
  }
}
