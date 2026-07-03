export default function Footer() {
  const categories = ["Grocery", "Clothes", "Electronics", "Footwear", "Home", "Beauty", "Books", "Sports"];

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">⚡ ShopEase</div>
          <div style={{ color: "var(--color-muted)", fontSize: 12 }}>
            © {new Date().getFullYear()} ShopEase · Premium full-stack e-commerce
          </div>
        </div>
        <div className="footer-cats">
          {categories.map((cat) => (
            <span key={cat}>{cat}</span>
          ))}
        </div>
        <div style={{ color: "var(--color-muted)", fontSize: 12, textAlign: "right" }}>
          <div>Built with React + Express + MongoDB</div>
          <div style={{ marginTop: 4, color: "var(--color-primary-light)", fontWeight: 600 }}>
            AI-Powered Commerce 🚀
          </div>
        </div>
      </div>
    </footer>
  );
}
