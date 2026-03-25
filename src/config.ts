import { z } from 'zod';

const envSchema = z.object({
  GOOGLE_ADS_CLIENT_ID: z.string().min(1),
  GOOGLE_ADS_CLIENT_SECRET: z.string().min(1),
  GOOGLE_ADS_REFRESH_TOKEN: z.string().min(1),
  GOOGLE_ADS_DEVELOPER_TOKEN: z.string().min(1),
  GOOGLE_ADS_CUSTOMER_ID: z.string().min(1),
  GOOGLE_ADS_LOGIN_CUSTOMER_ID: z.string().optional(),
  GOOGLE_ADS_PROJECT_ID: z.string().optional(),
  GOOGLE_ADS_MCP_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info')
});

export type GoogleAdsConfig = z.infer<typeof envSchema>;

export function loadConfig(source: NodeJS.ProcessEnv = process.env): GoogleAdsConfig {
  return envSchema.parse(source);
}
