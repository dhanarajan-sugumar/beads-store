/**
 * Cloudflare Pages Function: /api/photoroom
 * Secure serverless proxy between the Madhi's Handcrafts admin portal
 * and PhotoRoom's Remove Background API (https://sdk.photoroom.com/v1/segment).
 *
 * Prevents CORS issues and keeps the API key protected.
 */

interface Env {
  PHOTOROOM_API_KEY?: string;
}

interface EventContext<TEnv> {
  request: Request;
  env: TEnv;
}

type PagesFunction<TEnv = Env> = (context: EventContext<TEnv>) => Promise<Response> | Response;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const request = context.request;

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image_file') as File | null;
    const isSandbox = formData.get('sandbox') === 'true';
    let apiKey =
      (formData.get('apiKey') as string) ||
      request.headers.get('x-api-key') ||
      context.env.PHOTOROOM_API_KEY;

    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'No image file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            'PhotoRoom API key is missing. Please enter your API key in the Photo Studio settings.',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    apiKey = apiKey.trim();

    // In sandbox mode, PhotoRoom requires the key to start with 'sandbox_'
    if (isSandbox && !apiKey.startsWith('sandbox_')) {
      apiKey = `sandbox_${apiKey}`;
    } else if (!isSandbox && apiKey.startsWith('sandbox_')) {
      apiKey = apiKey.slice('sandbox_'.length);
    }

    // Forward to PhotoRoom API
    const photoroomBody = new FormData();
    photoroomBody.append('image_file', imageFile);
    photoroomBody.append('format', 'png');
    photoroomBody.append('channels', 'rgba');
    photoroomBody.append('size', 'full');
    photoroomBody.append('crop', 'false');

    const photoroomRes = await fetch('https://sdk.photoroom.com/v1/segment', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: photoroomBody,
    });

    if (!photoroomRes.ok) {
      const errorText = await photoroomRes.text();
      let userFriendlyMessage = errorText;

      if (photoroomRes.status === 401) {
        userFriendlyMessage = 'Invalid PhotoRoom API key. Please verify your key.';
      } else if (photoroomRes.status === 402) {
        userFriendlyMessage =
          'Your PhotoRoom account is out of credits. Switch to Sandbox Mode for free testing.';
      }

      return new Response(
        JSON.stringify({
          error: userFriendlyMessage,
          status: photoroomRes.status,
          raw: errorText,
        }),
        {
          status: photoroomRes.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Return the transparent PNG
    return new Response(photoroomRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
