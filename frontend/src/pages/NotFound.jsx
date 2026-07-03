import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container">
      <div className="empty" style={{ marginTop: 60 }}>
        <h3>Page not found</h3>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Go home</Link>
      </div>
    </div>
  );
}
