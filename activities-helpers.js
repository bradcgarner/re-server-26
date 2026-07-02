'use strict';

const {addTime,
	convertIntegersToTimestamp, isPrimitiveNumber } = require('conjunction-junction');
const { isObjectLiteral } = require('conjunction-junction/build/basic');

let id_agent = 1;

const agentsFields = {
	agent_name_first: true,
	agent_name_last: true,
	agent_email: true,
	agent_password: true,
	agent_permissions: true,
};

const activitiesFields = {
	id_activity: true,
	id_activity_temp: true,
	id_agent: true,

	date_convo: true, // object
	date_convo_year: true,
	date_convo_month: true,
	date_convo_day: true,
	date_convo_timestamp: true,

  convo_relationship: true,
  convo_main_purpose: true,
  convo_method: true,
  convo_tone: true,
  convo_model: true,
  convo_intentional: true,
  convo_intentional_binary: true,
  convo_type: true,
  convo_voice_note: true,
  convo_problem_solve: true,
  convo_notes: true,
  convo_deal_found: true,

	date_fu: true,
	date_fu_year: true,
	date_fu_month: true,
	date_fu_day: true,
	date_fu_timestamp: true,

	id_activity_fu: true,
	id_deal_fu: true,
	id_contact_fu: true,

	id_contact_fu_temp: true,
	id_who_introduced_temp: true,
	id_deal_fu_temp: true,

	fu_purpose: true,
	fu_notes: true,
};

const connectionsFields = {
	id_connection: true,
	id_agent: true,
	id_contact: true,
	id_activity: true,
	
	connection_type: true,
	connection_record_type: true,
	connection_vp_reference: true,
	connection_notes: true,
};

const contactsFields = {
	id_contact: true,
	id_agent: true,
	id_contact_temp: true,
	id_who_introduced: true,

	contact_vp_status: true,
	contact_how_met: true,
	contact_where_met: true,
	contact_where_met_notes: true,
	contact_notes: true,
	contact_vp_categories: true,
	contact_name_first: true,
	contact_name_last: true,
	contact_phone: true,
	contact_email: true,
	contact_company: true,
	contact_title: true,
	contact_tags: true,
	contact_address_street: true,
	contact_address_city: true,
	contact_address_state: true,
	contact_address_zip: true,
	contact_birth_month: true,
	contact_birth_day: true,
	contact_birth_year: true,
};

const contactsDealsFields = {
	id_ad: true,
	id_agent: true,
	id_contact: true,
	id_deal: true,
};

const dealsFields = {
	id_deal: true,
	id_agent: true,
	id_who_introduced: true,
	id_deal_temp: true,
	
	deal_name: true,
	deal_address: true,
	deal_how_found: true,
	deal_how_found_categ: true,
	deal_trigger: true,
	deal_type: true,
	deal_stage: true,
	deal_timeline_stated: true,
	deal_timeline_status: true,
	deal_notes: true,

	deal_value: true,
	deal_value_status: true,
	deal_commission_rate: true,
	deal_gci: true,

	date_deal: true, // object
	date_deal_year: true,
	date_deal_month: true,
	date_deal_day: true,
	date_deal_timestamp: true,
};

const activitiesDealsFields = {
	id_ad: true,
	id_agent: true,
	id_activity: true,
	id_deal: true,
};

const coreValuesFields = {
	id_cv: true,
	id_agent: true,
	cv_label: true,
	cv_notes: true,
	cv_color: true,
};

const dailyPlansFields = {
	id_dp: true,
	id_agent: true,
	date_dp_year: true,
	date_dp_month: true,
	date_dp_day: true,
	date_dp_timestamp: true,
	dp_cv_1: true,
	dp_cv_2: true,
	dp_cv_3: true,
	dp_cv_1_rank: true,
	dp_cv_2_rank: true,
	dp_cv_3_rank: true,
	dp_future_self: true,
	dp_convo_enter: true,
	dp_convo_recap: true,
	dp_contacts_entered: true,
	dp_fu_review: true,
	dp_calendar: true,
	dp_yesterday_status: true,
	dp_yesterday_notes: true,
	dp_convo_goal: true,
	dp_vp_seeking: true,
	dp_talk_plan: true,
	dp_svc_priority: true,
	dp_stabilize_plan: true,
	dp_white_space: true,
};

const proformaeFields = {
	id_pf: true,
	id_agent: true,
	
	pf_sale_price: true,
	pf_gci_pct: true,
	pf_gci_unit: true,
	pf_units_year: true,
	pf_gci_year: true,
	pf_fees_year: true,
	pf_fees_unit: true,
	pf_broker_cap: true,
	pf_expenses_year: true,
	pf_cost_year: true,
	pf_profit_year: true,
	pf_tax_rate: true,
	pf_income_year: true,
	pf_income_month: true,

	pf_close_pct: true,
	pf_units_year_rev: true,
	pf_this_year_pct: true,
	pf_units_year_rev2: true,
	
	pf_convo_deal: true,
	pf_convo_deal_calc: true,
	pf_convo_year: true,
	pf_work_weeks: true,
	pf_work_days_week: true,
	pf_work_days_year: true,
	pf_convo_day: true,
	pf_convo_week: true,
	pf_convo_month: true,

	pf_deals_week: true,
	pf_deals_month: true,
}

const isAValidId = num => {
	if(Number.isInteger(num)){
		if(num > 0){
			return true;
		}
	}
	return false;
}

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

const formatActivityToPut = activity => {
	const id_activity_temp = activity.id_activity_temp;
	const id_activity = activity.id_activity;
	const id_agent = activity.id_agent;
	const hasId = !!id_activity;

	const newActivity = {};
	for(let k in activitiesFields){
		if(k === 'date_convo'){
			if(isObjectLiteral(activity[k])){
				const d = activity[k];
				newActivity.date_convo_year = d.date_convo_year || null;
				newActivity.date_convo_month = d.date_convo_month || null;
				newActivity.date_convo_day = d.date_convo_day || null;
				newActivity.date_convo_timestamp = d.date_convo_timestamp || null;
			}
		} else if(activity[k] !== null && activity[k] !== undefined && activity[k] !== ''){
			newActivity[k] = activity[k];
		}
	}

	const newActivities = [newActivity];
	const followUps = Array.isArray(activity.fus) ? activity.fus : [];
	followUps.forEach(f=>{
		const newF = {};
		for(let k in activitiesFields){
			if(k === 'date_fu'){				
				if(isObjectLiteral(f[k])){
					const d = f[k];
					newF.date_fu_year = d.date_fu_year || null;
					newF.date_fu_month = d.date_fu_month || null;
					newF.date_fu_day = d.date_fu_day || null;
					newF.date_fu_timestamp = d.date_fu_timestamp || null;
				}
			} else if(f[k] !== null && f[k] !== undefined && f[k] !== ''){
				newF[k] = f[k];
			}
		}
		newF.id_agent = id_agent;
		if(hasId){
			newF.id_activity = id_activity;
		}
		newActivities.push(newF);
	});

	const newContacts = [];
	const connectionsHash = {};
	const contacts = Array.isArray(activity.contacts) ? activity.contacts : [];
	contacts.forEach(c=>{
		const newC = {};
		for(let k in contactsFields){
			 if(c[k] !== null && c[k] !== undefined && c[k] !== ''){
				if(k === 'contact_vp_categories' && typeof c[k] === 'string'){
					newC[k] = c[k].split(',').map(t=>t.trim());
				} else {
					newC[k] = c[k];
				}
			}
		}
		if(!isAValidId(newC.id_contact)){
			delete newC.id_contact;
		}
		newC.id_agent = id_agent;
		if(hasId){
			newC.id_activity = id_activity;
		}
		newContacts.push(newC);
		// @@@@@@@@ Populate connectionsHash
		connectionsHash[c.id_contact_temp] = {
			id_contact_temp: c.id_contact_temp,
			connection_record_type: c.connection_record_type,
		};
	});
	const connections = Array.isArray(activity.connections) ? activity.connections : [];
	connections.forEach(c=>{
		const newC = {};
		for(let k in contactsFields){
			 if(c[k] !== null && c[k] !== undefined && c[k] !== ''){
				if(k === 'contact_vp_categories' && typeof c[k] === 'string'){
					newC[k] = c[k].split(',').map(t=>t.trim());
				} else {
					newC[k] = c[k];
				}
			}
		}
		if(!isAValidId(newC.id_contact)){
			delete newC.id_contact;
		}
		newC.id_agent = id_agent;
		if(hasId){
			newC.id_activity = id_activity;
		}
		newContacts.push(newC);
		// @@@@@@@@ Populate connectionsHash
		connectionsHash[c.id_contact_temp] = {
			id_contact_temp: c.id_contact_temp,
			connection_record_type: c.connection_record_type,
			connection_vp_reference: c.connection_vp_reference,
			connection_notes: c.connection_notes,
			connection_type: c.connection_type,
		};
	});
	

	const newDeals = [];
	const deals = Array.isArray(activity.deals) ? activity.deals : [];
	deals.forEach(c=>{
		const newD = {};
		for(let k in dealsFields){
			if(k === 'date_deal'){
				if(isObjectLiteral(c[k])){
					const d = c[k];
					newD.date_deal_year = d.date_deal_year || null;
					newD.date_deal_month = d.date_deal_month || null;
					newD.date_deal_day = d.date_deal_day || null;
					newD.date_deal_timestamp = d.date_deal_timestamp || null;
				}
			} else if(c[k] !== null && c[k] !== undefined && c[k] !== ''){
				newD[k] = c[k];
			}
		}
		if(!isAValidId(newD.id_deal)){
			delete newD.id_deal;
		}
		newD.id_agent = id_agent;
		if(hasId){
			newD.id_activity = id_activity;
		}
		newDeals.push(newD);
	});
	const newActivityTempIdsHash = {};
	const newContactTempIdsHash = {};
	const newDealTempIdsHash = {};
	newActivities.forEach(a=>{
		if(a.id_activity_temp && a.id_activity_temp !== id_activity_temp){
			newActivityTempIdsHash[a.id_activity_temp] = true;
		}
	});
	newContacts.forEach(c=>{
		if(c.id_contact_temp){
			newContactTempIdsHash[c.id_contact_temp] = true;
		}
	});
	newDeals.forEach(d=>{
		if(d.id_deal_temp){
			newDealTempIdsHash[d.id_deal_temp] = true;
		}
	});

	return {
		newActivities,
		newContacts,
		newDeals,
		id_activity_temp,
		id_activity,
		connectionsHash,
		newActivityTempIdsHash,
		newContactTempIdsHash,
		newDealTempIdsHash,
	};

};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

const formatInsertPromises = (activityToPut, supabase) => {
	const newActivities = Array.isArray(activityToPut.newActivities) ? activityToPut.newActivities : [];
	const newContacts = Array.isArray(activityToPut.newContacts) ? activityToPut.newContacts : [];
	const newDeals = Array.isArray(activityToPut.newDeals) ? activityToPut.newDeals : [];

	const activityPromises = newActivities.map(x=>{
		if(x.id_activity){
			return new Promise(resolve=>{
				resolve(
					supabase
					.from('activities')
					.update(x)
					.eq('id_activity', x.id_activity)
				);
			});
		}
		return new Promise(resolve=>{
			resolve(
				supabase
				.from('activities')
				.insert(x)
			);
		});
	});

	const contactPromises = newContacts.map(x=>{
		if(x.id_contact){
			return new Promise(resolve=>{
				resolve(
					supabase
					.from('contacts')
					.update(x)
					.eq('id_contact', x.id_contact)
				);
			});
		}
		return new Promise(resolve=>{
			resolve(
				supabase
				.from('contacts')
				.insert(x)
			);
		});
	});

	const dealPromises = newDeals.map(x=>{
		if(x.id_deal){
			return new Promise(resolve=>{
				resolve(
					supabase
					.from('deals')
					.update(x)
					.eq('id_deal', x.id_deal)
				);
			});
		}
		return new Promise(resolve=>{
			resolve(
				supabase
				.from('deals')
				.insert(x)
			);
		});
	});

	return [
		...activityPromises, 
		...contactPromises,
		...dealPromises];
};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

const formatUpdatePromises = (getIdResponses, sampleToPut, supabase) => {

	const {
		id_activity_final,
		followUpResponses,
		contactResponses,
		dealResponses,
		connectionsResponses,
		activitiesDealsResponses,
		contactsDealsResponses,
	} = getIdResponses;

	const followUpResponsesArr        = Array.isArray(followUpResponses.data)        ? followUpResponses.data        : [];
	const contactResponsesArr         = Array.isArray(contactResponses.data)         ? contactResponses.data         : [];
	const dealResponsesArr            = Array.isArray(dealResponses.data)            ? dealResponses.data            : [];
	const connnectionsResponsesArr    = Array.isArray(connectionsResponses.data)     ? connectionsResponses.data     : [];
	const activitiesDealsResponsesArr = Array.isArray(activitiesDealsResponses.data) ? activitiesDealsResponses.data : [];
	const contactsDealsResponsesArr   = Array.isArray(contactsDealsResponses.data)   ? contactsDealsResponses.data : [];
	
	// hash of all id_contacts that already have a connection (don't duplicate)
	const connectionsResponsesHash = {}
	connnectionsResponsesArr.forEach(c=>{
		connectionsResponsesHash[`${c.id_contact}`] = true;
	});

	// hash of all id_deals that already have a activities_deals (don't duplicate)
	const activitiesDealsResponsesHash = {}
	connnectionsResponsesArr.forEach(c=>{
		activitiesDealsResponsesHash[`${c.id_deal}`] = true;
	});

	// hash of all contacts_deals that already have a contacts_deals (don't duplicate)
	const contactsDealsResponsesHash = {}
	contactsDealsResponsesArr.forEach(c=>{
		contactsDealsResponsesHash[`${c.id_contact}`] = c.id_deal;
	});

	const updatePromises = [];

	// @@@@@@@@ LINK FOLLOW-UPS TO ORIGINATING ACTIVITY @@@@@@@@@	
	followUpResponsesArr.forEach(x=>{
		updatePromises.push(new Promise(resolve=>{
			resolve(
				supabase
				.from('activities')
				.update({id_activity_fu: id_activity_final})
				.eq('id_activity', x.id_activity)
				)
			})
		);
	});

	contactResponsesArr.forEach(x=>{
		// @@@@@@@@ LINK FOLLOW-UPS TO CONTACTS @@@@@@@@@	
		updatePromises.push(new Promise(resolve=>{
			resolve(
				supabase
				.from('activities')
				.update({id_contact_fu: x.id_contact})
				.eq('id_contact_fu_temp', x.id_contact_temp)
				)
			})
		);
		// @@@@@@@@ CREATE CONNECTIONS @@@@@@@@@	
		if(!connectionsResponsesHash[`$[x.id_contact]`]){
			const connectionsHash = sampleToPut.connectionsHash || {};
			const thisConnection = connectionsHash[x.id_contact_temp] || {};
			const connection = {
				id_activity: id_activity_final,
				id_contact: x.id_contact,
				id_agent,
				connection_record_type: thisConnection.connection_record_type || 'connection', // default to something...
				connection_vp_reference: thisConnection.connection_vp_reference || null,
				connection_notes: thisConnection.connection_notes || null,
				connection_type: thisConnection.connection_type || null,
			};
			updatePromises.push(new Promise(resolve=>{
				resolve(
					supabase
					.from('connections')
					.insert(connection)
					)
				})
			);
		}
	});

	dealResponsesArr.forEach(x=>{
		// @@@@@@@@ LINK FOLLOW-UPS TO DEALS @@@@@@@@@	
		updatePromises.push(new Promise(resolve=>{
			resolve(
				supabase
				.from('activities')
				.update({id_deal_fu: x.id_deal})
				.eq('id_deal_fu_temp', x.id_deal_temp)
				)
			})
		);
		// @@@@@@@@ CREATE ACTIVITIES_DEALS @@@@@@@@@	
		if(!activitiesDealsResponsesHash[`${x.id_deal}`]){
			const activityDeal = {
				id_agent,
				id_activity: id_activity_final,
				id_deal: x.id_deal,
			};
			updatePromises.push(new Promise(resolve=>{
				resolve(
					supabase
					.from('activities_deals')
					.insert(activityDeal)
					)
				})
			);
		}
		// @@@@@@@@ CREATE CONTACTS_DEALS @@@@@@@@@	

		contactResponsesArr.forEach(c=>{
			const contactsDealExists = contactsDealsResponsesHash[`${c.id_contact}`] === x.id_deal;
			const isMain = typeof c.id_contact_temp === 'string' && c.id_contact_temp.includes('main');
			if(isMain && !contactsDealsFields){
				const contactDeal = {
					id_agent,
					id_contact: c.id_contact,
					id_deal: x.id_deal,
				};
				updatePromises.push(new Promise(resolve=>{
					resolve(
						supabase
						.from('contacts_deals')
						.insert(contactDeal)
						)
					})
				);
			}
		})
	});

	return updatePromises;

};

const createFinalActivity = theActivity => {
	const finalActivity = JSON.parse(JSON.stringify(theActivity));
	// DELETE TEMP KEYS
	delete finalActivity.tempPeople;
	delete finalActivity.tempDeals;
	delete finalActivity.tempPeopleIdHash;
	delete finalActivity.tempPeopleIds;
	delete finalActivity.tempDealIdHash;
	delete finalActivity.tempDealIds;
	delete finalActivity.tempFullPeopleHash;
	delete finalActivity.tempDealsHash;

	// NEST DATES IN ACTIVITY
	finalActivity.date_convo = {
		date_convo_day:       finalActivity.date_convo_day,
		date_convo_month:     finalActivity.date_convo_month,
		date_convo_year:      finalActivity.date_convo_year,
		date_convo_timestamp: finalActivity.date_convo_timestamp,
	};
	delete finalActivity.date_convo_day;
	delete finalActivity.date_convo_month;
	delete finalActivity.date_convo_year;
	delete finalActivity.date_convo_timestamp;

	finalActivity.date_fu = {
		date_fu_day:       finalActivity.date_fu_day,
		date_fu_month:     finalActivity.date_fu_month,
		date_fu_year:      finalActivity.date_fu_year,
		date_fu_timestamp: finalActivity.date_fu_timestamp,
	};
	delete finalActivity.date_fu_day;
	delete finalActivity.date_fu_month;
	delete finalActivity.date_fu_year;
	delete finalActivity.date_fu_timestamp;

	// NEST DATES IN FOLLOW-UPS
	finalActivity.fus.forEach(f=>{
		f.date_convo = {
			date_convo_day:       f.date_convo_day,
			date_convo_month:     f.date_convo_month,
			date_convo_year:      f.date_convo_year,
			date_convo_timestamp: f.date_convo_timestamp,
		};
		delete f.date_convo_day;
		delete f.date_convo_month;
		delete f.date_convo_year;
		delete f.date_convo_timestamp;

		f.date_fu = {
			date_fu_day:       f.date_fu_day,
			date_fu_month:     f.date_fu_month,
			date_fu_year:      f.date_fu_year,
			date_fu_timestamp: f.date_fu_timestamp,
		};
		delete f.date_fu_day;
		delete f.date_fu_month;
		delete f.date_fu_year;
		delete f.date_fu_timestamp;
	});

	// NEST DATES IN DEALS
	finalActivity.deals.forEach(f=>{
		f.date_deal = {
			date_deal_day:       f.date_deal_day,
			date_deal_month:     f.date_deal_month,
			date_deal_year:      f.date_deal_year,
			date_deal_timestamp: f.date_deal_timestamp,
		};
		delete f.date_deal_day;
		delete f.date_deal_month;
		delete f.date_deal_year;
		delete f.date_deal_timestamp;
	});
	return finalActivity;
};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
module.exports = {
	formatActivityToPut,
	formatInsertPromises,
	formatUpdatePromises,
	createFinalActivity,
	agentsFields,
	activitiesFields,
	connectionsFields,
	contactsFields,
	contactsDealsFields,
	dealsFields,
	activitiesDealsFields,
	coreValuesFields,
	dailyPlansFields,
	proformaeFields,
};