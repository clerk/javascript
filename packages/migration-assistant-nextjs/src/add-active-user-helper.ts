import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const userSchema = z.discriminatedUnion('mark_active', [
  z.object({
    mark_active: z.literal(true),
    external_id: z.string(),
  }),
  z.object({
    mark_active: z.literal(false),
    external_id: z.undefined(),
  }),
]);

const clientReqBodySchema = z.object({
  is_signed_into_clerk: z.boolean().optional(),
  browser_id: z.string().optional(),
});

type UserData = z.infer<typeof userSchema>;

export const addActiveUserHandler = (migrationsBaseUrl: string, getUserData: () => Promise<UserData> | UserData) => {
  return async (request: NextRequest) => {
    try {
      const userData = await getUserData();
      const validatedData = userSchema.parse(userData);

      const clientReqBody = clientReqBodySchema.parse(await request.json());

      if (!validatedData.mark_active) {
        return NextResponse.json({ message: 'No action required when mark_active is false' }, { status: 201 });
      }

      const response = await fetch(`${migrationsBaseUrl}/v1/migrations/add-active-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          external_id: validatedData.external_id,
          is_signed_into_clerk: clientReqBody?.is_signed_into_clerk,
          browser_id: clientReqBody?.browser_id,
        }),
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
      }
      console.error('Error adding active user:', error);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  };
};
