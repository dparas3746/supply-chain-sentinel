import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { DashboardView } from './views/DashboardView';
import { AssetInventoryView } from './views/AssetInventoryView';
import { SBOMAnalyzerView } from './views/SBOMAnalyzerView';
import { VulnerabilityView } from './views/VulnerabilityView';
import { DependencyGraphView } from './views/DependencyGraphView';
import { AttackPropagationView } from './views/AttackPropagationView';
import { RiskIntelligenceView } from './views/RiskIntelligenceView';
import { AIAssistantView } from './views/AIAssistantView';
import { RemediationView } from './views/RemediationView';
import { SupplierRiskView } from './views/SupplierRiskView';
import { AlertsView } from './views/AlertsView';
import { ReportsView } from './views/ReportsView';
import { User } from './types';
import { alertsApi } from './api/client';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [navTarget, setNavTarget] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [alertCount, setAlertCount] = useState<number>(3);
  
  // Default demo enterprise user session
  const [currentUser] = useState<User>({
    id: 'user-001-lead-architect',
    email: 'sarah.mitchell@sentinel-defense.internal',
    full_name: 'Dr. Sarah Mitchell',
    role: 'secops_lead',
    org_id: 'org-enterprise-sentinel',
  });

  const fetchAlertCount = async () => {
    try {
      const data = await alertsApi.getAlerts();
      if (Array.isArray(data)) {
        const unack = data.filter((a: any) => !a.is_acknowledged).length;
        setAlertCount(unack);
      }
    } catch {
      setAlertCount(3);
    }
  };

  useEffect(() => {
    fetchAlertCount();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAlertCount();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleNavigate = (view: string, targetId?: string) => {
    setNavTarget(targetId);
    setCurrentView(view);
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={handleNavigate} />;
      case 'assets':
        return <AssetInventoryView onNavigate={handleNavigate} />;
      case 'sbom':
        return <SBOMAnalyzerView initialAppId={navTarget} onNavigate={handleNavigate} />;
      case 'vulnerabilities':
        return <VulnerabilityView onNavigate={handleNavigate} />;
      case 'graph':
        return <DependencyGraphView initialAppId={navTarget} onNavigate={handleNavigate} />;
      case 'propagation':
        return <AttackPropagationView initialTarget={navTarget} onNavigate={handleNavigate} />;
      case 'risk':
        return <RiskIntelligenceView />;
      case 'ai-analyst':
        return <AIAssistantView />;
      case 'remediation':
        return <RemediationView />;
      case 'suppliers':
        return <SupplierRiskView />;
      case 'alerts':
        return <AlertsView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onSelectView={(view) => {
        setNavTarget(undefined);
        setCurrentView(view);
      }}
      user={currentUser}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      alertCount={alertCount}
    >
      {renderActiveView()}
    </Layout>
  );
};

export default App;
