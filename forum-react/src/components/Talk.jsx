import { useState } from "react";
import PropTypes from 'prop-types';
import Comment from "./Comment";

export default function Talk({ user, talk, handleAction }) {
  const [newComment, setNewComment] = useState("");

  return (
    <div className="talk-card">
      <div className="talk-header">
        <h2 className="talk-title">{talk.title}</h2>
        <span className="presenter-badge">by {talk.presenter}</span>
        <button
          className="delete-button"
          onClick={() => {
            handleAction("deleteTalk", user, { title: talk.title });
          }}
        >
          ✕
        </button>
      </div>
      <div className="talk-content">
        <p className="talk-summary">{talk.summary}</p>
        
        <div className="comments-section">
          <h5 className="section-title">Comments</h5>
          <div className="comments-list">
            {talk.comments && talk.comments.length > 0 ? (
              talk.comments.map((c, index) => (
                <Comment key={c._id || index} comment={c} />
              ))
            ) : (
              <p className="no-comments">No comments yet</p>
            )}
          </div>
          
          <form
            className="comment-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (newComment.trim() !== "") {
                handleAction("newComment", user, {
                  title: talk.title,
                  message: newComment,
                });
                setNewComment("");
              }
            }}
          >
            <input
              type="text"
              className="comment-input"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="comment-button">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

Talk.propTypes = {
    user: PropTypes.string.isRequired,
    talk: PropTypes.object.isRequired,
    handleAction: PropTypes.func.isRequired
  };
  