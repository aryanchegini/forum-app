import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import TalkForm from "./components/TalkForm";
import Talks from "./components/Talks";

async function fetchOK(url, options) {
  const response = await fetch(url, options);
  if (response.status < 400) return response;
  else throw new Error(response.statusText);
}

async function pollTalks(url, tag, update, signal) {
  let success = false;
  let response;
  while (!success && !signal.aborted) {
    try {
      response = await fetchOK(url, {
        headers: tag ? { "If-None-Match": tag, Prefer: "wait=90" } : {},
      });
    } catch (e) {
      if (signal.aborted) return;
      console.log("Request failed: " + e);
      await new Promise((resolve) => setTimeout(resolve, 500));
      continue;
    }
    if (response.status === 304) continue; // resource not modified
    success = true;
  }

  if (!signal.aborted) {
    let newTag = response.headers.get("ETag");
    let newTalks = await response.json();
    update(newTalks, newTag);
  }
}

function talkURL(title) {
  return "http://localhost:8000/talks/" + encodeURIComponent(title);
}

function handleAction(type, user, action) {
  if (type == "newTalk") {
    fetchOK(talkURL(action.title), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        presenter: user,
        summary: action.summary,
      }),
    }).catch(reportError);
  } else if (type == "deleteTalk") {
    fetchOK(talkURL(action.title), { method: "DELETE" }).catch(reportError);
  } else if (type == "newComment") {
    fetchOK(talkURL(action.title) + "/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: user,
        message: action.message,
      }),
    }).catch(reportError);
  }
}

function App() {
  const [user, setUser] = useState("Anonymous");
  const [talks, setTalks] = useState([]);
  const [tag, setTag] = useState(undefined);

  useEffect(() => {
    const abortController = new AbortController();

    pollTalks(
      "http://localhost:8000/talks",
      tag,
      (newTalks, newTag) => {
        setTalks(newTalks);
        setTag(newTag);
      },
      abortController.signal
    ).catch(console.error);

    return () => abortController.abort();
  }, [tag]);

  return (
    <div className="forum-app">
      <main className="app-content">
        <TalkForm user={user} setUser={setUser} handleAction={handleAction} />
        <Talks user={user} talks={talks} handleAction={handleAction} />
      </main>
      <footer className="app-footer">
        <p>© chegini</p>
      </footer>
    </div>
  );
}

export default App;