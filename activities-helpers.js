'use strict';

const {addTime,
	convertIntegersToTimestamp, 
	isPrimitiveNumber,
	isObjectLiteral,
	hexToRgb } = require('conjunction-junction');

const getIdAgent = userContainer => {
	if(!userContainer){
		return 0;
	}
	const c = userContainer.contents || {};
	const a = c.agent || {};
	return a.id_agent || 0;
};

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

	date_convo: false, // object
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
  convo_type: true,
  convo_voice_note: true,
  convo_problem_solve: true,
  convo_notes: true,
  convo_deal_found: true,
	convo_outcome: true,

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
	id_vp_app: true,
};

const contactsFields = {
	id_contact: true,
	id_agent: true,
	id_contact_temp: true,
	id_who_introduced: true,
	id_vp_app: true,

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

const vpAppFields = {
	id_vp_app: false,
	id_agent: false,
	id_contact: false,
	vp_temp_id: false,
	vp_app_status: false, 

	vp_type: true,
	vp_name_business: true,
	vp_phone: true,
	vp_email: true,
	vp_url: true,
	vp_area: true,
	vp_contact_person: true,
	vp_review_url: true,
	vp_agree: true,
	vp_ref1: true,
	vp_ref2: true,
	vp_ref3: true,
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

	date_deal: false, // object
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
	dp_mindset: true,
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
};

const vpAppStatusHash = {
	'0': {editable: true,  color: '#f2b3bf', label: 'Not Sent', text: 'Please complete all fields, then click save.'},
	'1': {editable: true,  color: '#E6F2FF', label: 'Sent To Vendor', text: 'Please complete all fields, then click save.'},
	'2': {editable: true,  color: '#A4D2ED', label: 'Returned - Review Not Started Yet', text: 'Thank you for completing the application! We will start our review promptly and will be in touch with any questions. You may edit this application at the same link until our reveiw starts.'},
	'3': {editable: false, color: '#63B3DB', label: 'In Review', text: 'We have started our review, i.e. calling references. The application is no longer editable. Please contact us directly with any questions.'},
	'4': {editable: false, color: '#0083C0', label: 'Accepted / Active', text: 'Thank you for participating in our Vendor Partnership Program!'},
	'5': {editable: false, color: '#f77791', label: 'Not participating',  text: ''},
};

for(let k in vpAppStatusHash){
	const thisOne = vpAppStatusHash[k];
	const rgb = hexToRgb(thisOne.color);
	thisOne.luma = rgb.luma || 50;
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

const formatActivityPut = (activity, supabase) => {
	const id_activity_temp = activity.id_activity_temp;
	const id_activity = activity.id_activity;
	const id_agent = activity.id_agent;
	const activityHasId = !!id_activity;

	// console.log({activity})
	const activity4DB = {};
	const fus4DB = [];
	const contacts4DB = [];
	const contacts4DBTempIdHash = {}; 
	const deals4DB = [];
	const fus4DBTempIdHash = {};
	const deals4DBTempIdHash = {};

	// LIMIT FIELDS OF NEW ACTIVITY
	for(let k in activitiesFields){
		if(k === 'date_convo'){
			if(isObjectLiteral(activity[k])){
				const d = activity[k];
				activity4DB.date_convo_year = d.date_convo_year || null;
				activity4DB.date_convo_month = isPrimitiveNumber(d.date_convo_month) ? d.date_convo_month : null;
				activity4DB.date_convo_day = d.date_convo_day || null;
				activity4DB.date_convo_timestamp = d.date_convo_timestamp || null;
			}
		} else if(activity[k] !== null && activity[k] !== undefined && activity[k] !== ''){
			activity4DB[k] = activity[k];
		}
	}
	// console.log({activity4DB})
	// LIMIT KEYS OF FOLLOW-UPS AND PUSH TO ARRAY FOR DATABASE
	if(Array.isArray(activity.fus)){
		activity.fus.forEach(f=>{
			const newF = {};
			for(let k in activitiesFields){
				if(k === 'date_fu'){				
					if(isObjectLiteral(f[k])){
						const d = f[k];
						newF.date_fu_year = d.date_fu_year || null;
						newF.date_fu_month = isPrimitiveNumber(d.date_fu_month) ? d.date_fu_month : null;
						newF.date_fu_day = d.date_fu_day || null;
						newF.date_fu_timestamp = d.date_fu_timestamp || null;
					}
				} else if(f[k] !== null && f[k] !== undefined && f[k] !== ''){
					newF[k] = f[k];
				}
			}
			newF.id_agent = id_agent;
			if(activityHasId){
				newF.id_activity_fu = id_activity;
			}
			fus4DB.push(newF);
			if(newF.id_activity_temp){
				fus4DBTempIdHash[newF.id_activity_temp] = true;
			}
		});
	}

	if(Array.isArray(activity.contacts)){
		activity.contacts.forEach(c=>{
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
			contacts4DB.push(newC);
			// console.log({newC})
			contacts4DBTempIdHash[c.id_contact_temp] = {
				id_contact_temp: c.id_contact_temp,
				id_connection: c.id_connection || null,
				connection_record_type: c.connection_record_type || null,
				id_vp_app: c.id_vp_app || null,
			};
		});
	}

	if(Array.isArray(activity.connections)){
		// console.log({connections})
		activity.connections.forEach(c=>{
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
			if(activityHasId){
				newC.id_activity = id_activity;
			}
			contacts4DB.push(newC);
			// console.log({newC})
			contacts4DBTempIdHash[c.id_contact_temp] = {
				id_contact_temp: c.id_contact_temp,
				id_connection: c.id_connection || null,
				connection_record_type: c.connection_record_type || null,
				connection_vp_reference: c.connection_vp_reference || null,
				connection_notes: c.connection_notes || null,
				connection_type: c.connection_type || null,
				id_vp_app: c.id_vp_app || null,
			};
		});
	}
	
	if(Array.isArray(activity.deals)){
		activity.deals.forEach(c=>{
			const newD = {};
			for(let k in dealsFields){
				if(k === 'date_deal'){
					if(isObjectLiteral(c[k])){
						const d = c[k];
						newD.date_deal_year = d.date_deal_year || null;
						newD.date_deal_month = isPrimitiveNumber(d.date_deal_month) ? d.date_deal_month : null;
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
			deals4DB.push(newD);
			if(newD.id_deal_temp){
				deals4DBTempIdHash[newD.id_deal_temp] = true;
			}
		});
	}

	// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

	const activityPromises = [activity4DB, ...fus4DB].map(x=>{
		// console.log('convo_outcome',x.convo_outcome)
		const id_activity = x.id_activity;
		delete x.id_activity;
		if(id_activity){
			return new Promise(resolve=>{
				resolve(
					supabase
					.from('activities')
					.update(x)
					.eq('id_activity', id_activity)
				);
			});
		} else {
			return new Promise(resolve=>{
				resolve(
					supabase
					.from('activities')
					.insert(x)
				);
			});
		}
	});

	const contactPromises = contacts4DB.map(x=>{
		const id_contact = x.id_contact;
		delete x.id_contact;
		if(id_contact){
			// console.log('update',cForDb)
			return new Promise(resolve=>{
				resolve(
					supabase
					.from('contacts')
					.update(x)
					.eq('id_contact', id_contact)
				);
			});
		} else {
			// console.log('insert',cForDb)
			return new Promise(resolve=>{
				resolve(
					supabase
					.from('contacts')
					.insert(x)
				);
			});
		}
	});

	const dealPromises = deals4DB.map(x=>{
		const id_deal = x.id_deal;
		delete x.id_deal;
		// console.log({id_deal, dForDb});
		if(id_deal){
			// console.log('update',dForDb)
			return new Promise(resolve=>{
				resolve(
					supabase
					.from('deals')
					.update(x)
					.eq('id_deal', id_deal)
				);
			});
		} else {
			// console.log('insert',dForDb)
			return new Promise(resolve=>{
				resolve(
					supabase
					.from('deals')
					.insert(x)
				);
			});
		}
	});

	const fus4DBTempIds = Object.keys(fus4DBTempIdHash);
	const contacts4DBTempIds = Object.keys(contacts4DBTempIdHash);
  const deals4DBTempIds = Object.keys(deals4DBTempIdHash);

	return {
		fus4DBTempIds,
		contacts4DBTempIdHash,
		contacts4DBTempIds,
		deals4DBTempIds,
		id_activity_temp,
		id_activity,
		insertionPromises: [
			...activityPromises, 
			...contactPromises,
			...dealPromises
		],
	};
};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

const formatUpdatePromises = (getIdResponses, contacts4DBTempIdHash, id_agent, supabase) => {

	const {
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
	} = getIdResponses;

	
	// hash of all id_contacts that already have a connection (don't duplicate)
	const connectionsResponsesHash = {}
	connectionsResponses.forEach(c=>{
		connectionsResponsesHash[`${c.id_contact}`] = true;
	});

	// console.log({connnectionsResponses, connectionsResponsesHash})

	// hash of all id_deals that already have a activities_deals (don't duplicate)
	const activitiesDealsResponsesHash = {}
	activitiesDealsResponses.forEach(c=>{
		activitiesDealsResponsesHash[`${c.id_deal}`] = true;
	});
	// console.log({activitiesDealsResponsesHash,activitiesDealsResponsesHash});

	// hash of all contacts_deals that already have a contacts_deals (don't duplicate)
	const contactsDealsResponsesHash = {}
	contactsDealsResponses.forEach(c=>{
		contactsDealsResponsesHash[`${c.id_contact}`] = c.id_deal;
	});

	const updatePromises = [];

	// @@@@@@@@ LINK FOLLOW-UPS TO ORIGINATING ACTIVITY @@@@@@@@@	
	// fuResponses = {id_activity, id_activity_temp} where id_activity_temp in fus4DBTempIds
	// ie fuRespones = ids of fus (only fus, not main activity)
	fuResponses.forEach(x=>{
		updatePromises.push(new Promise(resolve=>{
			resolve(
				supabase
				.from('activities')
				.update({id_activity_fu:   id_activity_final})
				.eq(    'id_activity_temp', x.id_activity_temp)
				)
			})
		);
	});

	// contactResponses = {id_contact, id_contact_temp} where id_contact_temp in contacts4DBTempIds
	// ie contactResponses = ids of ALL contacts associated with this activity (main or connections)	
	contactResponses.forEach(x=>{
		// @@@@@@@@ LINK FOLLOW-UPS TO CONTACTS @@@@@@@@@	
		updatePromises.push(new Promise(resolve=>{
			resolve(
				supabase
				.from('activities')
				.update({id_contact_fu:       x.id_contact})
				.eq(    'id_contact_fu_temp', x.id_contact_temp)
				)
			})
		);
		// @@@@@@@@ CREATE CONNECTIONS @@@@@@@@@	
		// if no existing connection is in DB
		if(!connectionsResponsesHash[`${x.id_contact}`]){
			const thisConnection = contacts4DBTempIdHash[x.id_contact_temp] || {};
			const connection = {
				id_activity: id_activity_final,
				id_contact: x.id_contact,
				id_agent,
				connection_record_type: thisConnection.connection_record_type || 'connection', // default to something...
				connection_vp_reference: thisConnection.connection_vp_reference || null,
				connection_notes: thisConnection.connection_notes || null,
				connection_type: thisConnection.connection_type || null,
				id_vp_app: thisConnection.id_vp_app || null,
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

	// dealResponses={id_deal, id_deal_temp} where id_deal_temp in deals4DBTempIds
	// ie dealResponses =  
	dealResponses.forEach(d=>{
		// @@@@@@@@ LINK FOLLOW-UPS TO DEALS @@@@@@@@@	
		updatePromises.push(new Promise(resolve=>{
			resolve(
				supabase
				.from('activities')
				.update({id_deal_fu:       d.id_deal})
				.eq(    'id_deal_fu_temp', d.id_deal_temp)
				)
			})
		);
		// @@@@@@@@ CREATE ACTIVITIES_DEALS @@@@@@@@@	
		if(!activitiesDealsResponsesHash[`${d.id_deal}`]){
			const activityDeal = {
				id_agent,
				id_activity: id_activity_final,
				id_deal: d.id_deal,
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

		contactResponses.forEach(c=>{
			const contactsDealExists = contactsDealsResponsesHash[`${c.id_contact}`] === d.id_deal;
			const thisConnection = contacts4DBTempIdHash[`${c.id_contact_temp}`] || {};
			const contactsDealShouldExist = thisConnection.connection_record_type === 'main';
			if(contactsDealShouldExist && !contactsDealExists){
				const contactDeal = {
					id_agent,
					id_contact: c.id_contact,
					id_deal: d.id_deal,
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
	getIdAgent,
	formatActivityPut,
	formatUpdatePromises,
	createFinalActivity,
	agentsFields,
	activitiesFields,
	connectionsFields,
	contactsFields,
	contactsDealsFields,
	vpAppFields,
	dealsFields,
	activitiesDealsFields,
	coreValuesFields,
	dailyPlansFields,
	proformaeFields,
	vpAppStatusHash,
};