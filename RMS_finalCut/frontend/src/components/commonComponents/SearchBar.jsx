import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    return (
        <input
            type="text"
            placeholder="Search here..."
            value={searchTerm}
            onChange={handleSearch}
            className="px-4 py-2 border rounded-md w-full md:w-1/3"
        />
    );
};

export default SearchBar;
