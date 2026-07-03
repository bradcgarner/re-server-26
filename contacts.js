const express               = require('express');
const router                = express.Router();
const fs = require('fs');
router.use(express.json());
const {getIdAgent,
	contactsFields} = require('./activities-helpers');

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { jwtStrategy } = require('./auth');
const userContainer = {};
router.use((req, res, next)=>jwtStrategy(req, res, next, userContainer));


router.get('/:id_contact', (req, res)=>{
	const id_agent = getIdAgent(userContainer);
	const id_contact = req.params.id_contact;
	console.log('id_contact',id_contact)
	if(!id_contact) throw { message: 'invalid id_contact' };

	let contact = {};

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		
		// GET CONTACT
		return supabase
			.from('contacts')
			.select('*')
			.eq('id_contact',id_contact)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		contact = Array.isArray(data) ? data[0] : {};
		
		// GET ALL ACTIVITIES
		return supabase
			.from('connections')
			.select('*')
			.eq('id_contact',id_contact)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		const connections = Array.isArray(data) ? data : [];
		
		const idsActivities = connections.map(c=>{
			return c.id_activity;
		});
		return supabase
			.from('activities')
			.select('*')
			.in('id_activity',idsActivities)
			.eq('id_agent', id_agent)
			.order('date_convo_timestamp', {ascending: false})
	})
	.then(r=>{
		const { data, error } = r;
		contact.activities = [];
		contact.fus = [];
		if(Array.isArray(data)){
			data.forEach(d=>{
				if(d.date_convo_timestamp){
					contact.activities.push(d);
				} else {
					contact.fus.push(d);
				}
			})
		}
		
		// GET ALL DEALS
		return supabase
			.from('contacts_deals')
			.select('*')
			.eq('id_contact',id_contact)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		const activitiesDeals = Array.isArray(data) ? data : [];
		
		const idsDeals = activitiesDeals.map(c=>{
			return c.id_deal;
		});
		return supabase
			.from('deals')
			.select('*')
			.in('id_deal',idsDeals)
			.eq('id_agent', id_agent)
			.order('date_deal_timestamp')
	})
	.then(r=>{
		const { data, error } = r;
		contact.deals = Array.isArray(data) ? data : [];
		
		return res.status(200).json(contact);
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
			.from('contacts')
			.select(`*`)
			.eq('id_agent', id_agent)
			.order('contact_name_last', 'contact_name_first')
	})
	.then(r=>{
		const { data, error } = r;
		if(Array.isArray(data)){
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

	const contact = req.body;
	const id_contact = contact.id_contact;
	delete contact.id_contact;
	const contactForDb = {};
	for(let f in contactsFields){
		contactForDb[f] = contact[f];
	}

	if(!id_contact){
		return new Promise(resolve => {
			resolve();
		})		
		.then(()=>{
			return supabase
				.from('contacts')
				.insert(contactForDb)
				.select()
		})
		.then(r=>{
			const { data, error } = r;
			const newC = Array.isArray(data) ? data[0] : {} ;
			return res.status(200).json(newC);
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
			.from('contacts')
			.update(contactForDb)
			.eq('id_contact',id_contact)
			.select()
	})
	.then(r=>{
		const { data, error } = r;
		console.log(r)
		const newC = Array.isArray(data) ? data[0] : {} ;
		return res.status(200).json(newC);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

module.exports = {
	router,
};