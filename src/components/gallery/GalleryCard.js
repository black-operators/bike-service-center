import React from "react";

const GalleryCard = ({ data }) => {
  return (
    <div className="gallery-card">
      <img src={data.image} alt={data.title || "Gallery image"} />
    </div>
  );
};

export default GalleryCard;
