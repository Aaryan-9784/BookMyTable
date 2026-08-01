import { Outlet } from 'react-router-dom';
import RestaurantSidebar from './components/RestaurantSidebar.jsx';
import RestaurantNavbar from './components/RestaurantNavbar.jsx';
import { CompactErrorBoundary } from '../components/ErrorBoundary.jsx';

export default function RestaurantLayout() {
  return (
    <div className="flex min-h-screen" style={{ background: '#0b0b0c' }}>
      <RestaurantSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <RestaurantNavbar />
        <main className="flex-1 overflow-auto px-6 py-8 md:px-10 md:py-10 anim-fade-in">
          <CompactErrorBoundary fallbackMessage="Error loading restaurant dashboard content">
            <Outlet />
          </CompactErrorBoundary>
        </main>
      </div>
    </div>
  );
}
