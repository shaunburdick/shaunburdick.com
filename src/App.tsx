import './App.css';

import { Person } from "schema-dts";
import { helmetJsonLdProp } from "react-schemaorg";
import Helmet from "react-helmet";

import ShellPrompt from './ShellPrompt'
import CookieNotice from './CookieNotice';

function App() {
  return (
    <>
      <Helmet
        script={[
          helmetJsonLdProp<Person>({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Shaun Burdick",
            alumniOf: {
              "@type": "CollegeOrUniversity",
              name: ["Alfred University"],
            },
            knowsAbout: ["Engineering", "Computer Science", "Leadership"],
            nationality: {
              "@type": "Country",
              name: "United States of America"
            }
          }),
        ]}
      />
      <h1 id='page-desc'>Shaun Burdick's Console</h1>
      <div aria-describedby='page-desc'>
        <ShellPrompt />
        <CookieNotice />
      </div>
    </>
  );
}

export default App;
