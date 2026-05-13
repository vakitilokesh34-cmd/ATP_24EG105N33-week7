import { useParams, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../store/authStore";
import { toast } from "react-hot-toast";
import {
  articlePageWrapper,
  articleHeader,
  articleCategory,
  articleMainTitle,
  articleAuthorRow,
  authorInfo,
  articleContent,
  articleFooter,
  articleActions,
  editBtn,
  deleteBtn,
  loadingClass,
  errorClass,
  inputClass,
  commentsWrapper,
  commentCard,
  commentHeader,
  commentUserRow,
  avatar,
  commentUser,
  commentTime,
  commentText,
} from "../styles/common.js";
import { useForm } from "react-hook-form";

function ArticleByID() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const user = useAuth((state) => state.currentUser);

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // comment edit state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Always fetch fresh from API to get populated comments
  useEffect(() => {
    const getArticle = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/article/${id}`, {
          withCredentials: true,
        });
        setArticle(res.data.payload);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };
    getArticle();
  }, [id]);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

  // check if current user already commented
  // handles both populated user objects and raw ObjectId strings
  const myComment = article?.comments?.find((c) => {
    const commentUserId =
      c.user?._id?.toString() || // populated object
      c.user?.toString();         // raw ObjectId string
    return commentUserId === user?.id || c.user?.email === user?.email;
  });

  // delete & restore article
  const toggleArticleStatus = async () => {
    const newStatus = !article.isArticleActive;
    if (!window.confirm(newStatus ? "Restore this article?" : "Delete this article?")) return;
    try {
      const res = await axios.patch(
        import.meta.env.VITE_API_URL + "/author-api/articles",
        { articleId: article._id, isArticleActive: newStatus },
        { withCredentials: true }
      );
      setArticle(res.data.payload);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  // edit article navigate
  const editArticle = (articleObj) => navigate("/edit-article", { state: articleObj });

  // post comment (blocked if already commented)
  const addComment = async (commentObj) => {
    if (!commentObj.comment?.trim()) { toast.error("Comment cannot be empty"); return; }
    commentObj.articleId = article._id;
    try {
      const res = await axios.put(import.meta.env.VITE_API_URL + "/user-api/articles", commentObj, {
        withCredentials: true,
      });
      if (res.status === 200) { setArticle(res.data.payload); reset(); toast.success("Comment added!"); }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    }
  };

  // save edited comment
  const saveEditComment = async (commentId) => {
    if (!editingText.trim()) { toast.error("Comment cannot be empty"); return; }
    try {
      const res = await axios.patch(
        import.meta.env.VITE_API_URL + "/user-api/articles/comment/edit",
        { articleId: article._id, commentId, comment: editingText },
        { withCredentials: true }
      );
      setArticle(res.data.payload);
      setEditingCommentId(null);
      toast.success("Comment updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update comment");
    }
  };

  // delete comment
  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete your comment?")) return;
    try {
      const res = await axios.delete(
        import.meta.env.VITE_API_URL + "/user-api/articles/comment/delete",
        { data: { articleId: article._id, commentId }, withCredentials: true }
      );
      setArticle(res.data.payload);
      toast.success("Comment deleted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  if (loading) return <p className={loadingClass}>Loading article...</p>;
  if (error) return <p className={errorClass}>{error}</p>;
  if (!article) return null;

  return (
    <div className={articlePageWrapper}>
      {/* Header */}
      <div className={articleHeader}>
        <span className={articleCategory}>{article.category}</span>
        <h1 className={`${articleMainTitle} uppercase`}>{article.title}</h1>
        <div className={articleAuthorRow}>
          <div className={authorInfo}>✍️ {article.isArticleActive ? "Published" : "Deleted"}</div>
          <div>{formatDate(article.createdAt)}</div>
        </div>
      </div>

      {/* Content */}
      <div className={articleContent}>{article.content}</div>

      {/* AUTHOR actions */}
      {user?.role === "AUTHOR" && (
        <div className={articleActions}>
          <button className={editBtn} onClick={() => editArticle(article)}>Edit</button>
          <button className={deleteBtn} onClick={toggleArticleStatus}>
            {article.isArticleActive ? "Delete" : "Restore"}
          </button>
        </div>
      )}

      {/* USER: add comment — only shown if NOT already commented */}
      {user?.role === "USER" && !myComment && (
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Leave a comment</h3>
          <form onSubmit={handleSubmit(addComment)} className="flex gap-3">
            <input
              type="text"
              {...register("comment")}
              className={inputClass}
              placeholder="Write your comment here..."
            />
            <button
              type="submit"
              className="bg-[#0066cc] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#004499] transition whitespace-nowrap"
            >
              Post
            </button>
          </form>
        </div>
      )}

      {/* Already commented notice */}
      {user?.role === "USER" && myComment && (
        <div className="mt-10 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-600">
          ✅ You've already commented on this article. You can edit or delete your comment below.
        </div>
      )}

      {/* Comments */}
      <div className={commentsWrapper}>
        <h3 className="text-sm font-semibold text-[#1d1d1f] mb-1">
          Comments ({article.comments?.length || 0})
        </h3>

        {article.comments?.length === 0 && (
          <p className="text-[#a1a1a6] text-sm text-center py-6">No comments yet. Be the first!</p>
        )}

        {article.comments?.map((commentObj, index) => {
          const name = commentObj.user?.firstName
            ? `${commentObj.user.firstName} ${commentObj.user.lastName || ""}`.trim()
            : commentObj.user?.email || "User";
          const firstLetter = name.charAt(0).toUpperCase();
          // handles both populated user objects and raw ObjectId strings
          const isMyComment = (() => {
            const commentUserId =
              commentObj.user?._id?.toString() ||
              commentObj.user?.toString();
            return commentUserId === user?.id || commentObj.user?.email === user?.email;
          })();
          const isEditing = editingCommentId === commentObj._id;

          return (
            <div key={commentObj._id || index} className={commentCard}>
              {/* Header row */}
              <div className={commentHeader}>
                <div className={commentUserRow}>
                  <div className={avatar}>{firstLetter}</div>
                  <div>
                    <p className={commentUser}>{name}</p>
                    <p className={commentTime}>{formatDate(commentObj.createdAt || new Date())}</p>
                  </div>
                </div>

                {/* Edit / Delete — only on own comment */}
                {isMyComment && (
                  <div className="flex gap-2 ml-auto">
                    {!isEditing ? (
                      <>
                        <button
                          onClick={() => { setEditingCommentId(commentObj._id); setEditingText(commentObj.comment); }}
                          className="text-xs text-[#0066cc] border border-[#0066cc] px-3 py-1 rounded-full hover:bg-blue-50 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteComment(commentObj._id)}
                          className="text-xs text-red-500 border border-red-400 px-3 py-1 rounded-full hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="text-xs text-gray-400 border border-gray-300 px-3 py-1 rounded-full hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Comment text or inline edit input */}
              {isEditing ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className={inputClass}
                    autoFocus
                  />
                  <button
                    onClick={() => saveEditComment(commentObj._id)}
                    className="bg-[#0066cc] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[#004499] transition whitespace-nowrap"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p className={commentText}>{commentObj.comment}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={articleFooter}>Last updated: {formatDate(article.updatedAt)}</div>
    </div>
  );
}

export default ArticleByID;