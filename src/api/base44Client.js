import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { token, functionsVersion, appBaseUrl } = appParams;

export const base44 = createClient({
  appId: "69d062aca815ce8e697894b1",
  token,
  functionsVersion,
  requiresAuth: false,
  appBaseUrl
});
