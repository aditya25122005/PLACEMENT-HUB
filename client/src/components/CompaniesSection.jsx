import React from "react";
import "../App.css";

const companiesTop = [
  { name: "Google", logo: "https://logo.clearbit.com/google.com" },
  { name: "Amazon", logo: "https://logo.clearbit.com/amazon.com" },
  { name: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com" },
  { name: "Adobe", logo: "https://logo.clearbit.com/adobe.com" },
  { name: "IBM", logo: "https://logo.clearbit.com/ibm.com" },
  { name: "Oracle", logo: "https://logo.clearbit.com/oracle.com" },
];

const companiesBottom = [
  { name: "Uber", logo: "https://logo.clearbit.com/uber.com" },
  { name: "Spotify", logo: "https://logo.clearbit.com/spotify.com" },
  { name: "HP", logo: "https://logo.clearbit.com/hp.com" },
  { name: "Siemens", logo: "https://logo.clearbit.com/siemens.com" },
  { name: "Intel", logo: "https://logo.clearbit.com/intel.com" },
  { name: "Cisco", logo: "https://logo.clearbit.com/cisco.com" },
];

const CompaniesSection = () => {
  const renderCards = (list) =>
    list.concat(list).map((company, idx) => (
      <div key={idx} className="company-card">
        <img
          src={company.logo}
          alt={company.name}
          className="company-logo"
          onError={(e) => {
            // ⭐ FALLBACK IF CLEARBIT FAILS
            e.target.src =
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
          }}
        />
        <p>{company.name}</p>
      </div>
    ));

  return (
    <section className="companies-section">
      <h2>Top Companies for Placements 🚀</h2>

      <div className="companies-slider marquee-left">
        {renderCards(companiesTop)}
      </div>

      <div className="companies-slider marquee-right">
        {renderCards(companiesBottom)}
      </div>
    </section>
  );
};

export default CompaniesSection;
