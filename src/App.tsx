import { useEffect } from 'react';
import { AdminProvider } from '@/context/AdminContext';
import { ResourcesProvider } from '@/context/ResourcesContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SiteConfigProvider, useSiteConfig } from '@/context/SiteConfigContext';
import { MotivationalTicker } from '@/components/MotivationalTicker';
import { ExamCountdown } from '@/components/ExamCountdown';
import { OfferBanner } from '@/components/OfferBanner';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { AITools } from '@/components/AITools';
import { StudyTools } from '@/components/StudyTools';
import { PastPapers } from '@/components/PastPapers';
import { QuizModule } from '@/components/QuizModule';
import { VideoLectures } from '@/components/VideoLectures';
import { AffiliateProducts } from '@/components/AffiliateProducts';
import { Marketplace } from '@/components/Marketplace';
import { PaperMarkingHub } from '@/components/PaperMarkingHub';
import { PricingSection } from '@/components/PricingSection';
import { CommunityForum } from '@/components/CommunityForum';
import { Footer } from '@/components/Footer';
import { OwnerDashboard } from '@/components/OwnerDashboard';
import { AdBanner } from '@/components/AdBanner';
import { supabase } from '@/lib/supabase';

function UnlockHandler() {
  const { unlockByCode, unlockAll } = useSiteConfig();

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/#unlock=([\w-]+)/);
    if (match) {
      const code = match[1];
      supabase
        .from('unlock_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle()
        .then(({ data }) => {
          if (data && !data.used) {
            if (data.features.includes('all')) {
              unlockAll();
            } else {
              unlockByCode(data.features);
            }
            supabase.from('unlock_codes').update({ used: true }).eq('id', data.id);
          }
        });
      // Clean the URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [unlockByCode, unlockAll]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <SiteConfigProvider>
        <AdminProvider>
          <ResourcesProvider>
            <UnlockHandler />
            <div className="min-h-screen bg-ink-900 dark:bg-ink-900 light:bg-gray-100 text-gray-100 dark:text-gray-100 light:text-gray-900 transition-colors duration-300">
              <OfferBanner />
              <MotivationalTicker />
              <ExamCountdown />
              <Header />
              <main>
                <Hero />
                <PastPapers />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <AdBanner slot="content-header" className="h-24" />
                </div>
                <StudyTools />
                <QuizModule />
                <AITools />
                <VideoLectures />
                <AffiliateProducts />
                <Marketplace />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <AdBanner slot="content-mid" className="h-24" />
                </div>
                <PaperMarkingHub />
                <PricingSection />
                <CommunityForum />
              </main>
              <Footer />
              <OwnerDashboard />
            </div>
          </ResourcesProvider>
        </AdminProvider>
      </SiteConfigProvider>
    </ThemeProvider>
  );
}

export default App;
