import { prisma } from '@/shared/lib/prisma';
import type { FlowSnapshot } from '@prisma/client';

/**
 * Owns the published workflow state.
 *
 * Responsibilities:
 *   - findByBotId  — webhook reads the published graph from here
 *   - upsertByFlowId — publish action creates/replaces the snapshot
 *
 * Invariant enforced at DB level: FlowSnapshot.flowId is @unique,
 * so there is always at most one published snapshot per flow.
 *
 * This repository is intentionally separate from workflowRepository (draft).
 * Draft mutations must never touch this table; publish is the only writer.
 */
export const flowSnapshotRepository = {
  /**
   * Load the published snapshot for a given bot.
   * Traverses FlowSnapshot → Flow via the flowId FK to filter by botId.
   * Returns null if the bot has never been published.
   */
  async findByBotId(botId: string): Promise<FlowSnapshot | null> {
    return prisma.flowSnapshot.findFirst({
      where: { flow: { botId } },
    });
  },

  /**
   * Create or replace the published snapshot for a given flow.
   * Called inside the publish transaction in publishBotAction.
   * The snapshot is always built from the already-persisted Flow —
   * never from in-memory editor state.
   */
  async upsertByFlowId(
    flowId: string,
    nodes: FlowSnapshot['nodes'],
    edges: FlowSnapshot['edges']
  ): Promise<FlowSnapshot> {
    return prisma.flowSnapshot.upsert({
      where: { flowId },
      create: { flowId, nodes, edges },
      // Explicit updatedAt so republish advances the timestamp used by getBotStatus.
      update: { nodes, edges, updatedAt: new Date() },
    });
  },
};
