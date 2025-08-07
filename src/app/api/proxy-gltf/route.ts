import { NextRequest, NextResponse } from 'next/server';

// Configuración para Next.js static export
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    console.log('🔄 Proxy: Fetching', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Determinar el tipo de contenido
    const contentType = response.headers.get('content-type') || 
                       (url.endsWith('.gltf') ? 'model/gltf+json' : 
                        url.endsWith('.bin') ? 'application/octet-stream' : 
                        'application/octet-stream');

    if (url.endsWith('.gltf')) {
      // Para archivos GLTF, necesitamos modificar las referencias a .bin
      const text = await response.text();
      let gltfData = JSON.parse(text);
      
      // Modificar las referencias a archivos .bin para que usen nuestro proxy
      if (gltfData.buffers) {
        gltfData.buffers = gltfData.buffers.map((buffer: any) => {
          if (buffer.uri && buffer.uri.endsWith('.bin')) {
            const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
            const binUrl = baseUrl + buffer.uri;
            const proxiedBinUrl = `/api/proxy-gltf?url=${encodeURIComponent(binUrl)}`;
            
            console.log('🔧 Proxy: Rewriting .bin reference:', buffer.uri, '->', proxiedBinUrl);
            
            return {
              ...buffer,
              uri: proxiedBinUrl
            };
          }
          return buffer;
        });
      }
      
      const modifiedGltf = JSON.stringify(gltfData);
      console.log('✅ Proxy: Successfully processed GLTF with modified references');

      return new NextResponse(modifiedGltf, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } else {
      // Para archivos binarios (.bin), simplemente proxy el contenido
      const data = await response.arrayBuffer();
      
      console.log('✅ Proxy: Successfully fetched binary file', url);

      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' }, 
      { status: 500 }
    );
  }
}
