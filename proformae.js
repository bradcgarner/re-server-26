'use strict';
// EXPRESS
const express               = require('express');
const router                = express.Router();
router.use(express.json());
// DATABASE
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// AUTH
const { jwtStrategy } = require('./auth');
const userContainer = {};
router.use((req, res, next)=>jwtStrategy(req, res, next, userContainer));
// OTHER LIBRARIES
// INTERNAL REFERENCES
const {getIdAgent} = require('./helpers');
const {proformaeFields} = require('./db-static');

// @@@@@@@@@@@ START ROUTER @@@@@@@@@@@@

router.get('/:id_agent', (req, res)=>{

	const id_agent = req.params.id_agent;

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('proformae')
			.select(`*`)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		const pf = Array.isArray(data) ? data[0] : {} ;
		return res.status(200).json(pf);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.put('/', (req, res)=>{

	const pf = req.body;
	const id_pf = pf.id_pf;
	delete pf.id_pf;

		const pfForDb = {};
	for(let f in proformaeFields){
		pfForDb[f] = pf[f];
	}

	if(!id_pf){
		return new Promise(resolve => {
			resolve();
		})		
		.then(()=>{
			return supabase
				.from('pfForDb')
				.insert(pf)
				.select()
		})
		.then(r=>{
			const { data, error } = r;
			const newPf = Array.isArray(data) ? data[0] : {} ;
			return res.status(200).json(newPf);
		})
		.catch(err => {
			console.error(err);
			return res.status(500).json(err);
		})
	}

	return new Promise(resolve => {
		resolve();
	})		
	.then(()=>{
		return supabase
			.from('pfForDb')
			.update(pf)
			.eq('id_pf',id_pf)
			.select()
	})
	.then(r=>{
		const { data, error } = r;
		const newPf = Array.isArray(data) ? data[0] : {} ;
		return res.status(200).json(newPf);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

module.exports = {
	router,
};