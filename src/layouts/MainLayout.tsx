import { Outlet, ScrollRestoration } from 'react-router';

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { PersonSchema } from '../components/layout/PersonSchema';
import { PageMetaTags } from '../components/layout/PageMetaTags';

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

            {/* Who the site is about, for search engines (with every published profile) */}
            <PersonSchema />

            {/* This page's title, description and link-preview tags (words in src/seo/siteMeta.ts) */}
            <PageMetaTags />
        </div>
    );
}

export default MainLayout;