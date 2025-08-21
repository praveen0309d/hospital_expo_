import React from "react";

const DoctorDirectory = ({ doctors }) => {
  return (
    <div>
      <h2>Doctor Directory</h2>
      {doctors?.map((d, i) => (
        <div key={i} style={{ marginBottom: "10px" }}>
          <p><strong>Name:</strong> {d.name}</p>
          <p><strong>Department:</strong> {d.department}</p>
          <p><strong>Specialization:</strong> {d.specialization}</p>
          <p><strong>Contact:</strong> {d.phone} | {d.email}</p>
        </div>
      ))}
    </div>
  );
};

export default DoctorDirectory;
