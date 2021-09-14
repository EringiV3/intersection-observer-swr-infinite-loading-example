import React, { useEffect, useRef, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const PAGE_SIZE = 10;

const App: React.FC = () => {
  const { data, setSize, isValidating } = useSWRInfinite(
    (index) =>
      `https://api.github.com/search/repositories?q=react&per_page=${PAGE_SIZE}&page=${
        index + 1
      }`,
    fetcher
  );

  const repos: any[] = data ? data.map((v) => v.items).flat() : [];

  const [lastElement, setLastElement] = useState<HTMLDivElement | null>(null);

  const rootElement = useRef<HTMLDivElement | null>(null);

  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          setSize((size) => size + 1);
        }
      },
      { root: rootElement.current, rootMargin: '0px', threshold: 0 }
    )
  );

  useEffect(() => {
    const currentElement = lastElement;
    const currentOvserver = observer.current;
    if (currentElement) {
      currentOvserver.observe(currentElement);
    }

    return () => {
      currentOvserver.disconnect();
    };
  }, [lastElement]);

  return (
    <>
      <div ref={rootElement}>
        {repos?.map((repo, i) => (
          <div
            key={repo.id}
            ref={
              i === repos.length - 1
                ? (ref) => {
                    setLastElement(ref);
                  }
                : undefined
            }
            style={{ height: '20vh' }}
          >
            - {repo.name} {`(${repo.html_url})`}
          </div>
        ))}
      </div>
      {isValidating && <div>loading...</div>}
    </>
  );
};

export default App;
