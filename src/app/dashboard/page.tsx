export default function DashboardPage() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Business Coaching Platform</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        
        <a href="/assessment" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', textDecoration: 'none', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Business Assessment</h2>
          <p style={{ margin: 0, color: '#666' }}>54-question evaluation</p>
        </a>
        
        <a href="/strategic-wheel" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', textDecoration: 'none', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Strategic Wheel</h2>
          <p style={{ margin: 0, color: '#666' }}>6-component framework</p>
        </a>
        
        <a href="/swot" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', textDecoration: 'none', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>SWOT Analysis</h2>
          <p style={{ margin: 0, color: '#666' }}>Strategic analysis</p>
        </a>
        
        <a href="/revenue-roadmap" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', textDecoration: 'none', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Revenue Roadmap</h2>
          <p style={{ margin: 0, color: '#666' }}>Growth strategies</p>
        </a>
        
        <a href="/success-disciplines" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', textDecoration: 'none', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Success Disciplines</h2>
          <p style={{ margin: 0, color: '#666' }}>12 areas of excellence</p>
        </a>
        
        <a href="/business-profile" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', textDecoration: 'none', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Business Profile</h2>
          <p style={{ margin: 0, color: '#666' }}>Company information</p>
        </a>
        
        <a href="/goals/vision" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', textDecoration: 'none', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Goals & Vision</h2>
          <p style={{ margin: 0, color: '#666' }}>Set and track goals</p>
        </a>
        
        <a href="/test-goals" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', textDecoration: 'none', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Profit Calculator</h2>
          <p style={{ margin: 0, color: '#666' }}>Industry-specific tool</p>
        </a>
        
        <a href="/coach-dashboard" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', textDecoration: 'none', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Coach Dashboard</h2>
          <p style={{ margin: 0, color: '#666' }}>Multi-client management</p>
        </a>
        
      </div>
    </div>
  )
}
