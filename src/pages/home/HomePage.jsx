import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@mui/material'
import { ROUTE_PATHS } from '../routes'
import { getAppNotice, getHelpNumber, getHomeDashboard, getUserCredit, getUserProfile } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import SideDrawer from '../common/SideDrawer'
import AppIcon from '../common/AppIcon'
import Header from '../common/Header'
import { formatMarketDisplayName } from '../../utils/marketDisplayName'
import './home.css'

function HomePage({ navigate }) {
  const [session] = useState(() => getSession())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [markets, setMarkets] = useState([])
  const [credit, setCredit] = useState(0)
  const [notice, setNotice] = useState('')
  const [help, setHelp] = useState(null)

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const [profileData, dashboardData, creditData, noticeData, helpData] = await Promise.all([
          getUserProfile(session.userId),
          getHomeDashboard(session.userId),
          getUserCredit(session.userId),
          getAppNotice(session.userId),
          getHelpNumber(),
        ])

        setProfile(profileData)
        setMarkets(Array.isArray(dashboardData.data) ? dashboardData.data : [])
        setCredit(Number(creditData || dashboardData.user_balance || 0))
        setNotice(noticeData[0]?.short_description || noticeData[0]?.description || '')
        setHelp(helpData)
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Unable to fetch home data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate, session?.userId])

  const helpNumber = useMemo(
    () => profile?.genral_setting_whatsapp || help?.help_line_number || help?.whatsapp || '',
    [help?.help_line_number, help?.whatsapp, profile?.genral_setting_whatsapp]
  )
  const todayText = useMemo(() => {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yyyy = String(today.getFullYear())
    return `${dd}-${mm}-${yyyy}`
  }, [])

  if (!session?.userId) return null

  return (
    <div className="home-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <main className="home-content">
        {loading ? (
          <div className="home-loading" aria-busy aria-label="Loading home">
            <div className="home-skeleton home-skeleton-hero" />
            <div className="home-skeleton home-skeleton-strip" />
            <div className="home-skeleton home-skeleton-card" />
            <div className="home-skeleton home-skeleton-card" />
          </div>
        ) : null}
        {error ? <p className="state-text error">{error}</p> : null}

        {!loading && !error ? (
          <>
            <section className="hero-result-card">
              <div className="hero-date">
                <span className="hero-date-badge">Today</span>
                <span className="hero-date-text">{todayText}</span>
              </div>
              <div className="hero-body">
                <p className="hero-notice-label">Notice</p>
                <p className="hero-notice">{notice || 'No notice posted yet.'}</p>
                <div className="hero-status">
                  <span className="hero-status-pill">Result</span>
                  <span className="hero-status-value">Not available</span>
                </div>
              </div>
              <button
                type="button"
                className="share-earn-btn"
                onClick={() => navigate(ROUTE_PATHS.referShare)}
              >
                <span className="share-earn-icon" aria-hidden>
                  🔗
                </span>
                <span className="share-earn-label">शेयर · SHARE &amp; EARN</span>
              </button>
            </section>

            <div className="live-strip" role="status">
              <span className="live-strip-icon" aria-hidden>
                🔥
              </span>
              <span className="live-strip-text">LIVE RESULT · {todayText}</span>
            </div>
          </>
        ) : null}

        {!loading &&
          !error &&
          markets.map((item) => (
            <Card key={item.market_id} className="market-card" elevation={0}>
              <CardContent className="market-card-content">
                <div className="market-card-head">
                  <h3>{formatMarketDisplayName(item.market_name)}</h3>
                </div>
                <div className="market-card-body">
                  <p className="result-time">
                    Result at{' '}
                    <strong>{item.resultTime || '--'}</strong>
                  </p>
                  <div className="result-grid">
                    <div className="result-cell">
                      <span className="result-cell-label">Previous</span>
                      <span className="result-cell-value">{item.market_result_previous_day || '—'}</span>
                    </div>
                    <div className="result-cell result-cell--today">
                      <span className="result-cell-label">Today</span>
                      <span className="result-cell-value">{item.market_result || '—'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </main>

      <nav className="bottom-nav">
        <button type="button" className="nav-item active">
          <AppIcon name="home" className="nav-icon" />
          <span>Home</span>
        </button>
        <button type="button" className="nav-item" onClick={() => navigate(ROUTE_PATHS.play)}>
          <AppIcon name="sports_esports" className="nav-icon" />
          <span>Play</span>
        </button>
        <button type="button" className="nav-item" onClick={() => navigate(ROUTE_PATHS.wallet)}>
          <AppIcon name="account_balance_wallet" className="nav-icon" />
          <span>Wallet</span>
        </button>
        <button type="button" className="nav-item" onClick={() => navigate(ROUTE_PATHS.myGame)}>
          <AppIcon name="stadia_controller" className="nav-icon" />
          <span>My Game</span>
        </button>
      </nav>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigate={navigate}
        name={profile?.name || session.name || 'User'}
        mobile={profile?.mob || session.mobileNum || '--'}
        refCode={profile?.refCode || '--'}
        helpNumber={helpNumber}
      />
    </div>
  )
}

export default HomePage
