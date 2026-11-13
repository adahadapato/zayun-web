import { Link } from 'react-router'

/**
 * Any address that isn't a page (a mistyped or old link). Before, these quietly showed the home page, which Google
 * counts as a "soft 404" (the same page at many addresses). Now the visitor is told, and PageMetaTags marks
 * the page "noindex" so search engines leave it out.
 */
function NotFound() {
  return (
    <section className="placeholder-page">
      <div className="container">
        <span className="section-kicker">Page not found</span>
        <h1>Nothing here.</h1>
        <p>The link may be mistyped, or the page has moved.</p>
        <div className="hero-actions">
          <Link to="/" className="button button-primary">Go to the home page</Link>
          <Link to="/projects" className="button button-secondary">See projects</Link>
        </div>
      </div>
    </section>
  )
}

export default NotFound
