import React, { useState } from "react";
import styled from "styled-components";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const HeartIcon = styled.div`
  position: absolute;
  top: 20px;        // antes 10px → ahora más abajo
  right: 20px;      // antes 10px → ahora más hacia adentro
  cursor: pointer;
  z-index: 2;
  font-size: 20px;
  color: ${props => props.$favorited ? "#f5a623" : "#aaa"};

  &:hover {
    transform: scale(1.1);
    transition: transform 0.2s ease;
  }
`;

export const FavoriteButton = ({ initialFavorite = false, onToggle }) => {
  const [favorited, setFavorited] = useState(initialFavorite);

  const handleClick = () => {
    setFavorited(!favorited);
    if (onToggle) {
      onToggle(!favorited);
    }
  };

  return (
    <HeartIcon $favorited={favorited} onClick={handleClick}>
      {favorited ? <FaHeart /> : <FaRegHeart />}
    </HeartIcon>
  );
};
