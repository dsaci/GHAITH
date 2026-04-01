/**
 * Lightweight GraphQL request utility
 * Targeted for Supabase /graphql/v1 endpoint
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const GRAPHQL_ENDPOINT = `${SUPABASE_URL}/graphql/v1`;

export async function graphqlRequest<T>(
    query: string,
    variables: Record<string, any> = {},
    accessToken?: string
): Promise<T> {
    if (!accessToken) {
        throw new Error('GraphQL request missing access token');
    }

    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        } as HeadersInit,
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    const body = await response.json();

    if (body.errors) {
        console.error('GraphQL Errors:', body.errors);
        throw new Error(body.errors[0]?.message || 'GraphQL Request Failed');
    }

    return body.data as T;
}
