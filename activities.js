const express               = require('express');
const router                = express.Router();
const fs = require('fs');
router.use(express.json());

const { 
	isObjectLiteral, 
	convertArrayToObject } = require('conjunction-junction');

const { getIdAgent,
	formatActivityPut,
	formatUpdatePromises, 
	createFinalActivity } = require('./activities-helpers');

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { jwtStrategy } = require('./auth');
const { isPrimitiveNumber } = require('conjunction-junction/build/basic');
const userContainer = {};
router.use((req, res, next)=>jwtStrategy(req, res, next, userContainer));


router.get('/follow-ups', (req, res)=>{
	const id_agent = getIdAgent(userContainer);

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
				fu_purpose, fu_notes`)
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

const getActivityById = (id_activity, res) => {
	
	const id_agent = getIdAgent(userContainer);

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
		// console.log('from db', {activity})
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
		// console.log({connectionsJoins});
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
			const finalConnection = Object.assign({}, foundContact,
				{
					id_connection: j.id_connection,
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
		});
		// console.log({contacts: activity.contacts})

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
};

router.get('/:id_activity', (req, res)=>{
  const id_activity = req.params.id_activity;
  if(!id_activity) throw { message: 'invalid id_activity' };

	return getActivityById(id_activity, res);

});

router.get('/', (req, res)=>{
	const id_agent = getIdAgent(userContainer);

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
			.order('date_convo_timestamp', {ascending: false})
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
	const id_agent = getIdAgent(userContainer);
	
	const activity = req.body;
	if(!isObjectLiteral(activity)){
		return res.status(500).json({error:'body is not an object'});
	}
	const {
		fus4DBTempIds,
		contacts4DBTempIdHash,
		contacts4DBTempIds,
		deals4DBTempIds,
		id_activity_temp,
		id_activity,
		insertionPromises,
	} = formatActivityPut(activity, supabase);

	let id_activity_final        = activity.id_activity || 0;
	let fuResponses              = [];
	let contactResponses         = [];
	let dealResponses            = [];
	let connectionsResponses     = [];
	let activitiesDealsResponses = [];
	let contactsDealsResponses   = [];

	// @@@@@@@ INSERT ACTIVITIES, DEALS, CONTACTS @@@@@@@
	return Promise.all(insertionPromises)
		.then(r=>{
			// if(Array.isArray(r)){
			// 	r.forEach((p,i)=>{
			// 		if(p.error){ 
			// 			console.log(`ERROR 1 @ ${i}`, p.error) 
			// 		} else {
			// 			console.log(`INSERT 1 @ ${i}`, p.data)
			// 		}
			// 	})
			// }
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
			// if(r.error){ console.log('ERROR 3', r.error) }
			if(Array.isArray(r.data)){
				if(!id_activity_final && r.data[0]){
					id_activity_final = r.data[0].id_activity;
				}
			}

			// @@@@@@ GET ID OF FOLLOW-UPS JUST INSERTED @@@@@@@@
			return supabase
				.from('activities')
				.select('id_activity, id_activity_temp')
				.in('id_activity_temp', fus4DBTempIds)
		})
		.then(r=>{
			// if(r.error){ console.log('ERROR 4', r.error) }
			fuResponses = Array.isArray(r.data) ? r.data : [] ;

			// @@@@@@ GET ID OF CONTACTS JUST INSERTED @@@@@@@@
			return supabase
				.from('contacts')
				.select('id_contact, id_contact_temp')
				.in('id_contact_temp', contacts4DBTempIds)
		})
		.then(r=>{
			// if(r.error){ console.log('ERROR 5', r.error) }
			contactResponses = Array.isArray(r.data) ? r.data : [] ;

		// @@@@@@ GET ID OF DEALS JUST INSERTED @@@@@@@@
			return supabase
				.from('deals')
				.select('id_deal, id_deal_temp')
				.in('id_deal_temp', deals4DBTempIds)
		})
		.then(r=>{
			// if(r.error){ console.log('ERROR 6', r.error) }
			dealResponses = Array.isArray(r.data) ? r.data : [] ;

			// @@@@@@ GET ID OF CONNECTIONS THIS ACTIVITY  @@@@@@@@
			return supabase
				.from('connections')
				.select('*')
				.eq('id_activity', id_activity_final)
		})
		.then(r=>{
			// if(r.error){ console.log('ERROR 7', r.error) }
			connectionsResponses = Array.isArray(r.data) ? r.data : [] ;

			// @@@@@@ GET ID OF ACTIVITIES_DEALS THIS ACTIVITY  @@@@@@@@
			return supabase
				.from('activities_deals')
				.select('*')
				.eq('id_activity', id_activity_final)
		})
		.then(r=>{
			// if(r.error){ console.log('ERROR 8', r.error) }
			activitiesDealsResponses = Array.isArray(r.data) ? r.data : [] ;

			// @@@@@@ GET ID OF CONTACTS_DEALS THIS ACTIVITY  @@@@@@@@
			// CHANGE THIS TO LOOK FOR CONTACTS... AND TO LOOK FOR DEALS...
			return supabase
				.from('contacts_deals')
				.select('*')
				// .eq('id_activity', id_activity_final)
		})
		.then(r=>{
			// if(r.error){ console.log('ERROR 9', r.error) }
			contactsDealsResponses = Array.isArray(r.data) ? r.data : [] ;

			const getIdResponses = {
				id_activity_final,

				fus4DBTempIds,
				contacts4DBTempIds,
				deals4DBTempIds,

				fuResponses,
				contactResponses,
				dealResponses,
				connectionsResponses,
				activitiesDealsResponses,
				contactsDealsResponses,
			};
			
			// UPDATE ALL PERMANENT IDS
			const updatePromises = formatUpdatePromises(getIdResponses, contacts4DBTempIdHash, id_agent, supabase);
	
			return Promise.all(updatePromises)
				.then(r=>{
					// if(Array.isArray(r)){
					// 	r.forEach(x=>{
					// 		console.log(x);
					// 	})
					// }
			 		// SELECT THE ACTIVITY (AND SAVE)
					return getActivityById(id_activity_final, res);
				})
		})
		.catch(err => {
			console.error(err);
			return res.status(500).json(err);
		})
});

module.exports = {
	router,
};