import React, { useState } from "react";
import UserField from "./UserField";

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
    <div className="card p-4 mb-4">
      <h3 className="card-title">Submit a Talk</h3>
      <form onSubmit={handleSubmit}>
        <UserField user={user} setUser={setUser} />
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="summary">Summary:</label>
          <textarea
            id="summary"
            className="form-control"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary ">
          Submit
        </button>
      </form>
    </div>
  );
}
