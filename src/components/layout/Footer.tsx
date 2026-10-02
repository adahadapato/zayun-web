import { Link } from 'react-router-dom';

function Footer() {
    const currentYear =
        new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-content">
                <div>
                    <Link
                        to="/"
                        className="footer-brand"
                    >
                        ZAYUN
                        <span>.</span>
                    </Link>

                    <p>
                        Technology, research and ideas
                        built with purpose.
                    </p>
                </div>

                <div className="footer-right">
                    <p>
                        © {currentYear} Enobong Adahada
                    </p>

                    <p>
                        All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;