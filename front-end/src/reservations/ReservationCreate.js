import { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import {
  createReservation,
  editReservation,
  listReservations,
} from "../utils/api";

function ReservationCreate({ loadDashboard, edit }) {
  const history = useHistory();
  const { reservation_id } = useParams();

  const [reservationError, setReservationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    //initial (default data)
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  });

  /**
   * Makes API call to get all reservations.
   * If editing, prefills form for user.
   */
  useEffect(() => {
    if (edit) {
      if (!reservation_id) return null;

      loadReservations()
        .then((response) =>
          response.find(
            (reservation) =>
              reservation.reservation_id === Number(reservation_id)
          )
        )
        .then(fillFields);
    }

    function fillFields(foundReservation) {
      if (!foundReservation || foundReservation.status !== "booked") {
        return <p>Only booked reservations can be edited.</p>;
      }

      const date = new Date(foundReservation.reservation_date);
      const dateString = `${date.getFullYear()}-${(
        "0" +
        (date.getMonth() + 1)
      ).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;

      setFormData({
        first_name: foundReservation.first_name,
        last_name: foundReservation.last_name,
        mobile_number: foundReservation.mobile_number,
        reservation_date: dateString,
        reservation_time: foundReservation.reservation_time,
        people: foundReservation.people,
      });
    }

    async function loadReservations() {
      const abortController = new AbortController();
      return await listReservations(null, abortController.signal).catch(
        setReservationError
      );
    }
  }, [edit, reservation_id]);

  /**
   * Whenever user makes change to form, update the state
   */
  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]:
        target.name === "people" ? Number(target.value) : target.value,
    });
  };

  /**
   * Whenever user submits form, validate then make API call
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const abortController = new AbortController();

    const foundErrors = [];

    if (validateFields(foundErrors) && validateDate(foundErrors)) {
      if (edit) {
        editReservation(reservation_id, formData, abortController.signal)
          .then(loadDashboard)
          .then(() =>
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setApiError);
      } else {
        createReservation(formData, abortController.signal)
          .then(loadDashboard)
          .then(() =>
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setApiError);
      }
    }
    setErrors(foundErrors);

    return () => abortController.abort();
  };

  /**
   * Make sure all fields exist and that they are filled out correctly
   */
  function validateFields(foundErrors) {
    for (const field in formData) {
      if (formData[field] === "") {
        foundErrors.push({
          message: `${field.split("_").join(" ")} cannot be left blank.`,
        });
      }
    }
    return foundErrors.length === 0;
  }

  /**
   * Validation to make sure it meets restaurants criteria
   */
  function validateDate(foundErrors) {
    const reserveDate = new Date(
      `${formData.reservation_date}T${formData.reservation_time}:00.000`
    );
    const todaysDate = new Date();
    if (reserveDate.getDay() === 2) {
      foundErrors.push({
        message:
          "Reservations cannot be made on a Tuesday (Restaurant is closed).",
      });
    }

    if (reserveDate < todaysDate) {
      foundErrors.push({
        message: "Reservations cannot be made in the past.",
      });
    }

    if (
      reserveDate.getHours() < 10 ||
      (reserveDate.getHours() === 10 && reserveDate.getMinutes() < 30)
    ) {
      foundErrors.push({
        message:
          "Reservation cannot be made: Restaurant is not open until 10:30AM.",
      });
    } else if (
      reserveDate.getHours() > 22 ||
      (reserveDate.getHours() === 22 && reserveDate.getMinutes() >= 30)
    ) {
      foundErrors.push({
        message:
          "Reservation cannot be made: Restaurant is closed after 10:30PM.",
      });
    } else if (
      reserveDate.getHours() > 21 ||
      (reserveDate.getHours() === 21 && reserveDate.getMinutes() > 30)
    ) {
      foundErrors.push({
        message:
          "Reservation cannot be made: Reservation must be made at least an hour before closing (10:30PM).",
      });
    }

    return foundErrors.length === 0;
  }
  const errorsJSX = () => {
    return errors.map((error, id) => <ErrorAlert key={id} error={error} />);
  };

  return (
    <div>
      <h1>Create Reservation</h1>
      <form onSubmit={handleSubmit}>
        {errorsJSX()}
        <ErrorAlert error={apiError} />
        <ErrorAlert error={reservationError} />
        <div className="form-group">
          <label htmlFor="name">First Name:&nbsp;</label>
          <input
            className="form-control"
            id="name"
            name="first_name"
            type="text"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Last Name:&nbsp;</label>
          <input
            className="form-control"
            id="name"
            name="last_name"
            type="text"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
          ></input>
        </div>
        <div className="form-group">
          <label htmlFor="tel">Mobile Number:&nbsp;</label>
          <input
            className="form-control"
            id="tel"
            name="mobile_number"
            type="tel"
            placeholder="xxx-xxxx"
            value={formData.mobile_number}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Date of Reservation:&nbsp;</label>
          <input
            className="form-control"
            id="date"
            name="reservation_date"
            type="date"
            value={formData.reservation_date}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="time">Time of Reservation:&nbsp;</label>
          <input
            className="form-control"
            id="time"
            name="reservation_time"
            type="time"
            value={formData.reservation_time}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tel">Party Size:&nbsp;</label>
          <input
            className="form-control"
            id="size"
            name="people"
            type="number"
            value={formData.people}
            onChange={handleChange}
            min="1"
            step="1"
          />
        </div>
        <br />
        <button
          onClick={() => history.push("/")}
          type="button"
          className="btn btn-secondary mr-2"
        >
          Cancel
        </button>
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}

export default ReservationCreate;