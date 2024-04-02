import React, { useEffect, useRef, useState } from "react";
import "./index.css";

const AutoCompleteSearch = () => {
  const observer = useRef();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [status, setStatus] = useState({
    isLoading: false,
    isError: false,
    error: null,
  });

  const handleChange = (e) => {
    let timer;
    if (timer) {
      clearImmediate(timer);
    }

    timer = setTimeout(() => {
      setQuery(e.target.value);
    }, 1000);
  };

  const lastElement = (node) => {
    if (status?.isLoading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && data?.length > 0) setPage((pre) => pre + 1);
    });

    if (node) observer.current.observe(node);
  };

  useEffect(() => {
    const getApiResponse = async () => {
      setStatus({ isLoading: true });
      try {
        const res = await fetch(
          `http://openlibrary.org/search.json?title=${query}&page=${page}`
        );

        const data = await res?.json();

        setStatus({ isLoading: false });

        setData((prevBooks) => {
          return [
            ...new Set([
              ...prevBooks,
              ...data.docs.map((b) => ({
                title: b?.title,
                key: b?.key,
                authorName: b?.author_name?.[0],
              })),
            ]),
          ];
        });
      } catch (error) {
        console.log("error", error);
        setStatus({ isLoading: false, isError: true, error });
      }
    };

    if (query?.length > 1) getApiResponse();
  }, [query, page]);

  useEffect(() => {
    if (!query) setData([]);
  }, [query]);

  return (
    <>
      {status?.error && (
        <alert>{status?.error || "Something Went Wrong"}</alert>
      )}
      <div padding="24px" style={{ width: "60%", margin: "auto" }}>
        <input
          type="text"
          style={{ fontSize: "18px" }}
          placeholder="Search Book"
          onChange={handleChange}
        />
        {data?.map((book, index) => {
          if (data.length === index + 1) {
            return (
              <p
                ref={lastElement}
                style={{ textAlign: "start" }}
                key={book?.key}
              >
                {book?.title}
              </p>
            );
          } else {
            return (
              <p style={{ textAlign: "start" }} key={book?.key}>
                {book?.title}
              </p>
            );
          }
        })}

        {status?.isLoading && <p>Loading...</p>}
      </div>
    </>
  );
};

export default AutoCompleteSearch;
