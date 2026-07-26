const express               = require('express');
const router                = express.Router();
const fs = require('fs');
router.use(express.json());
const {getIdAgent,
	dealsFields} = require('./activities-helpers');

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { jwtStrategy } = require('./auth');
const { precisionRound, isPrimitiveNumber } = require('conjunction-junction/build/basic');
const userContainer = {};
router.use((req, res, next)=>jwtStrategy(req, res, next, userContainer));


router.get('/', (req, res)=>{
	const id_agent = getIdAgent(userContainer);

	const response = {
		items: [],
	};
	const coach_abbrev = 'EWTS - EG';

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('coaches')
			.select(`*`)
			.eq('coach_abbrev', coach_abbrev)
	})
	.then(r=>{
		const { data, error } = r;
		if(error){
			console.error(error)
		}
		if(Array.isArray(data) && data[0]){
			response.coach = data[0].coach;
			response.coach_abbrev = data[0].coach_abbrev;
			response.coach_header = data[0].coach_header;
		}
		return supabase
			.from('coaching')
			.select(`*`)
			.eq('coach_abbrev', coach_abbrev)
			.order('sort_order')
	})
	.then(r=>{
		const { data, error } = r;
		if(error){
			console.error(error)
		}	
		if(Array.isArray(data)){
			response.items = data;
		}
		return res.status(200).json(response);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.put('/', (req, res)=>{

	return new Promise(resolve => {
		resolve();
	})		
	.then(()=>{
		return supabase
			.from('coaching')
			.insert({})
	})
	.then(r=>{
		const { data, error } = r;
		const newD = Array.isArray(data) ? data[0] : {} ;
		return res.status(200).json(newD);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
	
});

module.exports = {
	router,
};