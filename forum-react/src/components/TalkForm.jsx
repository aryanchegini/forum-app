import { useState } from "react";
import PropTypes from 'prop-types';

export default function TalkForm({ user, setUser, handleAction }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    handleAction("newTalk", user, { title, summary });
    setTitle("");
    setSummary("");
  };

  return (
    <div className="paper-card">
      <div className="card-header">
        <h3>Submit a Talk</h3>
      </div>
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="username" className="label-text">Your name:</label>
          <input
            type="text"
            id="username"
            className="input-field"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="title" className="label-text">Title:</label>
          <input
            type="text"
            id="title"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="summary" className="label-text">Summary:</label>
          <textarea
            id="summary"
            className="textarea-field"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">
          Submit Talk
        </button>
      </form>
    </div>
  );
}

TalkForm.propTypes = {
  user: PropTypes.string.isRequired,
  setUser: PropTypes.func.isRequired,
  handleAction: PropTypes.func.isRequired
};