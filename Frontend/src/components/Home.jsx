import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router";
import axios from "axios";
import { useAuth } from "../store/authStore";

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth((s) => s);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + "/auth/articles");
        if (res.status === 200) setArticles(res.data.payload);
      } catch (err) {
        console.error("Failed to fetch articles", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const categories = ["all", ...new Set((articles || []).map((a) => a.category))];

  const filtered = articles.filter((a) => {
    const matchCat = selectedCategory === "all" || a.category === selectedCategory;
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const handleReadArticle = (article) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate(`/article/${article._id}`, { state: article });
  };

  const getProfilePath = () => {
    if (!currentUser) return "/login";
    if (currentUser.role === "AUTHOR") return "/author-profile";
    if (currentUser.role === "ADMIN") return "/admin-profile";
    return "/user-profile";
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── HERO ── */}
      <section className="bg-white text-center py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="inline-block bg-blue-50 text-blue-500 font-bold text-[0.65rem] tracking-widest uppercase py-1.5 px-4 rounded-full mb-8">
            Welcome to BlogApp
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1d1d1f] tracking-tight mb-6">
            Share your ideas with the world.
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            A premium platform for authors and readers to connect, share knowledge,
            and build inspired communities through beautiful storytelling.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <NavLink
                  to="/register"
                  className="bg-[#0066cc] hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-colors duration-200"
                >
                  Start Writing Today
                </NavLink>
                <NavLink
                  to="/login"
                  className="bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-8 rounded-full border border-gray-200 transition-colors duration-200"
                >
                  Sign In
                </NavLink>
              </>
            ) : (
              <NavLink
                to={getProfilePath()}
                className="bg-[#0066cc] hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-colors duration-200"
              >
                Go to Dashboard
              </NavLink>
            )}
          </div>
        </div>
      </section>

      {/* ── ARTICLES SECTION ── */}
      <section
        id="articles-section"
        style={{
          background: "#f5f5f7",
          minHeight: "60vh",
          padding: "5rem 2rem",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Section heading */}
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: 700,
                color: "#1d1d1f",
                letterSpacing: "-0.02em",
              }}
            >
              Latest Articles
            </h2>
            <p style={{ color: "#6e6e73", marginTop: 8, fontSize: 15 }}>
              Discover fresh ideas from our community
            </p>
          </div>

          {/* Search + Filter */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 36,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <input
              type="text"
              placeholder="🔍  Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: "1 1 260px",
                maxWidth: 380,
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid #d2d2d7",
                background: "#fff",
                fontSize: 14,
                outline: "none",
                color: "#1d1d1f",
              }}
            />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor: selectedCategory === cat ? "#0066cc" : "#d2d2d7",
                    background: selectedCategory === cat ? "#0066cc" : "#fff",
                    color: selectedCategory === cat ? "#fff" : "#6e6e73",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textTransform: "capitalize",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            <div style={{ textAlign: "center", color: "#a1a1a6", padding: "5rem 0" }}>
              Loading articles…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#a1a1a6", padding: "5rem 0" }}>
              No articles found.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 24,
              }}
            >
              {filtered.map((article) => (
                <div
                  key={article._id}
                  onClick={() => handleReadArticle(article)}
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    padding: "28px 24px",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    border: "1px solid #e8e8ed",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Category tag */}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#0066cc",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {article.category}
                  </span>

                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      color: "#1d1d1f",
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    {article.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 14,
                      color: "#6e6e73",
                      lineHeight: 1.65,
                      margin: 0,
                      flexGrow: 1,
                    }}
                  >
                    {article.content.slice(0, 100)}…
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "auto",
                      paddingTop: 12,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#a1a1a6" }}>
                      {formatDate(article.createdAt)}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#0066cc",
                        fontWeight: 500,
                      }}
                    >
                      Read →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHTS ── */}
      <section style={{ background: "#fff", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1d1d1f",
              marginBottom: 48,
              letterSpacing: "-0.02em",
            }}
          >
            Everything you need
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 28,
            }}
          >
            {[
              { icon: "📖", title: "Read", desc: "Explore articles on tech, AI, programming and more." },
              { icon: "✍️", title: "Write", desc: "Publish your ideas and share them with the world." },
              { icon: "💬", title: "Comment", desc: "Engage with articles, leave your thoughts." },
              { icon: "🔒", title: "Secure", desc: "JWT-protected routes keep your account safe." },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  background: "#f5f5f7",
                  borderRadius: 18,
                  padding: "28px 20px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f", marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: "#6e6e73", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;