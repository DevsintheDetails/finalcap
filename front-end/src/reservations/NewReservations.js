import React, { useState } from "react";
import { useHistory } from "react-router-dom";

export default function NewReservation() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 0,
  });

  function handleChange({ target }) {
    setFormData({
      ...formData,
      [target.name]:
        target.name === "people" ? Number(target.value) : target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    history.push(`/dashboard?date=${formData.reservation_date}`);
  }
  return (
    <main>
      <h1>New Reservations</h1>
      <div className="d-md-flex mb-3">
        <form>
          <div className="form-group">
            <label htmlFor="first_name">First Name:</label>

            <input
              className="form-control"
              name="first_name"
              id="first_name"
              title="Please enter first name"
              placeholder="First Name Here"
              type="text"
              onChange={handleChange}
              value={formData.first_name}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name:</label>
            <input
              className="form-control"
              name="last_name"
              id="last_name"
              title="Please enter last name"
              placeholder="Last Name Here"
              type="text"
              onChange={handleChange}
              value={formData.last_name}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile_number">Mobile Number:</label>
            <input
              className="form-control"
              name="mobile_number"
              id="mobile_number"
              title="Please enter mobile number"
              placeholder="Mobile Number Here"
              type="text"
              onChange={handleChange}
              value={formData.mobile_number}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reservation_date">Reservation Date:</label>
            <input
              className="form-control"
              name="reservation_date"
              id="reservation_date"
              title="Enter the date you wish to reserve"
              type="date"
              onChange={handleChange}
              value={formData.reservation_date}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reservation_time">Reservation Time:</label>
            <input
              className="form-control"
              name="reservation_time"
              id="reservation_time"
              type="time"
              onChange={handleChange}
              value={formData.reservation_time}
              title="Please select time you wish to reserve"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="people">People</label>
            <input
              className="form-control"
              name="people"
              id="people"
              type="number"
              onChange={handleChange}
              value={formData.people}
              min="1"
            />

            <button
              className="btn btn-danger m-1"
              type="button"
              onClick={history.goBack}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary m-1"
              type="submit"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
