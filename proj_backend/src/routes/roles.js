/* eslint-disable no-unused-vars */
const express = require('express');
const uuidv1 = require('uuid/v1');
const db = require('../db');
const { validate } = require('../validations/role');

const router = express.Router();
const tableName = 'roles';

router.get('/', async (_request, response) => {
  const queryString = `SELECT id, name FROM ${tableName}`;
  const queryParams = [];
  db.query(queryString, queryParams, (error, res) => {
    if (error) { return response.status(400).send(error); }
    return response.status(200).send(res.rows);
  });
});

router.get('/:id', async (request, response, next) => {
  const queryString = `SELECT name FROM ${tableName} WHERE id = $1`;
  const queryParams = [request.params.id];
  db.query(queryString, queryParams, (error, result) => {
    if (error) { return next(response.status(400).send(error)); }
    if (result.rowCount < 1) { return response.status(404).send(`Role with ${request.params.id} does not exist.`); }
    return response.status(200).send(result.row[0]);
  });
});

router.delete('/:id', async (request, response) => {
  const queryString = `DELETE FROM ${tableName} WHERE id = $1`;
  const queryParams = [request.params.id];
  db.query(queryString, queryParams, (error, result) => {
    if (error) { return response.status(400).send(error); }
    if (result.rowCount < 1) { return response.status(404).send('Role does not exist. Delete task is aborted.'); }
    return response.status(200).send('Role was successfully deleted.');
  });
});

router.post('/', async (request, response, next) => {
  const validationResult = validate(request.body);
  if (validationResult.error) {
    return response.status(400).send(validationResult.error.details[0].message);
  }
  const id = uuidv1();
  const queryString = `INSERT INTO ${tableName}(id, name) VALUES ($1, $2)`;
  const queryParams = [id, request.body.name];
  return db.query(queryString, queryParams, (error, result) => {
    if (error) { return next(response.status(400).send(error.detail)); }
    return response.status(200).send('Role created successfully');
  });
});

module.exports = router;