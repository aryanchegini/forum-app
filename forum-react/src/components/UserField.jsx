export default function UserField({ user, setUser }) {
  return (
    <div className="form-group">
      <label htmlFor="username">Your name:</label>
      <input
        type="text"
        id="username"
        className="form-control"
        placeholder="Enter your name"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
    </div>
  );
}
