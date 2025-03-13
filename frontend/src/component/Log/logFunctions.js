import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "http://localhost:5000/logs";

export const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
};

export const fetchLogs = async (setLogs) => {
  const studentId = localStorage.getItem("ID");
  if (!studentId) {
    console.error("Student ID not found in localStorage");
    return;
  }

  try {
    const response = await axios.get(`${API_URL}?student_id=${studentId}`);
    const formattedData = response.data.map((row) => ({
      date: row[0],
      projectName: row[1],
      taskName: row[2],
      taskDescription: row[3],
      status: row[4],
      timeTaken: row[5],
      remark: row[6],
    }));
    setLogs(formattedData);
  } catch (error) {
    console.error("Failed to fetch logs", error);
  }
};

export const fetchRemarks = async (setRemarks) => {
  const studentId = localStorage.getItem("ID");
  if (!studentId) {
    console.error("Student ID not found in localStorage");
    return;
  }

  try {
    const response = await axios.get(`${API_URL}?student_id=${studentId}`);
    const formattedData = response.data.map((row) => ({
      date: row[0],
      remarks: row[6],
    }));
    const filteredData = formattedData.filter(
      (item) => item.remarks && item.remarks.trim() !== ""
    );
    setRemarks(filteredData);
  } catch (error) {
    console.error("Failed to fetch remarks", error);
  }
};

export const handleSubmit = async (e, formData, setFormData, fetchLogs, fetchRemarks, setShowForm) => {
  e.preventDefault();
  const studentId = localStorage.getItem("ID");

  if (!studentId) {
    console.error("Student ID not found in localStorage");
    return;
  }

  const finalFormData = {
    ...formData,
    date: formData.date || getTodayDate(),
    student_id: studentId,
  };

  try {
    await axios.post(API_URL, finalFormData);
    fetchLogs();
    fetchRemarks();
    setFormData({
      date: getTodayDate(),
      projectName: "",
      taskName: "",
      taskDescription: "",
      status: "",
      timeTaken: "",
      remarks: "",
    });
    setShowForm(false);
  } catch (error) {
    console.error("Failed to add log", error);
  }
};

export const generatePDF = (logs) => {
  const doc = new jsPDF();
  doc.text("Student Task Logs", 14, 15);

  const tableColumn = ["Date", "Project", "Task", "Status", "Time Taken"];
  const tableRows = logs.map((log) => [
    log.date,
    log.projectName,
    log.taskName,
    log.status,
    log.timeTaken,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [44, 62, 80] },
  });

  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
};
