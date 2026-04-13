import { useState, useEffect, useCallback } from 'react';
import { StoreProvider } from './store';
import TabBar from './components/TabBar';
import Home from './pages/Home';
import PlanList from './pages/PlanList';
import Checklist from './pages/Checklist';
import Recorder from './pages/Recorder';
import Report from './pages/Report';
import Collection from './pages/Collection';
import History from './pages/History';
import './App.css';

const TAB_PAGES = ['home', 'plans', 'collection', 'history'];

function AppInner() {
  const [pageStack, setPageStack] = useState([{ name: 'home', params: {} }]);
  const current = pageStack[pageStack.length - 1];

  const navigate = useCallback((name, params = {}) => {
    if (TAB_PAGES.includes(name)) {
      setPageStack([{ name, params }]);
    } else {
      setPageStack(prev => [...prev, { name, params }]);
    }
  }, []);

  const goBack = useCallback(() => {
    setPageStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  }, []);

  const showTabBar = TAB_PAGES.includes(current.name);

  const renderPage = () => {
    switch (current.name) {
      case 'home':
        return <Home navigate={navigate} />;
      case 'plans':
        return <PlanList navigate={navigate} />;
      case 'checklist':
        return <Checklist planId={current.params.planId} navigate={navigate} goBack={goBack} />;
      case 'recorder':
        return <Recorder planId={current.params.planId} navigate={navigate} />;
      case 'report':
        return (
          <Report
            planId={current.params.planId}
            spiritName={current.params.spiritName}
            isPool={current.params.isPool}
            navigate={navigate}
          />
        );
      case 'collection':
        return <Collection />;
      case 'history':
        return <History />;
      default:
        return <Home navigate={navigate} />;
    }
  };

  return (
    <div className="app-content">
      <div className="page-container">
        {renderPage()}
      </div>
      {showTabBar && (
        <TabBar current={current.name} onChange={(tab) => navigate(tab)} />
      )}
    </div>
  );
}

const bgUrl = `url(${import.meta.env.BASE_URL}bg.png)`;

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 500);

  useEffect(() => {
    document.body.style.backgroundImage = bgUrl;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
    return () => { document.body.style.backgroundImage = ''; };
  }, []);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 500);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const inner = (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );

  if (isMobile) {
    return (
      <div className="mobile-wrapper" style={{ backgroundImage: bgUrl }}>
        {inner}
      </div>
    );
  }

  return (
    <div className="mockup-wrapper" style={{ backgroundImage: bgUrl }}>
      <div className="mockup-phone">
        <div className="mockup-screen">{inner}</div>
      </div>
    </div>
  );
}
