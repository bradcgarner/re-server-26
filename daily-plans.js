const express               = require('express');
const router                = express.Router();
const fs = require('fs');
router.use(express.json());
const {getIdAgent,
	dailyPlansFields} = require('./activities-helpers');

const { createClient } = require('@supabase/supabase-js');
const { isObjectLiteral } = require('conjunction-junction/build/basic');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { jwtStrategy } = require('./auth');
const userContainer = {};
router.use((req, res, next)=>jwtStrategy(req, res, next, userContainer));


router.get('/:id_dp', (req, res)=>{
	const id_agent = getIdAgent(userContainer);
	const id_dp = req.params.id_dp;
	if(!id_dp) throw { message: 'invalid id_dp' };

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('daily_plans')
			.select('*')
			.eq('id_dp',id_dp)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		const dp = Array.isArray(data) ? data[0] : {};
		dp.date_dp = {
			date_dp_year: dp.date_dp_year,
			date_dp_month: dp.date_dp_month,
			date_dp_day: dp.date_dp_day,
			date_dp_timestamp: dp.date_dp_timestamp,
		};
		delete dp.date_dp_year;
		delete dp.date_dp_month;
		delete dp.date_dp_day;
		delete dp.date_dp_timestamp;
		return res.status(200).json(dp);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.get('/', (req, res)=>{
	const id_agent = getIdAgent(userContainer);

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('daily_plans')
			.select(`*`)
			.eq('id_agent', id_agent)
			.order('date_dp_timestamp', {ascending: false})
	})
	.then(r=>{
		const { data, error } = r;
		if(Array.isArray(data)){
			return res.status(200).json(data);
		}
		return res.status(204).json([]);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.put('/', (req, res)=>{

	const dp = req.body;
	const id_dp = dp.id_dp;
	delete dp.id_dp;

	if(isObjectLiteral(dp.date_dp)){
		dp.date_dp_year = dp.date_dp.date_dp_year;
		dp.date_dp_month = dp.date_dp.date_dp_month;
		dp.date_dp_day = dp.date_dp.date_dp_day;
		dp.date_dp_timestamp = dp.date_dp.date_dp_timestamp;
	}
	delete dp.date_dp;

	const dpForDb = {};
	for(let f in dailyPlansFields){
		dpForDb[f] = dp[f];
	}

	if(!id_dp){
		return new Promise(resolve => {
			resolve();
		})		
		.then(()=>{
			return supabase
				.from('daily_plans')
				.insert(dpForDb)
				.select()
		})
		.then(r=>{
			const { data, error } = r;
			const newDP = Array.isArray(data) ? data[0] : {} ;
			return res.status(200).json(newDP);
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
			.from('daily_plans')
			.update(dpForDb)
			.eq('id_dp',id_dp)
			.select()
	})
	.then(r=>{
		const { data, error } = r;
		const newDP = Array.isArray(data) ? data[0] : {} ;
		return res.status(200).json(newDP);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

module.exports = {
	router,
};