import React, { useEffect, useState } from "react";
import "./OverviewCards.css";
import axios from "axios";

const OverviewCards = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p>Loading dashboard stats...</p>;
  }

  const cards = [
    {
      title: "Total Patients",
      value: stats?.patients || 0,
      subtitle: `${stats?.admitted || 0} Admitted • ${stats?.discharged || 0} Discharged`,
      icon: "👨‍⚕️",
    },
    {
      title: "Bed Occupancy",
      value: stats?.bedOccupancy || "0%",
      subtitle: `${stats?.occupiedBeds || 0}/${stats?.totalBeds || 0} Occupied`,
      icon: "🛏️",
    },
    {
      title: "Total Staff",
      value: stats?.staff || 0,
      subtitle: `${stats?.doctors || 0} Doctors • ${stats?.nurses || 0} Nurses`,
      icon: "👥",
    },
    {
      title: "Inventory Items",
      value: stats?.inventoryItems || 0,
      subtitle: `${stats?.lowStock || 0} Low Stock`,
      icon: "📦",
    },
    {
      title: "Active Alerts",
      value: stats?.alerts || 0,
      subtitle: `${stats?.criticalAlerts || 0} Critical`,
      icon: "⚠️",
    },
  ];

  return (
    <div className="overview-grid">
      {cards.map((card, index) => (
        <div key={index} className="overview-card">
          <div className="icon">{card.icon}</div>
          <div className="content">
            <h2>{card.value}</h2>
            <p className="title">{card.title}</p>
            <p className="subtitle">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
