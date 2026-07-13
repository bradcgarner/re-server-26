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
const logger = require('log123').createLogger('deals.log');

const { jwtStrategy } = require('./auth');
const { precisionRound, isPrimitiveNumber } = require('conjunction-junction/build/basic');
const userContainer = {};
router.use((req, res, next)=>jwtStrategy(req, res, next, userContainer));

const getDealById = (id_deal, res) => {
	const id_agent = getIdAgent(userContainer);
	let deal = {};

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		
		// GET DEAL
		return supabase
			.from('deals')
			.select('*')
			.eq('id_deal',id_deal)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		deal = Array.isArray(data) ? data[0] : {};
		
		deal.date_deal = {};
		deal.date_deal.date_deal_year = deal.date_deal_year;
		deal.date_deal.date_deal_month = deal.date_deal_month;
		deal.date_deal.date_deal_day = deal.date_deal_day;
		deal.date_deal.date_deal_timestamp = deal.date_deal_timestamp;
		delete deal.date_deal_year;
		delete deal.date_deal_month;
		delete deal.date_deal_day;
		delete deal.date_deal_timestamp;

		// GET ALL ACTIVITIES
		return supabase
			.from('activities_deals')
			.select('*')
			.eq('id_deal',id_deal)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		const idsActivities = Array.isArray(data) ? data.map(c=>{
			return c.id_activity;
		}) : [] ;

		return supabase
			.from('activities')
			.select('*')
			.in('id_activity',idsActivities)
			.eq('id_agent', id_agent)
			.order('date_convo_timestamp', {ascending: false})
	})
	.then(r=>{
		const { data, error } = r;
		deal.activities = [];
		deal.fus = [];
		if(Array.isArray(data)){
			data.forEach(d=>{
				if(d.date_convo_timestamp){
					deal.activities.push(d);
				} else {
					deal.fus.push(d);
				}
			})
		}
		
		// GET ALL CONTACTS
		return supabase
			.from('contacts_deals')
			.select('*')
			.eq('id_deal',id_deal)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		const idsContacts = Array.isArray(data) ? data.map(c=>{
			return c.id_contact;
		}) : [] ;
		return supabase
			.from('contacts')
			.select('*')
			.in('id_contact',idsContacts)
			.eq('id_agent', id_agent)
			.order('contact_name_last', 'contact_name_first')
	})
	.then(r=>{
		const { data, error } = r;
		deal.contacts = Array.isArray(data) ? data : [];
		
		return res.status(200).json(deal);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
};

router.get('/income', (req, res)=>{

	const id_agent = getIdAgent(userContainer);
	const today = new Date();
	const month = today.getMonth();
	const year = today.getFullYear();
	let pf_income_gci_pct = 0;
	const dealStageHash = {};
	const years = 10;
	const defaultDealStage = 116; // get from DB

	const monthSchemaHash = {
		'0': {m: 12, q: 4}, // 16  24
		'1': {m: 11, q: 4}, // 15  23
		'2': {m: 13, q: 3}, // 16  22
		'3': {m: 12, q: 3}, // 15  21
		'4': {m: 14, q: 2}, // 16  20
		'5': {m: 13, q: 2}, // 15  19
		'6': {m: 15, q: 1}, // 16  18
		'7': {m: 14, q: 1}, // 15  17
		'8': {m: 16, q: 0}, // 16  16
		'9': {m: 15, q: 0}, // 15  15
		'10': {m: 14, q: 0}, //14  14
		'11': {m: 13, q: 0}, //13  13
	};

	const schema = monthSchemaHash[`${month}`];

	const dealGroup = {
		type: '',
		period1: '',
		period2: '',
		deals: [],
	};
	const dealGroups = [];
	const dealGroupHash = {};

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('value_lists')
			.select(`id, label, color`)
			.eq('list', 'deal pipeline stage')
	})
	.then(r=>{
		const { data, error } = r;
		const vl = Array.isArray(data) ? data : [] ;
		vl.forEach(v=>{
			dealStageHash[`${v.id}`] = v;
			dealGroup[`${v.id}`] = 0;
		});

		// PUSH MONTHS
		for (let i = 0; i < schema.m; i++) {
			const newD = JSON.parse(JSON.stringify(dealGroup));
			newD.type = 'month';
			const rawMonth = month + i;
			newD.period1 = rawMonth%12;
			const yearsIncremented = rawMonth > 11 ? 1 : 0 ;
			newD.period2 = year + yearsIncremented;
			dealGroupHash[`${newD.period1}-${newD.period2}`] = newD;
			dealGroups.push(newD);
		};

		// PUSH QUARTERS
		for (let i = 0; i < schema.q; i++) {
			const newD = JSON.parse(JSON.stringify(dealGroup));
			newD.type = 'quarter';
			const theQ = 
				schema.q === 4 && i === 0 ? 1 :
				schema.q === 4 && i === 1 ? 2 :
				schema.q === 4 && i === 2 ? 3 :
				schema.q === 4 && i === 3 ? 4 :
				schema.q === 3 && i === 0 ? 2 :
				schema.q === 3 && i === 1 ? 3 :
				schema.q === 3 && i === 2 ? 4 :
				schema.q === 2 && i === 0 ? 3 :
				schema.q === 2 && i === 1 ? 4 :
				schema.q === 1            ? 4 :
				0;

			newD.period1 = `Q${theQ}`;
			newD.period2 = year + 1;
			dealGroupHash[`${newD.period1}-${newD.period2}`] = newD;
			dealGroups.push(newD);
		};

		// PUSH YEARS
		for (let i = 2; i < years; i++) {
			const newD = JSON.parse(JSON.stringify(dealGroup));
			newD.type = 'year';

			newD.period1 = '';
			newD.period2 = year + i;
			dealGroupHash[`${newD.period2}`] = newD;
			dealGroups.push(newD);
		};

		return supabase
			.from('proformae')
			.select(`pf_income_gci_pct`)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		const pf = Array.isArray(data) ? data[0] : {} ;
		pf_income_gci_pct = pf.pf_income_gci_pct || 0 ;

		return supabase
			.from('deals')
			.select(`deal_name,
				deal_stage,
				deal_timeline_stated,
				deal_value,
				deal_gci,
				date_deal_year,
				date_deal_month,
				date_deal_day`)
			.eq('id_agent', id_agent)
			.order('date_deal_timestamp')
	})
	.then(r=>{

		if(Array.isArray(r.data)){
			r.data.forEach(d=>{
				const quarter = Math.ceil((d.date_deal_month+1)/3);
				const income = precisionRound(pf_income_gci_pct * d.deal_gci, 0);
				const periodM = `${d.date_deal_month}-${d.date_deal_year}`;
				const periodQ = `Q${quarter}-${d.date_deal_year}`;
				const periodY = `${d.date_deal_year}`;
				const periodF = 
					dealGroupHash[periodM] ? periodM : 
					dealGroupHash[periodQ] ? periodQ : 
					dealGroupHash[periodY] ? periodY : 
					null;
				const newD = Object.assign({},d,{
					quarter, 
					income,
					periodM,
					periodQ,
					periodY,
					periodF
				});
				if(periodF){
					const thisP = dealGroupHash[periodF];
					for(let id in dealStageHash){
						if(!isPrimitiveNumber(thisP[`${id}`])){
							thisP[`${id}`] = 0;
						}
					}
					const deal_stage = newD.deal_stage || defaultDealStage;  
					thisP[deal_stage] += newD.deal_gci;
					thisP.deals.push(newD);
				}
			})
		}

		const data = {
			dealStageHash,
			divisors: {
				pf_income_gci_pct,
			},
			dealGroups,
			// dealGroupHash,
		};
		// logger.info(data);
		return res.status(200).json(data);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.get('/:id_deal', (req, res)=>{
	const id_deal = req.params.id_deal;
	if(!id_deal) throw { message: 'invalid id_deal' };

	return getDealById(id_deal, res);
});


router.get('/', (req, res)=>{
	const id_agent = getIdAgent(userContainer);

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('deals')
			.select(`*,
				contacts_deals (
					id_contact
				)`)
			.eq('id_agent', id_agent)
			.order('date_deal_timestamp')
	})
	.then(r=>{
		const { data, error } = r;
		if(Array.isArray(data)){
			data.forEach(c=>{
				if(Array.isArray(c.contacts_deals)){
					if(c.contacts_deals[0] && c.contacts_deals[0].id_contact){
						c.id_contact = c.contacts_deals[0].id_contact;
					}
					if(c.contacts_deals[1] && c.contacts_deals[1].id_contact){
						c.id_contact_2 = c.contacts_deals[1].id_contact;
					}
				}
			})
			return res.status(200).json(data);
		}
		return res.status(204).json({});
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.put('/', (req, res)=>{

	const deal = req.body;
	const id_deal = deal.id_deal;
	delete deal.id_deal;

	const dealForDb = {};
	for(let f in dealsFields){
		if(dealsFields[f]){
			dealForDb[f] = deal[f];
		}
	}

	if(!id_deal){
		return new Promise(resolve => {
			resolve();
		})		
		.then(()=>{
			return supabase
				.from('deals')
				.insert(dealForDb)
				.select()
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
	}

	return new Promise(resolve => {
		resolve();
	})		
	.then(()=>{
		return supabase
			.from('deals')
			.update(dealForDb)
			.eq('id_deal',id_deal)
	})
	.then(r=>{
		const { data, error } = r;
		// console.log(data, error)
		return getDealById(id_deal, res);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

module.exports = {
	router,
};