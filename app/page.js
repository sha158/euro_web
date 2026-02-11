import TopBar from './components/TopBar';
import StatCard from './components/StatCard';
import SalesChart from './components/SalesChart';
import ActivityFeed from './components/ActivityFeed';
import StageChart from './components/StageChart';
import { dashboardStats, salesAnalytics, opportunityStages, recentActivities } from './data/mockData';

export default function Dashboard() {
  return (
    <>
      <TopBar title="Dashboard" subtitle="Welcome back, Admin User" />

      <div style={{ padding: '32px' }}>
        {/* KPI Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="Created Opportunity"
            count={dashboardStats.createdOpportunity.count}
            value={dashboardStats.createdOpportunity.value}
            trend={dashboardStats.createdOpportunity.trend}
            trendUp={dashboardStats.createdOpportunity.trendUp}
            color="#3b82f6"
            delay={0}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            }
          />
          <StatCard
            title="Newly Quoted"
            count={dashboardStats.newlyQuoted.count}
            value={dashboardStats.newlyQuoted.value}
            trend={dashboardStats.newlyQuoted.trend}
            trendUp={dashboardStats.newlyQuoted.trendUp}
            color="#8b5cf6"
            delay={100}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            }
          />
          <StatCard
            title="Won Opportunity"
            count={dashboardStats.wonOpportunity.count}
            value={dashboardStats.wonOpportunity.value}
            trend={dashboardStats.wonOpportunity.trend}
            trendUp={dashboardStats.wonOpportunity.trendUp}
            color="#10b981"
            delay={200}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
          />
          <StatCard
            title="Lost Opportunity"
            count={dashboardStats.lostOpportunity.count}
            value={dashboardStats.lostOpportunity.value}
            trend={dashboardStats.lostOpportunity.trend}
            trendUp={dashboardStats.lostOpportunity.trendUp}
            color="#ef4444"
            delay={300}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            }
          />
        </div>

        {/* Analytics Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Main Chart */}
          <div style={{ gridColumn: 'span 8' }}>
            <SalesChart data={salesAnalytics} />
          </div>

          {/* Stage Breakdown */}
          <div style={{ gridColumn: 'span 4' }}>
            <StageChart data={opportunityStages} />
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px'
        }}>
          {/* Recent Activity */}
          <div style={{ gridColumn: 'span 6' }}>
            <ActivityFeed activities={recentActivities} />
          </div>

          {/* Location/Map Placeholder */}
          <div style={{ gridColumn: 'span 6' }} className="fade-in">
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid var(--border-primary)',
              padding: '24px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                Opportunity Locations
              </h3>
              <div style={{
                flex: 1,
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed var(--border-secondary)'
              }}>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '12px', opacity: 0.5 }}>
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                  </svg>
                  <p>Map View Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
