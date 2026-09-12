/**
 * PLACEHOLDER MODEL.
 *
 * quali-courses-api has no gamification endpoints yet (no points ledger, no
 * levels/badges table). This shape is a first guess at what the backend
 * contract will look like, used to render a believable placeholder in the
 * Talentos/course screens until the real feature is built.
 *
 * TODO: replace GamificationMockService with a real HTTP-backed service
 * once the backend exposes it, and delete this comment.
 */
export interface StudentGamificationSummary {
  studentId: number;
  totalPoints: number;
  level: number;
  levelLabel: string;
  /** Points still needed to reach the next level. */
  pointsToNextLevel: number;
}
