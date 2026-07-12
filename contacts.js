const express               = require('express');
const router                = express.Router();
const fs = require('fs');
router.use(express.json());
const {getIdAgent,
	contactsFields,
	vpAppStatusHash} = require('./activities-helpers');
const generator             = require('generate-password');

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { jwtStrategy } = require('./auth');
const { sendVPApp } = require('./notifications');
const { convertArrayToObject } = require('conjunction-junction/build/objects');
const userContainer = {};
router.use((req, res, next)=>jwtStrategy(req, res, next, userContainer));

const vpStatusValueListId = 189; // match value_lists database id

const getContactById = (id_contact, res)=>{
	const id_agent = getIdAgent(userContainer);
	if(!id_contact) throw { message: 'invalid id_contact' };

	let contact = {};

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		
		// GET CONTACT
		return supabase
			.from('contacts')
			.select(`*`)
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
		
		// GET VP APPLICATION
		return supabase
			.from('vp_app')
			.select('*')
			.eq('id_contact',contact.id_contact)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		const applications = Array.isArray(data) ? data : [];
		const app = applications[0] || {};
		app.vpAppStatusHash = vpAppStatusHash;
		contact.vp_app = app;

		return res.status(200).json(contact);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
};

router.get('/vps', (req, res)=>{
	const id_agent = getIdAgent(userContainer);
	let vps = [];

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('contacts')
			.select(`id_contact,
				contact_vp_status,
				contact_how_met,
				contact_where_met,
				contact_vp_categories,
				contact_name_first,
				contact_name_last,
				contact_phone,
				contact_email,
				contact_company,
				contact_address_city,
				contact_address_state`)
			.eq('id_agent', id_agent)
			.eq('contact_vp_status', vpStatusValueListId)
			.order('contact_company', 'contact_name_last')
	})
	.then(r=>{
		const { data, error } = r;
		
		if(Array.isArray(data)){
			vps = data;
		}
		const idsContacts = vps.map(v=>{
			return v.id_contact
		});
		return supabase
			.from('vp_app')
			.select(`vp_app_status,
				id_contact,
				id_vp_app`)
			.in('id_contact', idsContacts)
	})
	.then(r=>{
		const { data, error } = r;
		const appsHash = convertArrayToObject(data, 'id_contact');

		vps.forEach(v=>{
			const thisApp = appsHash[`${v.id_contact}`];
			if(thisApp){
				v.vp_app_status = thisApp.vp_app_status;
			}
		});
		vps.sort((a,b)=>{
			if(a.vp_app_status < b.vp_app_status){
				return -1;
			}
			if(a.vp_app_status > b.vp_app_status){
				return 1;
			}
			return 0;
		})
		return res.status(200).json({vps,vpAppStatusHash});
		
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.get('/vp-app/:id_contact', (req, res)=>{
	const id_contact = req.params.id_contact;
	if(!id_contact) throw { message: 'invalid id_contact' };
	const id_agent = getIdAgent(userContainer);

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('vp_app')
			.select(`*`)
			.eq('id_agent', id_agent)
			.eq('id_contact',id_contact)
	})
	.then(r=>{
		const { data, error } = r;
		const vpApp = Array.isArray(data) && data[0]? data[0] : {};
		vpApp.vpAppStatusHash = vpAppStatusHash;
		return res.status(200).json(vpApp);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.get('/:id_contact', (req, res)=>{
	const id_contact = req.params.id_contact;
	if(!id_contact) throw { message: 'invalid id_contact' };

	let contact = {};

	return getContactById(id_contact, res);
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

router.put('/send-vp-app', (req, res)=>{
	const vp = req.body;
	const id_contact = vp.id_contact;

	// vp API = {
	// 		id_contact: contact.id_contact,
	// 		contact_name_first: contact.contact_name_first,
	// 		contact_email: contact.contact_email,
	// 		contact_company: contact.contact_company,
	// 		id_vp_app: vpApp.id_vp_app,
	// 		vp_temp_id: vpApp.vp_temp_id,
	// }
	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return sendVPApp(vp);
	})
	.then(()=>{
		return supabase
			.from('vp_app')
			.update({
				vp_app_status: 1 // match with vpAppStatusHash
			})
			.eq('id_vp_app',vp.id_vp_app)
	})
	.then(r=>{
		return supabase
			.from('contacts')
			.update({
				contact_vp_status: vpStatusValueListId,
			})
			.eq('id_contact',vp.id_contact)
	})
	.then(r=>{
		console.log('r2',r)
		return getContactById(vp.id_contact, res);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})

});

router.put('/review-vp-app', (req, res)=>{
	const vp = req.body;
	const id_contact = vp.id_contact;

	// vp API = {
	// 		id_contact: contact.id_contact,
	// 		id_vp_app: vpApp.id_vp_app,
	// }
	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('vp_app')
			.update({
				vp_app_status: 3 // match with vpAppStatusHash
			})
			.eq('id_vp_app',vp.id_vp_app)
	})
	.then(r=>{
		return supabase
			.from('contacts')
			.update({
				contact_vp_status: vpStatusValueListId,
			})
			.eq('id_contact',vp.id_contact)
	})
	.then(r=>{
		console.log('r2',r)
		return getContactById(vp.id_contact, res);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})

});

router.put('/activate-vp', (req, res)=>{
	const vp = req.body;
	const id_contact = vp.id_contact;

	// vp API = {
	// 		id_contact: contact.id_contact,
	// 		id_vp_app: vpApp.id_vp_app,
	// }
	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('vp_app')
			.update({
				vp_app_status: 4 // match with vpAppStatusHash
			})
			.eq('id_vp_app',vp.id_vp_app)
	})
	.then(r=>{
		return supabase
			.from('contacts')
			.update({
				contact_vp_status: vpStatusValueListId,
			})
			.eq('id_contact',vp.id_contact)
	})
	.then(r=>{
		console.log('r2',r)
		return getContactById(vp.id_contact, res);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})

});

router.put('/open-vp-app', (req, res)=>{
	const vp = req.body;
	const id_contact = vp.id_contact;

	// vp API = {
	// 		id_contact: contact.id_contact,
	// 		id_vp_app: vpApp.id_vp_app,
	// }
	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('vp_app')
			.update({
				vp_app_status: 2 // match with vpAppStatusHash
			})
			.eq('id_vp_app',vp.id_vp_app)
	})
	.then(r=>{
		return supabase
			.from('contacts')
			.update({
				contact_vp_status: vpStatusValueListId,
			})
			.eq('id_contact',vp.id_contact)
	})
	.then(r=>{
		console.log('r2',r)
		return getContactById(vp.id_contact, res);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})

});

router.put('/decline-vp', (req, res)=>{
	const vp = req.body;
	const id_contact = vp.id_contact;

	// vp API = {
	// 		id_contact: contact.id_contact,
	// 		id_vp_app: vpApp.id_vp_app,
	// }
	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('vp_app')
			.update({
				vp_app_status: 5 // match with vpAppStatusHash
			})
			.eq('id_vp_app',vp.id_vp_app)
	})
	.then(r=>{
		return getContactById(vp.id_contact, res);
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
			return getContactById(newC.id_contact, res);
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
	})
	.then(()=>{
		return getContactById(id_contact, res);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});



module.exports = {
	router,
};