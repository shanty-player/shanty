import { useState, KeyboardEvent } from 'react';
import styled from 'styled-components';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

const Bar = styled.div<{ isActive: boolean }>`
  display: flex;
  border: 1px solid #5f6368;
  border-radius: 15px;
  width: 100%;
  padding: 5px;
  background: ${(props) => (props.isActive ? '#9fa3a8' : 'none')};
`;

const SearchInput = styled.input`
  border: none;
  background: inherit;
  width: 100%;
  :focus-visible {
    border: none;
    outline: none;
  }
`;

export default function SearchBar({ placeholder, onSearch }: SearchBarProps) {
  const [isActive, setIsActive] = useState(false);

  const checkIsPressEnter = (key: string) => {
    return key.includes('Enter');
  };

  const handleKeyDown = (input: KeyboardEvent<HTMLInputElement>) => {
    if (checkIsPressEnter(input.key)) {
      onSearch((input.target as HTMLInputElement).value);
    }
  };

  return (
    <Bar
      isActive={isActive}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <SearchInput placeholder={placeholder} onKeyDown={handleKeyDown} />
    </Bar>
  );
}
