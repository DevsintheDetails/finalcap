const knex = require("../db/connection");


function create(data) {
    return knex("reservations")
    .insert(data)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}


module.exports = {
    create,
    
}