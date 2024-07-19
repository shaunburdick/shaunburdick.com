import { useState } from "react";

function CookieNotice() {

  const SHOW_COOKIE_MESSAGE_KEY = 'showCookieMessage';
  const cm = (localStorage.getItem(SHOW_COOKIE_MESSAGE_KEY) || 'true') === 'true';
  const [showCookieMessage, setShowCookieMessage] = useState<boolean>(cm);

  const cookieAcknowledge = (ack: boolean) => {
    if (ack) {
      setShowCookieMessage(false);
      localStorage.setItem(SHOW_COOKIE_MESSAGE_KEY, 'false');
    } else {
      window.location.href = "https://www.oreo.com/";
    }
  }

  return (
    <>
      {showCookieMessage &&
        <div style={{position: "fixed", bottom: 0, maxWidth: "750px"}}>
          <pre>
            This site uses cookies to feed its developer in an effort to get them to write code.
            So far it seems to be working.
            <br />
            <br />
            Do you acknowledge that this site uses cookies?
            <div style={{textAlign: 'right'}}>
              <button onClick={() => cookieAcknowledge(true)}>Yes</button>
              &nbsp;
              <button onClick={() => cookieAcknowledge(false)}>No</button>
            </div>
          </pre>
        </div>
      }
    </>
  );
}

export default CookieNotice;