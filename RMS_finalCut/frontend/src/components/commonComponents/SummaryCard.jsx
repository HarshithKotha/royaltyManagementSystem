import React from "react";

const SummaryCard = ({ title, value }) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col items-center text-center">
      <h2 className="text-sm md:text-lg font-semibold truncate">{title}</h2>
      <p className="text-xl md:text-2xl font-bold truncate">{value}</p>
    </div>
  );
};

export default SummaryCard;
