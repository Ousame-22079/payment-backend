export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>💳 Payment Platform API</h1>
      <h2>Endpoints disponibles :</h2>
      <ul>
        <li>POST /api/auth/register</li>
        <li>POST /api/auth/login</li>
        <li>GET  /api/auth/me</li>
        <li>GET  /api/users (Admin)</li>
        <li>GET  /api/users/:id</li>
        <li>PUT  /api/users/:id</li>
        <li>DELETE /api/users/:id (Admin)</li>
        <li>GET  /api/transactions</li>
        <li>POST /api/transactions</li>
        <li>GET  /api/transactions/:id</li>
        <li>PATCH /api/transactions/:id (Admin)</li>
        <li>GET  /api/dashboard</li>
      </ul>
    </main>
  )
}
