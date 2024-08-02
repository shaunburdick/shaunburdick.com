import { useContext, useState } from "react";
import { TrackerContext } from "./Tracker";

function CookieNotice() {

  const tracker = useContext(TrackerContext);

  const LS_COOKIE_ACKNOWLEDGE = 'cookieAcknowledge';
  const initialShowCookie = (localStorage.getItem(LS_COOKIE_ACKNOWLEDGE) || 'true') === 'true';
  const [showCookieMessage, setShowCookieMessage] = useState<boolean>(initialShowCookie);

  const cookieAcknowledge = (ack: boolean) => {
    tracker.trackEvent('cookieAcknowledge', { props: { ack } });

    if (ack) {
      setShowCookieMessage(false);
      localStorage.setItem(LS_COOKIE_ACKNOWLEDGE, 'false');
    } else {
      window.location.href = "https://www.oreo.com/";
    }
  }

  return (
    <>
      {showCookieMessage &&
        <div style={{position: "fixed", bottom: 0, maxWidth: "750px"}}>
          <pre aria-label="Cookie Notice">
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