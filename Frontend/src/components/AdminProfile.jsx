import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";

function AdminProfile() {
  const { logout, currentUser } = useAuth((s) => s);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, authorsRes] = await Promise.all([
        axios.get(import.meta.env.VITE_API_URL + "/admin-api/stats", { withCredentials: true }),
        axios.get(import.meta.env.VITE_API_URL + "/admin-api/authors", { withCredentials: true }),
      ]);
      setStats(statsRes.data.payload);
      setAuthors(authorsRes.data.payload);
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthorStatus = async (author) => {
    const newStatus = !author.isUserActive;
    const msg = newStatus
      ? `Activate ${author.firstName}?`
      : `Deactivate ${author.firstName}? They won't be able to login.`;
    if (!window.confirm(msg)) return;

    try {
      await axios.patch(
        import.meta.env.VITE_API_URL + "/admin-api/author/status",
        { authorId: author._id, isUserActive: newStatus },
        { withCredentials: true },
      );
      toast.success(`Author ${newStatus ? "activated" : "deactivated"} successfully`);
      // update local state
      setAuthors((prev) =>
        prev.map((a) => (a._id === author._id ? { ...a, isUserActive: newStatus } : a)),
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const tabStyle = (tab) => ({
    padding: "8px 20px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.15s",
    background: activeTab === tab ? "#0066cc" : "#f5f5f7",
    color: activeTab === tab ? "#fff" : "#6e6e73",
  });

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        maxWidth: 1000,
        margin: "0 auto",
        padding: "2.5rem 1.5rem",
      }}
    >
      {/* ── PROFILE HEADER ── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e8ed",
          borderRadius: 20,
          padding: "1.5rem 2rem",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#0066cc,#3b82f6)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {currentUser?.firstName?.charAt(0).toUpperCase() || "A"}
          </div>
          <div>
            <p style={{ color: "#6e6e73", fontSize: 13, margin: 0 }}>Admin Dashboard</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>
              {currentUser?.firstName} {currentUser?.lastName}
            </h2>
            <p style={{ fontSize: 12, color: "#a1a1a6", margin: 0 }}>{currentUser?.email}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            background: "#ff3b30",
            color: "#fff",
            border: "none",
            padding: "10px 22px",
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <button style={tabStyle("dashboard")} onClick={() => setActiveTab("dashboard")}>
          📊 Dashboard
        </button>
        <button style={tabStyle("authors")} onClick={() => setActiveTab("authors")}>
          ✍️ Authors ({authors.length})
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#a1a1a6", padding: "4rem 0" }}>Loading…</p>
      ) : activeTab === "dashboard" ? (
        <>
          {/* ── STATS GRID ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {[
              { label: "Total Users", value: stats?.totalUsers ?? 0, icon: "👤", color: "#3b82f6" },
              { label: "Total Authors", value: stats?.totalAuthors ?? 0, icon: "✍️", color: "#8b5cf6" },
              { label: "Total Articles", value: stats?.totalArticles ?? 0, icon: "📝", color: "#f59e0b" },
              { label: "Active Articles", value: stats?.activeArticles ?? 0, icon: "✅", color: "#10b981" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#fff",
                  border: "1px solid #e8e8ed",
                  borderRadius: 16,
                  padding: "22px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 28 }}>{s.icon}</span>
                <span
                  style={{ fontSize: "2rem", fontWeight: 700, color: s.color, lineHeight: 1 }}
                >
                  {s.value}
                </span>
                <span style={{ fontSize: 13, color: "#6e6e73" }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#f5f5f7",
              borderRadius: 16,
              padding: "20px 24px",
              color: "#6e6e73",
              fontSize: 14,
            }}
          >
            💡 Switch to the <strong>Authors</strong> tab to manage author accounts.
          </div>
        </>
      ) : (
        /* ── AUTHORS TABLE ── */
        <div>
          {authors.length === 0 ? (
            <p style={{ textAlign: "center", color: "#a1a1a6", padding: "4rem 0" }}>
              No authors registered yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {authors.map((author) => (
                <div
                  key={author._id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e8e8ed",
                    borderRadius: 16,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  {/* Left */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {author.profileImageUrl ? (
                      <img
                        src={author.profileImageUrl}
                        alt="avatar"
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #e8e8ed",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: "#0066cc20",
                          color: "#0066cc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 18,
                        }}
                      >
                        {author.firstName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p style={{ fontWeight: 600, color: "#1d1d1f", margin: 0, fontSize: 15 }}>
                        {author.firstName} {author.lastName}
                      </p>
                      <p style={{ color: "#6e6e73", fontSize: 13, margin: 0 }}>{author.email}</p>
                      <p style={{ color: "#a1a1a6", fontSize: 12, margin: 0 }}>
                        Joined {formatDate(author.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: author.isUserActive ? "#10b98120" : "#ff3b3020",
                        color: author.isUserActive ? "#10b981" : "#ff3b30",
                      }}
                    >
                      {author.isUserActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => toggleAuthorStatus(author)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 999,
                        border: "1px solid",
                        borderColor: author.isUserActive ? "#ff3b30" : "#10b981",
                        background: "transparent",
                        color: author.isUserActive ? "#ff3b30" : "#10b981",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {author.isUserActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminProfile;