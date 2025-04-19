"use client";

import React, { useState, useRef, useEffect } from "react";

const colorCssMap: Record<string, string> = {
  Burgundy:     "maroon",
  Cream:        "papayawhip",
  "Baby Blue":  "lightblue",
  "Baby Pink":  "lightpink",
  Lavender:     "lavender",
  Coral:        "coral",
  "Mint Green": "mediumseagreen",
  Peach:        "peachpuff",
  Mauve:        "plum",
  "Sky Blue":   "skyblue",
  Charcoal:     "#36454F",
  Mustard:      "#FFDB58",
  Blush:        "#DE5D83",
  Emerald:      "#50C878",
  "Rose Gold":  "#B76E79",
  Champagne:    "#F7E7CE",
  Chocolate:    "chocolate",
  Lilac:        "#C8A2C8",
  Seafoam:      "#93E9BE",
  "Burnt Orange":"#CC5500",
  "Forest Green":"forestgreen",
  "Slate Gray": "slategray"
};
// Type for grouped options
type GroupedOptions = Record<string, string[]>;

// Flattened option
interface OptionItem {
  group: string;
  option: string;
}

interface SearchableDropdownProps {
  onSelect: (group: string, option: string) => void;
  options: GroupedOptions;
  value?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  onSelect,
  options,
  value = ""
}) => {
  const [search, setSearch] = useState(value);
  const [showOptions, setShowOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // keep input value in sync
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // flatten grouped options
  const allOptions: OptionItem[] = Object.entries(options).flatMap(
    ([group, opts]) => opts.map(option => ({ group, option }))
  );

  // filter based on search text
  const filtered = allOptions.filter(
    ({ option, group }) =>
      option.toLowerCase().includes(search.toLowerCase()) ||
      group.toLowerCase().includes(search.toLowerCase())
  );

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // detect color dropdown (single "colors" group)
  const groupKeys = Object.keys(options);
  const isColorDropdown =
    groupKeys.length === 1 && /color/gi.test(groupKeys[0]);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className="p-2 border rounded w-full"
        placeholder="Search…"
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setShowOptions(true);
        }}
        onFocus={() => setShowOptions(true)}
      />

      {showOptions && (
        <div className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {isColorDropdown ? (
            <div className="grid grid-cols-4 gap-2 p-2">
              {filtered.map(({ option }) => (
                <button
                  key={option}
                  type="button"
                  className="flex flex-col items-center p-1 hover:bg-gray-100 rounded transition-colors"
                  onClick={() => {
                    onSelect(groupKeys[0], option);
                    setSearch(option);
                    setShowOptions(false);
                  }}
                >
                  <span
                    className="block h-6 w-6 rounded-full border mb-1"
                    style={{ backgroundColor: colorCssMap[option] ?? option }}
                  />
                  <span className="text-xs text-center">{option}</span>
                </button>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            filtered.map(({ group, option }) => (
              <div
                key={`${group}-${option}`}
                className="p-2 hover:bg-gray-200 cursor-pointer flex justify-between"
                onClick={() => {
                  onSelect(group, option);
                  setSearch(option);
                  setShowOptions(false);
                }}
              >
                <span>{option}</span>
                <span className="text-xs text-gray-500">({group})</span>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No matching options.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
