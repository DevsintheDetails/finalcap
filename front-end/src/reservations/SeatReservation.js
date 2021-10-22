import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { listReservations, seatTable } from "../utils/api";

function SeatReseration({ tables, loadDashboard }) {
  const history = useHistory();

  const [table_id, setTableId] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [reservationError, setReservationError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [apiError, setApiError] = useState(null);

  const { reservation_id } = useParams();

  /**
   * When page first renders, make API call to get all reservations
   */
  useEffect(() => {
    const abortController = new AbortController();

    setReservationError(null);

    listReservations(null, abortController.signal)
      .then(setReservations)
      .catch(setReservationError);

    return () => abortController.abort();
  }, []);

  if (!tables || !reservations) return null;

  /**
   * Whenever a change is made to the form, update the state
   */
  const handleChange = ({ target }) => setTableId(target.value);

  /**
   * Whenever form is submitted, validate and make API call
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    const abortController = new AbortController();

    if (validateSeat()) {
      seatTable(reservation_id, table_id, abortController.signal)
        .then(loadDashboard)
        .then(() => history.push(`/dashboard`))
        .catch(setApiError);
    }

    return () => abortController.abort();
  };

  /**
   * Make sure reservation is able to be seated at a particular table
   */
  function validateSeat() {
    const foundErrors = [];

    const foundTable = tables.find(
      (table) => table.table_id === Number(table_id)
    );
    const foundReservation = reservations.find(
      (reservation) => reservation.reservation_id === Number(reservation_id)
    );

    if (!foundTable) {
      foundErrors.push("The table you selected does not exist.");
    } else if (!foundReservation) {
      foundErrors.push("This reservation does not exist.");
    } else {
      if (foundTable.status === "occupied") {
        foundErrors.push("The table you selected is currently occupied");
      }
      if (foundTable.capacity < foundReservation.people) {
        foundErrors.push(
          `The table you selected cannot seat ${foundReservation.people} people.`
        );
      }
    }
    setErrors(foundErrors);

    return foundErrors.length === 0;
  }

  const tableOptionsJSX = () => {
    return tables.map((table) => (
      <option key={table.table_id} value={table.table_id}>
        {table.table_name} - {table.capacity}
      </option>
    ));
  };

  const errorsJSX = () => {
    return errors.map((error, id) => <ErrorAlert key={id} error={error} />);
  };

  return (
    <div>
      <form className="form-select">
        {errorsJSX()}
        <ErrorAlert error={apiError} />
        <ErrorAlert error={reservationError} />

        <label className="form-label" htmlFor="table_id">
          Choose table:
        </label>
        <select
          className="form-control"
          name="table_id"
          id="table_id"
          value={table_id}
          onChange={handleChange}
        >
          <option value={0}>Choose A Table</option>
          {tableOptionsJSX()}
        </select>
        <button
          className="btn btn-primary m-1"
          type="submit"
          onClick={handleSubmit}
        >
          Submit
        </button>
        <button
          className="btn btn-danger m-1"
          type="button"
          onClick={history.goBack}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default SeatReseration;