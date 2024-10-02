import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the input schema
const inputSchema = z.object({
  external_ids: z.array(z.string()),
});

// Define the output schema for a single user
const external_user_output_same = z.object({
  external_id: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  password_digest: z.string().optional(),
  password_hasher: z.string().optional(),
  skip_password_checks: z.boolean().optional(),
  skip_password_requirement: z.boolean().optional(),
  public_metadata: z.record(z.string()).optional(),
  private_metadata: z.record(z.string()).optional(),
  unsafe_metadata: z.record(z.string()).optional(),
  delete_self_enabled: z.boolean().optional(),
  create_organization_enabled: z.boolean().optional(),
  create_organization_limit: z.number().optional(),
});

const external_user_output_different = z.object({
  email_address: z.array(z.string()).max(1).min(1).optional(),
  phone_number: z.array(z.string()).max(1).min(1).optional(),
  web3_wallet: z.array(z.string()).max(1).min(1).optional(),
  profile_image_url: z.string().optional(),
});

const externalUserSchema = z.intersection(external_user_output_same, external_user_output_different);

type ExternalUser = z.infer<typeof externalUserSchema>;

export const getUsersByIdsHandler = (getUsersData: (input: { external_ids: string[] }) => Promise<ExternalUser[]>) => {
  return async (req: NextRequest) => {
    // Authorize the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== process.env.CLERK_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = await req.json();
      const { external_ids } = inputSchema.parse(body);

      const users = await getUsersData({ external_ids });
      const validatedUsers = z.array(externalUserSchema).parse(users);

      return NextResponse.json(validatedUsers);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
      }
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
};
