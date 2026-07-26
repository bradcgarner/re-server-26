const express               = require('express');
const router                = express.Router();
const fs = require('fs');
router.use(express.json());
const {getIdAgent,
	contactsFields,
	vpAppStatusHash} = require('./activities-helpers');
const generator             = require('generate-password');
const { convertArrayToObject } = require('conjunction-junction');

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { jwtStrategy } = require('./auth');
const { sendVPApp, sendReferrals } = require('./notifications');
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

		// GET VP REFERENCES
		return supabase
			.from('activities')
			.select(`id_activity,
				date_convo_timestamp,
				convo_notes,
				convo_vp_ref,
				id_contact_fu,
				id_vp_fu`)
			.eq('id_vp_fu',contact.id_contact)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		const refs = Array.isArray(data) ? data : [];
		contact.vp_refs = refs;

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

router.get('/vp-groups', (req, res)=>{
	const id_agent = getIdAgent(userContainer);

	const vpHash = {};

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('contacts')
			.select(`id_contact,
				contact_vp_categories,
				contact_company,
				contact_vp_areas,
				contact_address_city,
				contact_address_state`)
			.eq('id_agent', id_agent)
			.eq('contact_vp_status', vpStatusValueListId)
			.order('contact_company', 'contact_name_last')
	})
	.then(r=>{
		const vps = r && Array.isArray(r.data) ? r.data : [];

		vps.forEach(v=>{
			if(Array.isArray(v.contact_vp_categories)){
				v.contact_vp_categories.forEach(c=>{
					if(!Array.isArray(vpHash[c])){
						vpHash[c] = [];
					}
					vpHash[c].push(v);
				})
			}
		});

		return supabase
			.from('vp_categories')
			.select(`*`)
			.order('sort_order')
	})
	.then(r=>{
		const { data, error } = r;

		const vp_categories = Array.isArray(data) ? data : [] ;

		const vpGroupHash = {};
		vp_categories.forEach(c=>{
			c.vp_members = Array.isArray(vpHash[c.vp_category]) ? vpHash[c.vp_category] : [];
			if(!Array.isArray(vpGroupHash[c.vp_group])){
				vpGroupHash[c.vp_group] = [];
			}
			vpGroupHash[c.vp_group].push(c);
		})
		return res.status(200).json(vpGroupHash);
		
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

router.put('/get-refs', (req, res)=>{
	const id_agent = getIdAgent(userContainer);
	let vps = [];

	const referralBasket = req.body || {};
	if(!referralBasket.to){
		referralBasket.to = {};
	}
	if(!referralBasket.include){
		referralBasket.include = {};
	}

	const idsAll = [];
	const idsReferences = [];

	for(let k in referralBasket.to){
		idsAll.push(parseInt(k, 10));
	}
	for(let k in referralBasket.include){
		idsAll.push(parseInt(k, 10));
		idsReferences.push(parseInt(k, 10));
	}

	let contacts = [];
	let references = [];

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('contacts')
			.select(`id_contact,
				contact_name_first,
				contact_name_last,
				contact_title,
				contact_company,
				contact_phone,
				contact_email,
				contact_url,
				contact_review_url,
				contact_address_street,
				contact_address_city,
				contact_address_state,
				contact_vp_areas,
				contact_vp_categories`)
			.eq('id_agent', id_agent)
			.in('id_contact', idsAll)
	})
	.then(r=>{
		const { data, error } = r;
		if(Array.isArray(data)){
			contacts = data;
		}

		return supabase
			.from('activities')
			.select(`id_activity,
				date_convo_timestamp,
				id_contact_fu,
				id_vp_fu,
				convo_vp_ref,
				convo_notes`)
			.in('id_vp_fu',idsReferences)
			.eq('id_agent',id_agent)
			.eq('convo_main_purpose', 34)
	})
	.then(r=>{
		const { data, error } = r;
		if(Array.isArray(data)){
			references = data;
		}

		const referralBasketNew = JSON.parse(JSON.stringify(referralBasket));
		for(let k in referralBasketNew.to){
			referralBasketNew.to[k] = {contact:{}};
			theId = parseInt(k, 10);
			contacts.forEach(c=>{
				if(c.id_contact === theId){
					referralBasketNew.to[k].contact = c;
				}
			});
		}
		for(let k in referralBasketNew.include){
			referralBasketNew.include[k] = {contact:{},refs:[]};
			theId = parseInt(k, 10);
			contacts.forEach(c=>{
				if(c.id_contact === theId){
					referralBasketNew.include[k].contact = c;
				}
			});
			references.forEach(r=>{
				if(r.id_vp_fu === theId){
					referralBasketNew.include[k].refs.push(r);
				}
			});
		}
		
		return res.status(200).json(referralBasketNew);
		
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.put('/send-refs', (req, res)=>{
	const id_agent = getIdAgent(userContainer);

	const referrals = Array.isArray(req.body) ? req.body : null;

	if(!referrals){
		return res.status(204);
	}

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		sendReferrals(referrals);
	})
	.then(()=>{
		return res.status(200).json({ok: true});
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.put('/send-vp-app', (req, res)=>{
	const vp = req.body;
	const id_contact = vp.id_contact;

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