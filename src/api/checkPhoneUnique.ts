import { z } from 'zod';
import { createEndpoint, Registrations } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  description: 'Check if a normalised phone number is already registered',
  inputSchema: z.object({
    normalisedPhone: z.string(),
  }),
  outputSchema: z.object({ isUnique: z.boolean() }),
  execute: async ({ input }) => {
    const existing = await Registrations.findOne({
      filters: { mainPhoneNormalised: input.normalisedPhone },
      fields: ['id'],
    });
    return { isUnique: !existing };
  },
});
