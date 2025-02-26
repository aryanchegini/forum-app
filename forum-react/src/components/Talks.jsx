import PropTypes from 'prop-types';
import Talk from './Talk';

export default function Talks({ user, talks, handleAction }) {
  return (
    <div className="talks-container">
      {talks.length > 0 ? (
        talks.map((talk) => (
          <Talk
            key={talk._id || talk.title}
            user={user}
            talk={talk}
            handleAction={handleAction}
          />
        ))
      ) : (
        <div className="no-talks">
          <p>No talks available. Be the first to add one!</p>
        </div>
      )}
    </div>
  );
}

Talks.propTypes = {
  user: PropTypes.string.isRequired,
  talks: PropTypes.array.isRequired,
  handleAction: PropTypes.func.isRequired
};
