//@ts-nocheck

// Wrapped fetch method
export const wrapperdFetch = (cb:(jsonData:Record<string,any>)=>void)=>async (...args) => {
  const [input, init] = args;
  const url = typeof input === 'string' ? input : input.url;
  console.log('-------fetch-------',JSON.stringify(args[1],null,2))
  // Execute original fetch
  const response = await fetch(...args);

  // Clone response (because response body can only be read once)
  const responseClone = response.clone();

  // Handle based on response type
  if (isSSE(responseClone)) {
    // SSE processing: listen to events and print
    console.log('=== SSE Response ===');
    console.log('URL:', url);
    console.log('Status:', responseClone.status);
    
    const reader = responseClone.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    // Background read SSE stream (does not block original response)
    (async () => {
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          console.log('SSE Chunk:', chunk);
        }
      }
      console.log('SSE Complete');
    })();
  } else {
    // Normal response processing: print response content
    try {
      // Try to parse as JSON
      const data = await responseClone.json();
      cb(data);
    } catch {
      // Non-JSON response (such as text, Blob, etc.)
      const text = await responseClone.text().catch(() => 'Binary data');
      console.log('parse error',text);
    }
  }

  // Return original response (does not affect normal usage)
  return response;
};

// Helper function: determine if it's an SSE response
function isSSE(response) {
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('text/event-stream');
}

// Helper function: parse request body (handle FormData, JSON, etc.)
async function parseBody(body) {
  if (!body) return null;
  
  if (body instanceof FormData) {
    const formDataObj = {};
    for (const [key, value] of body.entries()) {
      formDataObj[key] = value;
    }
    return formDataObj;
  }
  
  if (body instanceof Blob) {
    return `Blob (type: ${body.type}, size: ${body.size}B)`;
  }
  
  if (body instanceof ReadableStream) {
    return 'ReadableStream (stream data)';
  }
  
  // Text type directly return
  return await new Response(body).text();
}