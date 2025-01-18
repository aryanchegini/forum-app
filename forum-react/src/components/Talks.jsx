import { useState } from "react";
import Comment from "./Comment";

function Talk({ user, talk, handleAction }) {
  const [newComment, setNewComment] = useState("");

  return (
    <div className="card my-3">
      <div className="card-body">
        <h2 className="card-title">
          {talk.title}{" "}
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => {
              handleAction("deleteTalk", user, { title: talk.title });
            }}
          >
            Delete
          </button>
        </h2>
        <h6 className="card-subtitle mb-2 text-muted">
          <em>
            by <strong>{talk.presenter}</strong>
          </em>
        </h6>
        <p className="card-text">{talk.summary}</p>
        <h5>Comments</h5>
        <ul className="list-group list-group-flush">
          {talk.comments.map((c) => (
            <li className="list-group-item" key={c._id}>
              <Comment comment={c} />
            </li>
          ))}
        </ul>
        <form
          className="mt-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleAction("newComment", user, {
              title: talk.title,
              message: newComment,
            });
            setNewComment("");
          }}
        >
          <div className="form-group">
            <input
              type="text"
              name="comment"
              className="form-control"
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
              }}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Add comment
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Talks({ user, talks, handleAction }) {
  return (
    <div>
      {talks.map((talk) => (
        <Talk
          key={talk._id}
          user={user}
          talk={talk}
          handleAction={handleAction}
        />
      ))}
    </div>
  );
}
