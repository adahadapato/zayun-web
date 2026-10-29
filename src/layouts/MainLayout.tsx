import { Outlet, ScrollRestoration } from 'react-router';

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function MainLayout() {
    return (
        <div className="site-wrapper">
            <Navbar />

            <main>
                <Outlet />
            </main>

            <Footer />

            {/* Each new page opens at the top; Back returns to where you were. */}
            <ScrollRestoration />
        </div>
    );
}

export default MainLayout;