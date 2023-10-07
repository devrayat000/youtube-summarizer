import { Suspense, useCallback, useEffect, useState } from "react";
import sumTubeLogo from "./assets/logo.png";
import useSWR from "swr";
import "./App.css";

function App() {
  return (
    <div>
      <div>
        <a
          href="https://github.com/devrayat000/youtube-summarizer"
          target="_blank"
        >
          <img
            src={chrome.runtime.getURL(sumTubeLogo)}
            className="logo"
            alt="SumTube Logo"
          />
        </a>
      </div>
      <h1>SumTube</h1>
      <div>
        <Suspense fallback="Loading...">
          <ShowURL />
        </Suspense>
      </div>
    </div>
  );
}

export default App;

function ShowURL() {
  const { data: tabs } = useSWR(
    ["url"],
    () =>
      chrome.tabs?.query({
        active: true,
        lastFocusedWindow: true,
        // currentWindow: true,
        url: "*://*.youtube.com/watch*",
      }),
    { suspense: true }
  );
  const url = tabs?.[0]?.url;
  // console.log({ url, tabs });

  if (!url) {
    return (
      <div className="card">
        <p>You are not in youtube to use the summarizer.</p>
      </div>
    );
  }

  return <SummarizeTranscript url={url} />;
}

function SummarizeTranscript({ url }: { url: string }) {
  const [error, setError] = useState<string>();
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log({ loading, error, response });
  }, [loading, error, response]);

  const getBackChunk = useCallback(
    ({ response, error }: { response: string; error: string }) => {
      console.log({ response, error });
      if (response) {
        console.log(response);
        setResponse((prev) => prev + response);
      } else {
        setError(error);
      }
      setLoading(false);
    },
    []
  );

  const fetchSummary = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const youtubeVideoUrl = new URL(url);
    if (youtubeVideoUrl.origin !== "https://www.youtube.com") {
      setLoading(false);
      return;
    }
    const videoId = youtubeVideoUrl.searchParams.get("v");

    chrome.runtime.sendMessage({ videoId, type: "summarize_transcript" });
  }, [url, loading]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(getBackChunk);
    return () => chrome.runtime.onMessage.removeListener(getBackChunk);
  }, [getBackChunk]);

  if (loading && !response) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="card">
      <div>
        <button type="button" onClick={fetchSummary} disabled={loading}>
          Summarize Video
        </button>
      </div>
      <div>
        <p>{response.replace(/<\/?s>/g, "")}</p>
      </div>
    </div>
  );
}
