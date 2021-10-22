import React, { useState, useEffect } from "react";
import { listReservations, listTables } from "../utils/api";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import ReservationCreate from "../reservations/ReservationCreate";
import TableCreate from "../tables/TableCreate";
import useQuery from "../utils/useQuery";
import SeatReservation from "../reservations/SeatReservation";
import Lookup from "../lookup/Lookup";
import NewReservation from "../reservations/NewReservations";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  const query = useQuery();
  const date = query.get("date") ? query.get("date") : today();

  useEffect(loadDashboard, [date]);

  /**
   * Grabs all current reservations and tables through API call
   */
  function loadDashboard() {
    const abortController = new AbortController();

    setReservationsError(null);
    setTablesError(null);

    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    listTables(abortController.signal)
      .then((tables) =>
        tables.sort((tableA, tableB) => tableA.table_id - tableB.table_id)
      )
      .then(setTables)
      .catch(setTablesError);

    return () => abortController.abort();
  }

  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>

      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>

      <Route path="/reservations/new">
        <ReservationCreate loadDashboard={loadDashboard} />
      </Route>

      <Route path="/reservations/:reservation_id/edit">
        <ReservationCreate loadDashboard={loadDashboard} edit={true} />
      </Route>

      <Route path="/reservations/:reservation_id/seat">
        <SeatReservation loadDashboard={loadDashboard} tables={tables} />
      </Route>

      <Route path="/tables/new">
        <TableCreate loadDashboard={loadDashboard} />
      </Route>

      <Route path="/dashboard">
        <Dashboard
          date={date}
          reservations={reservations}
          reservationsError={reservationsError}
          tables={tables}
          tablesError={tablesError}
          loadDashboard={loadDashboard}
        />
      </Route>

      <Route exact={true} path="/search">
        <Lookup />
      </Route>

      <Route path="/reservations/new">
        <NewReservation />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
