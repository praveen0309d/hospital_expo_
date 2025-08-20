import React from "react";
import DoctorOverviewCards from "../components/DoctorOverviewCards";
import PatientList from "../components/PatientList";
import AppointmentList from "../components/AppointmentList";
import PrescriptionList from "../components/PrescriptionList";
import Messages from "../components/Messages";
import Notifications from "../components/Notifications";
import Reports from "../components/Reports";
import ScheduleCalendar from "../components/ScheduleCalendar";

const DoctorDashboard = () => {
  const dashboardData = {
    stats: { patientsToday: 8, appointments: 12, pendingReports: 4 },
    patients: [
      { id: 1, name: "John Doe", age: 35, issue: "Fever" },
      { id: 2, name: "Sarah Lee", age: 42, issue: "Diabetes" },
    ],
    appointments: [
      { id: 1, patient: "John Doe", time: "10:00 AM", status: "Completed" },
      { id: 2, patient: "Sarah Lee", time: "11:30 AM", status: "Pending" },
    ],
    prescriptions: [
      { id: 1, patient: "John Doe", medicine: "Paracetamol", dosage: "500mg" },
    ],
    messages: [
      { id: 1, from: "Admin", text: "Meeting at 2 PM" },
      { id: 2, from: "Patient Sarah", text: "Need prescription refill" },
    ],
    notifications: [
      "Lab report ready for Patient: John Doe",
      "New appointment booked for tomorrow",
    ],
    reports: [
      { id: 1, type: "Blood Test", patient: "Sarah Lee", status: "Pending" },
    ],
  };

  return (
    <>
      <DoctorOverviewCards stats={dashboardData.stats} />
      <div className="dashboard-grid">
        <div className="grid-item">
          <div className="card">
            <h2>My Patients</h2>
            <PatientList patients={dashboardData.patients} />
          </div>
        </div>

        <div className="grid-item">
          <div className="card">
            <h2>Appointments</h2>
            <AppointmentList appointments={dashboardData.appointments} />
          </div>
        </div>

        <div className="grid-item">
          <div className="card">
            <h2>Prescriptions</h2>
            <PrescriptionList prescriptions={dashboardData.prescriptions} />
          </div>
        </div>

        <div className="grid-item">
          <div className="card">
            <h2>Messages</h2>
            <Messages messages={dashboardData.messages} />
          </div>
        </div>

        <div className="grid-item">
          <div className="card">
            <h2>Notifications</h2>
            <Notifications notifications={dashboardData.notifications} />
          </div>
        </div>

        <div className="grid-item">
          <div className="card">
            <h2>Reports</h2>
            <Reports reports={dashboardData.reports} />
          </div>
        </div>

        <div className="grid-item-full">
          <div className="card">
            <h2>My Schedule</h2>
            <ScheduleCalendar appointments={dashboardData.appointments} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
