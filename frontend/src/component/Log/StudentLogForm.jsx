import React from 'react';

const TaskLogForm = ({ formData, handleChange, handleSubmit, setShowForm }) => {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  return (
    <div className="form-container form-open">
      <div className="form-card">
        <h2 className="form-title">Add New Task Log</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date || today} // Set today's date if no value is present
                onChange={handleChange}
                required
              /> 
            </div>  

            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="form-group">
              <label>Task Name</label>
              <input
                type="text"
                name="taskName"
                value={formData.taskName}
                onChange={handleChange}
                placeholder="Enter task name"
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="NotStarted">Not Started</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="OnHold">On Hold</option>
              </select>
            </div>

            <div className="form-group">
              <label>Total Time Taken</label>
              <input
                type="text"
                name="timeTaken"
                value={formData.timeTaken}
                onChange={handleChange}
                placeholder="e.g. 2.5 hours"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Task Description</label>
              <textarea
                name="taskDescription"
                value={formData.taskDescription}
                onChange={handleChange}
                placeholder="Describe the task details"
                rows="3"
                required
              ></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskLogForm;