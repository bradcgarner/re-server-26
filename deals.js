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
const userContainer = {};
router.use((req, res, next)=>jwtStrategy(req, res, next, userContainer));

router.get('/:id_deal', (req, res)=>{
	const id_deal = req.params.id_deal;
	if(!id_deal) throw { message: 'invalid id_deal' };

	let deal = {};
	const id_agent = getIdAgent(userContainer);

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
		dealForDb[f] = deal[f];
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
});

module.exports = {
	router,
};