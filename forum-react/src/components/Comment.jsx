import PropTypes from 'prop-types';

export default function Comment({ comment }) {
  return (
    <div className="comment-bubble">
      <p className="comment-text">{comment.message}</p>
      <div className="comment-author">
        <strong>{comment.author}</strong>
      </div>
    </div>
  );
}

Comment.propTypes = {
  comment: PropTypes.shape({
    message: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired
  }).isRequired
};
