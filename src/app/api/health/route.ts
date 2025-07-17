// API endpoint para health check do Portainer
export async function GET() {
  return Response.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'FluxDash' 
  });
}
