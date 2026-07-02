const express               = require('express');
const router                = express.Router();
const fs = require('fs');
router.use(express.json());

const { 
	isObjectLiteral, 
	convertArrayToObject } = require('conjunction-junction');

const { formatActivityToPut,
	formatInsertPromises,
	formatUpdatePromises, 
	createFinalActivity } = require('./activities-helpers');

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { jwtStrategy } = require('./auth');
const userContainer = {};
router.use((req, res, next)=>jwtStrategy(req, res, next, userContainer));

let id_agent = 1;

router.get('/follow-ups', (req, res)=>{

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('activities')
			.select(`id_activity,
				timestamp_created,
				id_contact_fu,
				id_agent,
				date_fu_timestamp,
				fu_purpose`)
			.not('date_fu_timestamp','is',null)
			.eq('id_agent', id_agent)
			.order('date_convo_timestamp')
	})
	.then(r=>{
		const { data, error } = r;
		return res.status(200).json(data);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.get('/:id_activity', (req, res)=>{
  const id_activity = req.params.id_activity;
  if(!id_activity) throw { message: 'invalid id_activity' };

	let activity = {};
	let contacts = [];
	let connections = [];

	let connectionsJoins = [];
	let activitiesDeals = [];
	let followUps = [];
	let allContacts = [];

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		
		// GET ACTIVITY
		return supabase
			.from('activities')
			.select('*')
			.eq('id_activity',id_activity)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		activity = Array.isArray(data) ? data[0] : {};
		activity.date_convo = {
			date_convo_day:       activity.date_convo_day,
			date_convo_month:     activity.date_convo_month,
			date_convo_year:      activity.date_convo_year,
			date_convo_timestamp: activity.date_convo_timestamp,
		};
		delete activity.date_convo_day;
		delete activity.date_convo_month;
		delete activity.date_convo_year;
		delete activity.date_convo_timestamp;
		
		// GET ALL CONTACT IDS
		return supabase
			.from('connections')
			.select('*')
			.eq('id_activity',id_activity)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		connectionsJoins = Array.isArray(data) ? data : [];
		
		const contactIds = connectionsJoins.map(c=>{
			return c.id_contact;
		});

		return supabase
			.from('contacts')
			.select('*')
			.in('id_contact',contactIds)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		allContacts = Array.isArray(data) ? data : [] ;
		const allContactHash = convertArrayToObject(allContacts, 'id_contact');

		activity.contacts = [];
		activity.connections = [];

		connectionsJoins.forEach(j=>{
			const foundContact = allContactHash[`${j.id_contact}`];
			if(foundContact){

			}
			const finalConnection = Object.assign({}, foundContact,
				{
					id_conection: j.id_conection,
					connection_type: j.connection_type,
					connection_record_type: j.connection_record_type,
					connection_vp_reference: j.connection_vp_reference,
					connection_notes: j.connection_notes,
				}
			);
			if(j.connection_record_type === 'main'){
				activity.contacts.push(finalConnection);
			} else {
				activity.connections.push(finalConnection);
			}
		})

		// GET ALL DEALS
		return supabase
			.from('activities_deals')
			.select('*')
			.eq('id_activity',id_activity)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		const dealIds = Array.isArray(data) ? data.map(d=>{
			return d.id_deal;
		}) : [];

		return supabase
			.from('deals')
			.select('*')
			.in('id_deal',dealIds)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		activity.deals = Array.isArray(data) ? data.map(d=>{
			const newD = Object.assign({},d);
			newD.date_deal = {
				date_deal_day:       d.date_deal_day,
				date_deal_month:     d.date_deal_month,
				date_deal_year:      d.date_deal_year,
				date_deal_timestamp: d.date_deal_timestamp,
			};
			delete newD.date_deal_day;
			delete newD.date_deal_month;
			delete newD.date_deal_year;
			delete newD.date_deal_timestamp;
			return newD;
		}) : [];

		// GET ALL FOLLOW-UPS
		return supabase
			.from('activities')
			.select('*')
			.eq('id_activity_fu',id_activity)
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		const { data, error } = r;
		activity.fus = Array.isArray(data) ? data.map(f=>{
			const newF = Object.assign({},f);
			newF.date_fu = {
				date_fu_day:       f.date_fu_day,
				date_fu_month:     f.date_fu_month,
				date_fu_year:      f.date_fu_year,
				date_fu_timestamp: f.date_fu_timestamp,
			};
			delete newF.date_fu_day;
			delete newF.date_fu_month;
			delete newF.date_fu_year;
			delete newF.date_fu_timestamp;
			return newF;
		}) : [];

		return res.status(200).json(activity);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.get('/', (req, res)=>{

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('activities')
			.select(`*,
				connections(
					id_contact
				)`)
			.not('date_convo_timestamp','is',null)
			.eq('id_agent', id_agent)
			.order('date_convo_timestamp')
	})
	.then(r=>{
		const { data, error } = r;
		if(Array.isArray(data)){
			data.forEach(c=>{
				if(Array.isArray(c.connections)){
					if(c.connections[0] && c.connections[0].id_contact){
						c.id_contact = c.connections[0].id_contact;
					}
					if(c.connections[1] && c.connections[1].id_contact){
						c.id_contact_2 = c.connections[1].id_contact;
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
	const activity = req.body;
	if(!isObjectLiteral(activity)){
		return res.status(500).json({error:'body is not an object'});
	}
	const activityToPut = formatActivityToPut(activity);
	
	const insertionPromises = formatInsertPromises(activityToPut, supabase);

	const {
		id_activity_temp,
		newActivityTempIdsHash,
		newContactTempIdsHash,
		newDealTempIdsHash } = activityToPut;

	const activityTempIds = Object.keys(newActivityTempIdsHash);
	const contactTempIds = Object.keys(newContactTempIdsHash);
  const dealTempIds = Object.keys(newDealTempIdsHash);

	let id_activity_final        = 0;
	let promisesResponses        = null;
	let activitiesResponses      = null;
	let followUpResponses        = null;
	let contactResponses         = null;
	let dealResponses            = null;
	let connectionsResponses     = null;
	let activitiesDealsResponses = null;
	let contactsDealsResponses   = null;

	let theActivity    = {};
	let getIdResponses = {};
	let finalActivity  = {};

	// @@@@@@@ INSERT ACTIVITIES, DEALS, CONTACTS @@@@@@@
	return Promise.all(insertionPromises)
		.then(r=>{
			promisesResponses = r;
			return;
		})
		// @@@@@@ GET ID OF ACTIVITY JUST INSERTED @@@@@@@@
		.then(()=>{
			return supabase
				.from('activities')
				.select('id_activity')
				.eq('id_activity_temp', id_activity_temp)
		})
		.then(r=>{
			activitiesResponses = r;
			if(Array.isArray(r.data)){
				if(r.data[0]){
					id_activity_final = r.data[0].id_activity;
				}
			}

			// @@@@@@ GET ID OF FOLLOW-UPS JUST INSERTED @@@@@@@@
			return supabase
				.from('activities')
				.select('id_activity, id_activity_temp')
				.in('id_activity_temp', activityTempIds)
		})
		.then(r=>{
			followUpResponses = r;

			// @@@@@@ GET ID OF CONTACTS JUST INSERTED @@@@@@@@
			return supabase
				.from('contacts')
				.select('id_contact, id_contact_temp')
				.in('id_contact_temp', contactTempIds)
		})
		.then(r=>{
			contactResponses = r;

		// @@@@@@ GET ID OF DEALS JUST INSERTED @@@@@@@@
			return supabase
				.from('deals')
				.select('id_deal, id_deal_temp')
				.in('id_deal_temp', dealTempIds)
		})
		.then(r=>{
			dealResponses = r;

			// @@@@@@ GET ID OF CONNECTIONS THIS ACTIVITY  @@@@@@@@
			return supabase
				.from('connections')
				.select('*')
				.eq('id_activity', id_activity_final)
		})
		.then(r=>{
			connectionsResponses = r;

			// @@@@@@ GET ID OF ACTIVITIES_DEALS THIS ACTIVITY  @@@@@@@@
			return supabase
				.from('activities_deals')
				.select('*')
				.eq('id_activity', id_activity_final)
		})
		.then(r=>{
			activitiesDealsResponses = r;

			// @@@@@@ GET ID OF CONTACTS_DEALS THIS ACTIVITY  @@@@@@@@
			return supabase
				.from('contacts_deals')
				.select('*')
				.eq('id_activity', id_activity_final)
		})
		.then(r=>{
			contactsDealsResponses = r;

			getIdResponses = {
				activityTempIds,
				contactTempIds,
				dealTempIds,
				id_activity_final,
				promisesResponses,
				activitiesResponses,
				followUpResponses,
				contactResponses,
				dealResponses,
				connectionsResponses,
				activitiesDealsResponses,
				contactsDealsResponses,
				contactsDealsResponses,
			};
			
			// UPDATE ALL PERMANENT IDS
			const updatePromises = formatUpdatePromises(getIdResponses, activityToPut, supabase);
	
			return Promise.all(updatePromises)
	
		})
		.then(()=>{
			// SELECT THE ACTIVITY (AND SAVE)
			return supabase
				.from('activities')
				.select('*')
				.eq('id_activity', id_activity_final);
		})
		.then(r=>{
			const { data, error } = r;
			if(Array.isArray(data)){
				if(isObjectLiteral(data[0])){
					theActivity = data[0];
				}
			}
			// SELECT FOLLOW-UP
			return supabase
				.from('activities')
				.select('*')
				.eq('id_activity_fu', id_activity_final);
		})
		.then(r=>{
			const { data, error } = r;
			if(Array.isArray(data)){
				theActivity.fus = data;
			} else {
				theActivity.fus = [];
			}
			// SELECT CONNECTIONS
			return supabase
				.from('connections')
				.select('*')
				.eq('id_activity', id_activity_final);
		})
		.then(r=>{
			const { data, error } = r;
			if(Array.isArray(data)){
				theActivity.tempPeople = data;
			} else {
				theActivity.tempPeople = [];
			}
			// SELECT DEAL_ACTIVITY
			return supabase
				.from('activities_deals')
				.select('*')
				.eq('id_activity', id_activity_final);
		})
		.then(r=>{
			const { data, error } = r;
			if(Array.isArray(data)){
				theActivity.tempDeals = data;
			} else {
				theActivity.tempDeals = [];
			}
			// PREP FOR DEALS & CONTACTS
			theActivity.tempPeopleIdHash = {};
			theActivity.tempPeople.forEach(c=>{
				theActivity.tempPeopleIdHash[`${c.id_contact}`] = true;
			});
			theActivity.tempPeopleIds = Object.keys(theActivity.tempPeopleIdHash).map(x=>parseInt(x,10));
			
			theActivity.tempDealIdHash = {};
			theActivity.tempDeals.forEach(c=>{
				theActivity.tempDealIdHash[`${c.id_deal}`] = true;
			});
			theActivity.tempDealIds = Object.keys(theActivity.tempDealIdHash).map(x=>parseInt(x,10));
			
			// SELECT CONTACTS
			return supabase
				.from('contacts')
				.select('*')
				.in('id_contact', theActivity.tempPeopleIds);
		})
		.then(r=>{
			const { data, error } = r;
			if(Array.isArray(data)){
				theActivity.tempFullPeopleHash = convertArrayToObject(data, 'id_contact');
			}
			// SELECT DEALS
			return supabase
				.from('deals')
				.select('*')
				.in('id_deal', theActivity.tempDealIds);
		})
		.then(r=>{
			const { data, error } = r;
			if(Array.isArray(data)){
				theActivity.tempDealsHash = convertArrayToObject(data, 'id_deal');
			}
			// FINALIZE CONTACTS AND CONNECTIONS
			theActivity.contacts = [];
			theActivity.connections = [];

			theActivity.tempPeople.forEach(c=>{
				const foundContact = theActivity.tempFullPeopleHash[`${c.id_contact}`];
				const fullContact = Object.assign({},c,foundContact);
				if(fullContact.connection_record_type === 'main'){
					theActivity.contacts.push(fullContact);
				} else {
					theActivity.connections.push(fullContact);
				}
			});

			// FINALIZE DEALS
			theActivity.deals = theActivity.tempDeals.map(d=>{
				const foundDeal = theActivity.tempDealsHash[`${d.id_deal}`];
				const fullDeal = Object.assign({},d,foundDeal);
				return fullDeal;
			});
			finalActivity = createFinalActivity(theActivity);

			return res.status(200).json(finalActivity);
		})
		.then(()=>{
			fs.writeFile(`sample-data/activity1-to-put.json`, JSON.stringify(activityToPut,null,2), function (err) {
				if (err) throw err;
			});
			fs.writeFile(`sample-data/activity2-get-ids.json`, JSON.stringify(getIdResponses,null,2), function (err) {
				if (err) throw err;
			});
			fs.writeFile(`sample-data/activity3-fetch-unedited.json`, JSON.stringify(theActivity,null,2), function (err) {
				if (err) throw err;
			});
			fs.writeFile(`sample-data/activity4-fetch.json`, JSON.stringify(finalActivity,null,2), function (err) {
				if (err) throw err;
			});
			return;
		})
		.catch(err => {
			console.error(err);
			return res.status(500).json(err);
		})
});

module.exports = {
	router,
};