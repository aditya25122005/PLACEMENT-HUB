import React, { useState } from "react";

const CompanyLogo = ({ name }) => {
  const [error, setError] = useState(false);

  // Try clearbit first
  const logoUrl = `https://logo.clearbit.com/${name.toLowerCase().replace(/\s/g, "")}.com`;

  if (error) {

    return (
      <div className="company-logo-fallback">
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      className="company-logo"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
};

export default CompanyLogo;
