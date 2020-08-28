const models = require('../database/models');
require('dotenv').config();
const Axios = require('axios');
const fs = require('fs');

const createHolding = async (req, res) => {
    try {
        const newHolding = req.body;
        const holding = await models.Holding.create(newHolding);
        return res.status(201).json({holding})
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getStockPrice = async (req, res) => {

    try {
        // old version using the api
        // const iex_token = process.env.iex_token;
        // const iex_url = `https://sandbox.iexapis.com/stable/stock/market/batch?symbols=aapl,fb,tsla,nflx&types=quote&filter=latestPrice&token=${iex_token}`;
        // const { data } = await Axios.get(iex_url);
       

        fs.readFile('symbols.json', (err, data) => {
            if(err) throw err;
            let symbols = JSON.parse(data);
            console.log('symbols on backend', symbols);
            return res.status(200).json(symbols);
        })

        // return res.status(200).json(symbols);
    } catch (error) {
        console.log('Tenemos un error');
        return res.status(500).send(error.message);
    }
}

const getAllHoldings = async (req, res) => {
    try {
        const holdings = await models.Holding.findAll({ raw: true });
        return res.status(200).json({ holdings });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

const getHoldingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const holdings = await models.Holding.findAll({
            where: { userId: userId, isActive: true }
        });
        return res.status(200).json({ holdings });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

const getHoldingById = async (req, res) => {
    try {
        const { holdingId } = req.params;
        const holding = await models.Holding.findOne({
            where: { id: holdingId }
        });
        if (holding) {
            return res.status(200).json({ holding });
        }
        return res.status(404).send('Holding with the specified ID does not exists');
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

const updateHolding = async (req, res) => {
    try {
        const { holdingId } = req.params;
        const [updated] = await models.Holding.update(req.body, {
            where: { id: holdingId }
        });
        if (updated) {
            const updatedHolding = await models.Holding.findOne({ where: { id: holdingId } });
            return res.status(200).json({ holding: updatedHolding });
        }
        throw new Error('Holding not found');
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

const deleteHolding = async (req, res) => {
    try {
        const { holdingId } = req.params;
        const deleted = await models.Holding.destroy({
            where: { id: holdingId }
        });
        if (deleted) {
            return res.status(204).send('Holding Deleted');
        }
        throw new Error('Holding not found');
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

const getSymbols = async (req, res) => {
    try {
        // old version using the api
        // const iex_token = process.env.iex_token;
        // const iex_url = `https://sandbox.iexapis.com/stable/stock/market/batch?symbols=aapl,fb,tsla,nflx&types=quote&filter=latestPrice&token=${iex_token}`;
        // const { data } = await Axios.get(iex_url);
       

        fs.readFile('symbols.json', (err, data) => {
            if(err) throw err;
            let symbols = JSON.parse(data);
            // console.log(symbols);
            return res.status(200).json(symbols);
        })

        // return res.status(200).json(symbols);
    } catch (error) {
        console.log('Tenemos un error');
        return res.status(500).send(error.message);
    }
}



module.exports = {
    deleteHolding,
    updateHolding,
    getHoldingsByUser,
    getAllHoldings,
    createHolding,
    getHoldingById,
    getSymbols,
    getStockPrice,
}