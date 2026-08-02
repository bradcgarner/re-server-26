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
const { isObjectLiteral, 
	isPrimitiveNumber } = require('conjunction-junction');
// INTERNAL REFERENCES
const {getIdAgent} = require('./helpers');
const {dailyPlansFields} = require('./db-static');

// @@@@@@@@@@@ START ROUTER @@@@@@@@@@@@

const getDailyPlanById = (id_dp, res) => {
	const id_agent = getIdAgent(userContainer);
	let dp = {};

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
		dp = Array.isArray(data) ? data[0] : {};
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
}

router.get('/prior', (req, res)=>{
	const id_agent = getIdAgent(userContainer);
	const dateDailyPlan = req.query.dateDailyPlan;
	if(!typeof dateDailyPlan === 'string'){
		throw {message: 'cannot read string'};
	}
	const theArr = dateDailyPlan.split('-');
	const date_dp_year = parseInt(theArr[0],10);
	const date_dp_month = parseInt(theArr[1],10);
	const date_dp_day = parseInt(theArr[2],10);

	if(!isPrimitiveNumber(date_dp_year)){
		throw {message: 'date_dp_year is not a number '};
	}
	if(!isPrimitiveNumber(date_dp_month)){
		throw {message: 'date_dp_month is not a number '};
	}
		if(!isPrimitiveNumber(date_dp_day)){
		throw {message: 'date_dp_day is not a number '};
	}
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
		dailyPlans = Array.isArray(data) ? data : [];
		const dp0 = dailyPlans[0] || {};
		const dp1 = dailyPlans[1] || {}
		const dailyPlan = dp0.date_dp_year === date_dp_year && dp0.date_dp_month === date_dp_month && dp0.date_dp_day === date_dp_day ?
		dp1 : dp0;
		return res.status(200).json(dailyPlan);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.get('/quick-stats', (req, res)=>{
	const id_agent = getIdAgent(userContainer);
	const today = new Date();
	const dow = today.getDay();
	const sunday = dow === 0 ? today : addTime(today, -dow, 'days');
	const saturday = addTime(sunday, 7, 'days');
	sunday.setHours(0,0,0);
	saturday.setHours(0,0,0);

	const weekStart = convertTimestampToString(sunday,'full');
	const weekEnd = convertTimestampToString(saturday,'full');

	const month = today.getMonth();
	const year = today.getFullYear();

	const monthDay1 = new Date();
	monthDay1.setHours(0,0,0);
	monthDay1.setDate(1);
	const monthDayLast = new Date();
	monthDayLast.setMonth(month === 11 ? 0 : month + 1);
	monthDayLast.setDate(1);
	monthDayLast.setHours(0,0,0);

	const monthStart = convertTimestampToString(monthDay1,'full');
	const monthEnd = convertTimestampToString(monthDayLast,'full');


	let convosWeek = 0;
	let convosMonth = 0;
	let dealsWeek = 0;
	let dealsMonth = 0;
	
	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('activities')
			.select(`id_activity`)
			.eq('id_agent', id_agent)
			.eq('convo_intentional', 168)
			.gte('date_convo_timestamp',weekStart)
			.lte('date_convo_timestamp',weekEnd)
	})
	.then(r=>{
		const { data, error } = r;
		convosWeek = Array.isArray(data) ? data.length : 0;

		return supabase
			.from('activities')
			.select(`id_activity`)
			.eq('id_agent', id_agent)
			.eq('convo_intentional', 168)
			.eq('date_convo_month',month)
			.eq('date_convo_year',year)
	})
	.then(r=>{
		const { data, error } = r;
		convosMonth = Array.isArray(data) ? data.length : 0;

		return supabase
			.from('deals')
			.select(`id_deal`)
			.eq('id_agent', id_agent)
			.gte('timestamp_created',weekStart)
			.lte('timestamp_created',weekEnd)
	})
	.then(r=>{
		const { data, error } = r;
		dealsWeek = Array.isArray(data) ? data.length : 0;

		return supabase
			.from('deals')
			.select(`id_deal`)
			.eq('id_agent', id_agent)
			.gte('timestamp_created',monthStart)
			.lte('timestamp_created',monthEnd)
	})
	.then(r=>{
		const { data, error } = r;
		dealsMonth = Array.isArray(data) ? data.length : 0;

		return res.status(200).json({
			convosWeek,
			convosMonth,
			dealsWeek,
			dealsMonth
		});
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.get('/:id_dp', (req, res)=>{
	const id_dp = req.params.id_dp;
	if(!id_dp) throw { message: 'invalid id_dp' };
	
	return getDailyPlanById(id_dp, res);
});

router.get('/', (req, res)=>{
	const id_agent = getIdAgent(userContainer);
	let dailyPlans = [];

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
		dailyPlans = Array.isArray(data) ? data : [];

		return supabase
			.from('core_values')
			.select(`*`)
			.eq('id_agent', id_agent)
			.order('sort_order')
	})	
	.then(r=>{
		const { data, error } = r;
		coreValues = Array.isArray(data) ? data : [];

		return res.status(200).json({
			dailyPlans, 
			coreValues
		});
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
	})
	.then(r=>{
		return getDailyPlanById(id_dp, res);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

module.exports = {
	router,
};