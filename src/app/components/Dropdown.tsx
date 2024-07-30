import React, { useState, useEffect, useRef } from "react";

interface DropdownProps {
  buttonLabel: string;
  options: { label: string; value: string }[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  buttonLabel,
  options,
  selectedValue,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button className="btn m-1" onClick={() => setIsOpen(!isOpen)}>
        {buttonLabel}
      </button>
      {isOpen && (
        <ul className="menu absolute bg-base-100 rounded-box z-[1] w-32 max-md:w-28 p-2 shadow">
          {options.map((option) => (
            <li key={option.value}>
              <button
                className={`menu-item ${
                  selectedValue === option.value ? "active" : ""
                }`}
                onClick={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
