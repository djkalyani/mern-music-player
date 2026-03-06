import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import "../../css/search/SearchBar.css";

const SearchBar = ({ setSearchSongs }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSearchSongs([]);
      return;
    }

    const fetchSongs = async () => {
      try {
        setLoading(true);

        // Retrieve the token from localStorage
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/songs/playlistByTag/${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass token to satisfy protect middleware
            },
          }
        );
        setSearchSongs(res.data.results);
      } catch (error) {
        console.error("Jamendo search failed", error);
        setSearchSongs([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSongs, 500);
    return () => clearInterval(debounce);
  }, [query, setSearchSongs]);

  return (
    <div className="searchbar-root">
      <div className="searchbar-input-wrapper">
        <input
          type="text"
          className="searchbar-input"
          placeholder="Search songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <CiSearch className="search-bar-icon" size={20} />
      </div>
      {!query && !loading && (
        <p className="searchbar-empty">Search songs to display</p>
      )}

      {loading && <p className="searchbar-loading">Searching...</p>}
    </div>
  );
};

export default SearchBar;