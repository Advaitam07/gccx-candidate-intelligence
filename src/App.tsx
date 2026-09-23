/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CandidateProvider, useCandidates } from './context/CandidateContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CandidatesView } from './views/CandidatesView';
import { OverviewView } from './views/OverviewView';
import { ReviewQueueView } from './views/ReviewQueueView';
import { ShortlistView } from './views/ShortlistView';
import { InsightsView } from './views/InsightsView';
import { SavedViewsView } from './views/SavedViewsView';
import { SettingsView } from './views/SettingsView';
import { HelpView } from './views/HelpView';
import { CompareModal } from './components/CompareModal';
import { AddCandidateModal } from './components/AddCandidateModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('candidates');
  const { toastMessage } = useCandidates();

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView onNavigate={setCurrentView} />;
      case 'candidates':
        return <CandidatesView />;
      case 'review-queue':
        return <ReviewQueueView onNavigate={setCurrentView} />;
      case 'shortlist':
        return <ShortlistView onNavigate={setCurrentView} />;
      case 'insights':
        return <InsightsView />;
      case 'saved-views':
        return <SavedViewsView onNavigate={setCurrentView} />;
      case 'settings':
        return <SettingsView />;
      case 'help-and-docs':
        return <HelpView />;
      default:
        return <CandidatesView />;
    }
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Left Navigation Drawer */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Container offset by sidebar */}
      <div className="pl-72">
        {/* Fixed Top Header */}
        <Header />

        {/* Scrollable View Canvas */}
        <main className="relative pt-16 w-full min-h-screen bg-surface px-space-lg py-space-lg">
          {renderView()}
        </main>
      </div>

      {/* Floating Notification Toast Element */}
      <div
        className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg bg-primary text-on-primary shadow-xl flex items-center gap-2 transform transition-all duration-300 z-50 pointer-events-none ${
          toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <span className="material-symbols-outlined text-[18px] text-secondary-fixed">
          check_circle
        </span>
        <span className="font-body-sm text-body-sm font-medium">
          {toastMessage || ''}
        </span>
      </div>

      {/* Global Interactive Overlays & Modals */}
      <CompareModal />
      <AddCandidateModal />
      <CommandPaletteModal onNavigate={setCurrentView} />
    </div>
  );
};

export default function App() {
  return (
    <CandidateProvider>
      <AppContent />
    </CandidateProvider>
  );
}
