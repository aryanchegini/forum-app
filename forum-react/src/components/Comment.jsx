export default function Comment({ comment }) {
  return (
    <div className="alert alert-light">
      <p className="mb-1">{comment.message}</p>
      <em>
        <div className="text-muted">
          by <strong>{comment.author}</strong>
        </div>
      </em>
    </div>
  );
}
