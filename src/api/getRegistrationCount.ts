import { z } from 'zod';
import { createEndpoint, Registrations } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  description: 'Get current registration count for capacity check',
  inputSchema: z.object({}),
  outputSchema: z.object({ count: z.number() }),
  execute: async () => {
    let count = 0;
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const result = await Registrations.findAll({
        filters: { adminStatus: { notIn: ['Cancelled'] } },
        offset,
        limit: 2000,
        fields: ['id'],
      });
      count += result.records.length;
      hasMore = result.hasMore;
      offset += result.records.length;
    }
    return { count };
  },
});
