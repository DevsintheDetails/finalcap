# [Restaurant Reservation Fullstack Web App](https://cpar-rest-frontend.herokuapp.com/dashboard)

> Full-Stack Restaurant Reservation Web App built from the ground up by Cody Parker in Node and React. This app is to be used by restaurant staff to create and handle restaurant reservations.

### Table of Contents

1. [Live Deployment Links](#live-deployment-links)
2. [General Usage and Screenshots](#general-usage-and-screenshots)
3. [API Documentation](#api-documentation)
4. [Technologies Used](#technologies-used)
5. [Local Installation Instructions](#local-installation-instructions)
<hr/>

# Live Deployment Links

- ### [React App Client-Side Deployment](https://restaurant-reserve-128-client.herokuapp.com/dashboard)

- ### [Express API Back-End Deployment](https://restaurant-reserve-128-backend.herokuapp.com/)

# General Usage and Screenshots

## New Reservation `/reservations/new`

![New Reservation Screenshot](https://github.com/TomSparto/Restaurant-Reservations/blob/main/screenshots/newReservation.PNG?raw=true)

> Allows a user to create a new Reservation.

## New Table `/tables/new`

![New Table Screenshot](https://github.com/TomSparto/Restaurant-Reservations/blob/main/screenshots/newTable.PNG?raw=true)

> Allows a user to create a new Table.

## Dashboard `/dashboard?date=2021-10-20`

![Dashboard Screenshot](https://github.com/TomSparto/Restaurant-Reservations/blob/main/screenshots/dashboard.PNG?raw=true)

> Dashboard displays all of the restaurant tables, as well as all the reservations scheduled for the current date defined in the query. If no date is defined, the date will default to today's date.
>
> The user can traverse forward and backward one date at a time, as well as instantly travel to today's date.
>
> From here, the user can seat a booked reservation, edit a booked reservation, cancel a booked reservation, or finish an occupied table.
>
> NOTE: Reservations that have been finished or cancelled will not show up on the dashboard.

## Seat Table with a reservation `/reservations/6/seat`

![Seat Table Screenshot](https://github.com/TomSparto/Restaurant-Reservations/blob/main/screenshots/seatReservation.PNG?raw=true)

> Clicking the Seat button next to a reservation on the Dashboard takes the user to that reservation's Seat Page.
>
> On this page, the user selects one of the tables from a drop down menu to assign this reservation to.
>
> Although the user can freely select any table, the submit button will only allow the user to assign the reservation to a table that can accomodate it.

## Delete/Finish/Unseat a reservation from a table `No Route, the button is on each table in the dashboard`

![Delete/Finish/Unseat Table Screenshot](https://github.com/TomSparto/Restaurant-Reservations/blob/main/screenshots/finishTable.PNG?raw=true)

> Clicking on the Finish button displays a confirmation window.
>
> If the user confirms the action, the corresponding reservation's status is set to `finished` and the table is made free.
>
> If the confirmation window is cancelled, the button does nothing.

## Search for Reservations `/search`

![Search Screenshot](https://github.com/TomSparto/Restaurant-Reservations/blob/main/screenshots/search.PNG?raw=true)

> On the search page, a user can search for any reservation using the `Phone Number`.
>
> NOTE: The search will work for partial matches.

## Edit a Booked Reservation `reservations/7/edit`

![Edit Reservation Screenshot](https://github.com/TomSparto/Restaurant-Reservations/blob/main/screenshots/editReservation.PNG?raw=true)

> Allows a user to edit an existing reservation.
>
> NOTE: Reservations can only be edited if they are booked.

<hr/>

# API Documentation

> This REST API adheres to RESTful standards. There are only two resource endpoints: `reservations` and `tables`. This API supports the following requests:

### `GET /reservations`

- Returns a list of all reservations in the database.
- Ordered by id.

### `GET /reservations?date`

- Returns a list of all reservations scheduled for the specified date.
- Ordered by scheduled time.
- If any of the queries are a `date` query, this route will override the next route.

### `GET /reservations?mobile_number`

- Returns a list of all reservations that contain a partial match to the `mobile_number`.

### `POST /reservations`

- Creates a new reservation using the data provided in the request body data.
- Returns the newly created reservation object.
- To be a valid request, the body data must include the following properties:
  - `first_name`
  - `last_name`
  - `mobile_number`
  - `reservation_date`
    - Must be a valid date in the future
  - `reservation_time`
    - Must be a valid time in the future
  - `people`
    - Must be a number greater than zero.
- Although not required, you may optionally include the following properties
  - `reservation_id`
  - `status`
  - `created_at`
  - `edited_at`
- No other properties will be allowed in the request body data.

### `GET /reservations/:reservation_id`

- Returns a single reservation object given a valid `reservation_id` param.
- Request is invalid if the provided reservation_id does not correspond to an existing reservation.

### `PUT /reservations/:reservation_id`

- Replaces an existing reservation with the reservation provided in the request body data.
- Returns the modified reservation object.
- Has all the same validation as the above `POST /reservations` route.
- Similar to `GET /reservations/:reservation_id`, the reservation_id in the param must correspond to an existing reservation.

### `PUT /reservations/:reservation_id/status`

- Replaces an existing reservation's status with the status provided in the request body data.
- Returns the entire modified reservation object.
- Similar to `GET /reservations/:reservation_id`, the reservation_id in the param must correspond to an existing reservation.
- The status in the request body data must be one of the 4 valid statuses:
  - `booked` (default state)
  - `seated` (seated at a table)
  - `cancelled` (cancelled by user)
  - `finished` (after leaving a table, reservation is archived)
- If the reservation being modified is currently `cancelled` or `finished`, it cannot be modified.
- If the reservation being modified is currently `seated`, the status in the request body data must be `finished`

### `GET /tables`

- Returns a list of all restaurant tables in the database.
- Ordered alphabetically by the table's name.

### `POST /tables`

- Creates a new table using the data provided in the request body data.
- Returns the newly created table object.
- To be a valid request, the body data must include the following properties:
  - `table_name`
  - `capacity`
    - Must be a number greater than zero.
- Although not required, you may optionally include a `reservation_id` property
  - Note that the `occupied` property is NOT allowed, because it is conditionally set based on the presence of the optional `reservation_id`.
  - A table is only occupied if there is a reservation currently sitting at it.
- No other properties will be allowed in the request body data.

### `GET /tables/:table_id`

- Returns a single table object given a valid `table_id` param.
- Request is invalid if the provided table_id does not correspond to an existing table.

### `PUT /tables/:table_id/seat`

- Modifies a table to be seated with the reservation_id provided in the request body data.
- Similar to `GET /tables/:table_id`, request is invalid if the table_id in the params does not correspond to an exisiting table.
- Request is invalid if the reservation_id provided in the request body data does not correspond to an existing reservation.
- A table can only be seated if it is not occupied.

### `DELETE /tables/:table_id/seat`

- Modifies a table to set reservation_id to null.
  > NOTE: This is more of an update than a true delete.
- Similar to `GET /tables/:table_id`, request is invalid if the table_id in the params does not correspond to an exisiting table.
- A table's reservation can only be deleted/unseated if the table is currently occupied.
<hr/>

# Technologies Used

- Client-side Application made with `React` for state-management and front-end routing.
- UI and CSS styling primarily handled with `Bootstrap`.
- Back-end API made with `Node` and `Express`.
- API communicates with a `PostgreSQL` database.
- SQL queries in the API are made with `Knex`.
- Client-side and back-end Applications are both deployed with `Heroku`.
- The PostgreSQL Database is hosted on `ElephantSQL`.
- Unit testing handled with `Jest`.
  - `Supertest` used for back-end tests.
  - `Puppeteer` used for end-2-end tests.
  <hr/>

# Local Installation Instructions

1. Fork or Clone the repo.
1. Run `npm install` to install dependencies.
1. Run `cp ./back-end/.env.sample ./back-end/.env`.
   - Update the `./back-end/.env` file with the connection URL's to the appropriate PostgreSQL database instances that you wish to use. [`ElephantSQL`](https://www.elephantsql.com/) is a good option for getting a database up and running quickly.
1. Run `cp ./front-end/.env.sample ./front-end/.env`.
   - No changes to the `./front-end/.env` are necessary. By default, the backend API will be spun up on `http://localhost:5000`.
1. Run `npm run start:dev` to start the server in development mode.
