// background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "summarize_transcript") {
    fetch(
      `https://devrayat000-youtube-summarizer.hf.space/youtube/${message.videoId}`
    )
      .then((response) => {
        if (response.ok) {
          const data = response.body;
          if (!data) {
            throw new Error("no data");
          }
          return data.getReader();
        } else {
          throw response.text();
        }
      })
      .then((reader) => {
        const decoder = new TextDecoder();

        function sendChunk(): Promise<void> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              return;
            }
            const chunkValue = decoder.decode(value);
            console.log(chunkValue);

            chrome.runtime.sendMessage({ response: chunkValue });
            return sendChunk();
          });
        }

        sendChunk();
      })
      .catch((error) => {
        if (error instanceof Error) {
          chrome.runtime.sendMessage({ error: error.message });
        } else if (
          typeof error === "string" &&
          /Could not retrieve a transcript/.test(error)
        ) {
          chrome.runtime.sendMessage({
            error: "Couldn't retrieve a transcript for the video.",
          });
        } else
          chrome.runtime.sendMessage({
            error: "Looks like OpenAI timed out :(",
          });
      });
  }

  return true;
});
