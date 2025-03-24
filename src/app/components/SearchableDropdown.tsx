"use client";

import React, { useState, useRef, useEffect } from "react";

type GroupedOptions = Record<string, string[]>;

interface OptionItem {
  group: string;
  option: string;
}

interface SearchableDropdownProps {
  onSelect: (group: string, option: string) => void;
  options: GroupedOptions;
  value?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({ onSelect, options, value = "" }) => {
  const [search, setSearch] = useState(value);
  const [showOptions, setShowOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update local state when value prop changes
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Flatten grouped options into an array of OptionItem
  const allOptions: OptionItem[] = Object.keys(options).flatMap((group) =>
    options[group].map((option) => ({
      group,
      option,
    }))
  );

  // Filter options if search matches either the option text or the group name
  const filteredOptions = allOptions.filter(({ option, group }) =>
    option.toLowerCase().includes(search.toLowerCase()) ||
    group.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className="p-2 border rounded w-full"
        placeholder="Search for an option or group..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowOptions(true);
        }}
        onFocus={() => setShowOptions(true)}
      />
      {showOptions && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map(({ group, option }) => (
            <div
              key={`${group}-${option}`}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                onSelect(group, option);
                setSearch(option);
                setShowOptions(false);
              }}
            >
              {option} <span className="text-xs text-gray-500">({group})</span>
            </div>
          ))}
        </div>
      )}
      {showOptions && filteredOptions.length === 0 && (
        <div className="absolute z-10 w-full bg-white border rounded shadow-lg p-2">
          No matching options.
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
