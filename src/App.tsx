import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

import Home from './pages/home/Home';
import About from './pages/about/About';
import Experience from './pages/experience/Experience';
import Projects from './pages/projects/Projects';
import Research from './pages/research/Research';
import Skills from './pages/skills/Skills';
import Awards from './pages/awards/Awards';
import Contact from './pages/contact/Contact';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/about"
                        element={<About />}
                    />

                    <Route
                        path="/experience"
                        element={<Experience />}
                    />

                    <Route
                        path="/projects"
                        element={<Projects />}
                    />

                    <Route
                        path="/research"
                        element={<Research />}
                    />

                    <Route
                        path="/skills"
                        element={<Skills />}
                    />

                    <Route
                        path="/awards"
                        element={<Awards />}
                    />

                    <Route
                        path="/contact"
                        element={<Contact />}
                    />

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;