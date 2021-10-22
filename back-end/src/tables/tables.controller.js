const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

//////MIDDLEWARE OPERATIONS//////

/**
 * Makes sure data object exists
 */
async function validateData(req, res, next) {
  if (!req.body.data) {
    return next({ status: 400, message: "Body must include a data object" });
  }

  next();
}

/**
 * Validates body object to make sure all required information is correct
 */
async function validateBody(req, res, next) {
  if (!req.body.data.table_name || req.body.data.table_name === "") {
    return next({ status: 400, message: "'table_name' field cannot be empty" });
  }

  if (req.body.data.table_name.length < 2) {
    return next({
      status: 400,
      message: "'table_name' field must be at least two characters",
    });
  }

  if (!req.body.data.capacity || req.body.data.capacity === "") {
    return next({ status: 400, message: "'capacity' field cannot be empty" });
  }

  if (typeof req.body.data.capacity !== "number") {
    return next({ status: 400, message: "'capacity' field must be a number" });
  }

  if (req.body.data.capacity < 1) {
    return next({
      status: 400,
      message: "'capacity' field must be at least one",
    });
  }

  next();
}

/**
 * Validates, finds, and stores a reservation based off its ID
 */
async function validateReservationId(req, res, next) {
  const { reservation_id } = req.body.data;

  if (!reservation_id) {
    return next({
      status: 400,
      message: "'reservation_id' field must be included in the body",
    });
  }
  const reservation = await service.readReservation(Number(reservation_id));

  if (!reservation) {
    return next({
      status: 404,
      message: `reservation_id ${reservation_id} does not exist`,
    });
  }

  res.locals.reservation = reservation;

  next();
}

/**
 * Validates a seat request to make sure it's allowed
 */
async function validateSeat(req, res, next) {
  if (res.locals.table.status === "occupied") {
    return next({
      status: 400,
      message: "The table you selected is curently occupied",
    });
  }

  if (res.locals.reservation.status === "seated") {
    return next({
      status: 400,
      message: "The reservation you selected is already seated",
    });
  }

  if (res.locals.table.capacity < res.locals.reservation.people) {
    return next({
      status: 400,
      message: `The table you selected does not have enough capacity to seat ${res.locals.reservation.people} people`,
    });
  }

  next();
}

/**
 * Validates, finds, and stores a table based off its ID
 */
async function validateTableId(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);

  if (!table) {
    return next({
      status: 404,
      message: `table_id ${table_id} does not exist`,
    });
  }

  res.locals.table = table;

  next();
}

/**
 * Makes sure a table is occupied before seating a table
 */
async function validateSeatedTable(req, res, next) {
  if (res.locals.table.status !== "occupied") {
    return next({ status: 400, message: "This table is not occupied" });
  }

  next();
}

//////CRUD OPERATIONS//////

/**
 * List handler for table resources
 */
async function list(req, res) {
  const data = await service.list();

  res.json({ data });
}

/**
 * Create a table
 */
async function create(req, res) {
  if (req.body.data.reservation_id) {
    req.body.data.status = "occupied";
    await service.updateReservation(req.body.data.reservation_id, "seated");
  } else {
    req.body.data.status = "free";
  }

  const data = await service.create(req.body.data);

  res.status(201).json({ data });
}

/**
 * Seat a table
 */
async function update(req, res) {
  await service.occupy(
    res.locals.table.table_id,
    res.locals.reservation.reservation_id
  );
  await service.updateReservation(
    res.locals.reservation.reservation_id,
    "seated"
  );

  res.status(200).json({ data: { status: "seated" } });
}

/**
 * Finishes a table
 */
async function destroy(req, res) {
  await service.updateReservation(res.locals.table.reservation_id, "finished");
  await service.free(res.locals.table.table_id);

  res.status(200).json({ data: { status: "finished" } });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateBody),
    asyncErrorBoundary(create),
  ],
  update: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateTableId),
    asyncErrorBoundary(validateReservationId),
    asyncErrorBoundary(validateSeat),
    asyncErrorBoundary(update),
  ],
  destroy: [
    asyncErrorBoundary(validateTableId),
    asyncErrorBoundary(validateSeatedTable),
    asyncErrorBoundary(destroy),
  ],
};