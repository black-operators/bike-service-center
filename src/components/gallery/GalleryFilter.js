import React from "react";

const GalleryFilter = ({ setCategory }) => {
  return (
    <div className="gallery-filter">
      <button onClick={() => setCategory("all")}>All</button>
      <button onClick={() => setCategory("washing")}>Washing</button>
      <button onClick={() => setCategory("modification")}>Modification</button>
      <button onClick={() => setCategory("second hand bike")}>Second Hand Bike</button>
      <button onClick={() => setCategory("evService")}>EV Service</button>
      <button onClick={() => setCategory("spare parts")}>Spare Parts</button>
    </div>
  );
};

export default GalleryFilter;
