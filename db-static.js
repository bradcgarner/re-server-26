'use strict';

const { hexToRgb } = require('conjunction-junction');

const vlStatic = {
	convoDealFoundUpdate: 75,
	convoDealFoundNoAsk: 77,

	convoPurposeVPRefCheck: 34,
	convoPurposeVPAppFU: 31,
	convoPurposeVPReferral: 228,
	convoPurposeVPCheckIn: 36,

	convoModelVPRefCheck: 225,
	convoModelVPReferral: 229,
	convoModelNone: 57,

	convoRelVPRefCheck: 4,

	convoToneCasual: 40,
	convoToneProfessional: 41,

	convoTypeLeadGen: 166,
	convoTypeLeadFU: 167,

	convoIntentional: 168,
	convoNotIntentional: 169,

	convoMethodEmail: 25,
	convoRelationVP: 3,

	convoVoiceNoteNone: 144,

	convoProblemSolveVP: 59,
	convoProblemSolveNone: 61,

	rankingOK: 179,

	contactWhereMetVPRef: 227,
	
	contactHowMetVPRef: 14,

	connTypeVPRef: 159,

	contactVPStatusNo: 170,
	contactVPStatusYes: 189,
};
const convoDealFoundHash = {
	'73': 'new',
	'74': 'new',
	'75': 'update',
};
const commissionHash = {
	'136': 0.035,
	'137': 0.03,
	'138': 0.025,
	'139': 0.02,
	'140': 0.015,
	'141': 0.01,
	'142': 1,
	'143': 1000,
};
const referralHash = {
	'9': true, // SOI referral
	'11': true, // Past Client Referral
	'13': true, // Vendor Partner Referral
	'14': true, // Vendor Partner Reference
	'19': true, // Trep Agent Referral
	'20': true, // Agent Referral
};
const vpReferenceHash = {
	'159': 14, // VP Reference
};
const vpShowApplicationHash = {
	'29': true, // vp get on list
	'31': true, // vp follow-up
};
const vpReferenceConstant = 159;
const vpBinaryHash = {
	'170': false,
	'189': true,
};
const dealFoundHash = {
	'82': 95,
	'83': 95,
	'84': 95,
	'85': 95,
	'86': 95,
	'87': 95,
	'88': 95,
	'89': 95,
	'90': 95,
	'91': 95,
	'92': 95,
	'93': 94,
	'164': 94,
};
const convoTypeHash = {
	// lead gen
	'28': 166, // reverse problem solve
	'33': 167, // solve their problem
	'29': 166, // get vp on list
	'32': 166, // planned RE Convo
	'38': 166, // unplanned
	'39': 166, // other
	
	// follow-up
	'31': 167, // vp app follow-up
	'34': 167, // vp reference check
	'36': 167, // vp check-in
	'202': 167, // customer requested to meet

	// service
	'37': 165, // service call
};
const convoIntentionalHash = {
	// intentional
	'218': 168, // lead vp
	'219': 168, // new intro vp
	'220': 168, // past client vp
	'221': 168, // soi vp
	'222': 168, // client vp
	'223': 168, // post-vp
	'224': 168, // vp
	'225': 168, // vp reference
	'44':  168, // ford
	'45':  168, // geo
	'46':  168, // forever home
	'47':  168, // work being done
	'203': 168, // listing consult
	'204': 168, // buyer consult
	// not intentional
	'57': 169, // no did not run model
	'54': 169, // n/a vague vm
	'55': 169, // not 2-way
	'56': 169, // left vm
	'58': 169, // did not connect
	'226':169, // ghosting text
	'51': 169, // other
};
const problemSolveHash = {
	'59': true, // vp problem
	'211': true, // re problem
};
const dateIntegerHash = {
	'date_convo_year': true,
	'date_convo_month': true,
	'date_convo_day': true,
	'date_deal_year': true,
	'date_deal_month': true,
	'date_deal_day': true,
	'date_fu_year': true,
	'date_fu_month': true,
	'date_fu_day': true,
};
const monthHash = {
	January:0,
	February:1,
	March:2,
	April:3,
	May:4,
	June:5,
	July:6,
	August:7,
	September:8,
	October:9,
	November:10,
	December:11,
};
const reverseMonthHash = {};
for(let m in monthHash){
	const thisMonth = monthHash[m];
	reverseMonthHash[thisMonth] = m;
}
const tempIdKeys = {
	id_activity_temp: true,
	id_deal_fu_temp: true,
	id_contact_fu_temp: true,
	id_deal_temp: true,
	id_contact_temp: true,
	id_who_introduced_temp: true,
};
const inputFormatOptions = {
	stringArraySignatures: [ // string is default. only need to populate if a string key contains a subset of another key type
		'contact_where_met_notes',
	],
	numberSignatures: [
		'deal_gci',
		'deal_value',
		'deal_commission_rate',
	],
	integerSignatures: [
		'id_contact',
		'id_who_introduced',
		'id_deal',
		'id_agent',

		'id_activity_fu',
		'id_contact_fu',
		'id_deal_fu',

		'fu_purpose',

		'convo_relationship',
		'convo_type',
		'convo_main_purpose',
		'convo_method',
		'convo_tone',
		'convo_model',
		'convo_intentional',
		'convo_voice_note',
		'convo_problem_solve',
		'convo_deal_found',
		'convo_outcome',

		'contact_how_met',
		'contact_where_met',
		'contact_type',
		'contact_vp_status',

		'connection_type',

		'deal_how_found',
		'deal_how_found_categ',
		'deal_trigger',
		'deal_type',
		'deal_stage',
		'deal_timeline_stated',
		'deal_value_status',

		'date_convo_year',
		'date_convo_month',
		'date_convo_day',
		'date_deal_year',
		'date_deal_month',
		'date_deal_day',
		'date_fu_year',
		'date_fu_month',
		'date_fu_day',
		'date_dp_year',
		'date_dp_month',
		'date_dp_day',
		'dp_cv_1',
		'dp_cv_2',
		'dp_cv_3',
		'dp_cv_1_rank',
		'dp_cv_2_rank',
		'dp_cv_3_rank',
		'dp_convo_enter',
		'dp_convo_recap',
		'dp_contacts_entered',
		'dp_yesterday_status',
		'dp_fu_review',
		'dp_calendar',
		'dp_convo_goal',
	],
};

const vpAppStatusHash = {
	'0': {editable: true,  ts: 'timestamp_created', color: '#f2b3bf', label: 'Not Sent', text: 'Please complete all fields, then click submit.'},
	'1': {editable: true,  ts: 'ts_sent', color: '#E6F2FF', label: 'Sent To Partner', text: 'Please complete all fields, then click submit.'},
	'2': {editable: true,  ts: 'ts_returned', color: '#A4D2ED', label: 'Returned - Review Not Started Yet', text: 'Thank you for completing the application! We will start our review promptly and will be in touch with any questions. You may edit this application at the same link until our review starts.'},
	'3': {editable: false, ts: 'ts_review', color: '#63B3DB', label: 'In Review', text: 'We have started our review, i.e. calling references. The application is no longer editable. Please contact us directly with any questions.'},
	'4': {editable: false, ts: 'ts_active', color: '#0083C0', label: 'Accepted / Active', text: 'Thank you for participating in our Vendor Partnership Program!'},
	'5': {editable: false, ts: 'ts_decline', color: '#f77791', label: 'Not participating',  text: ''},
};

for(let k in vpAppStatusHash){
	const thisOne = vpAppStatusHash[k];
	const rgb = hexToRgb(thisOne.color);
	thisOne.luma = rgb.luma || 50;
}

// @@@@@@@@@@@@@@ USED ON SERVER ONLY @@@@@@@@@@@@

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
	convo_vp_ref: true,
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
	id_vp_fu: true,

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
	contact_vp_areas: true,
	contact_name_first: true,
	contact_name_last: true,
	contact_phone: true,
	contact_email: true,
	contact_url: true,
	contact_review_url: true,
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
	vp_url: false, // user entered, but not required
	vp_area: true,
	vp_contact_person: true,
	vp_review_url: false, // user entered, but not required
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




module.exports = {
	vlStatic,
	convoDealFoundHash,
	commissionHash,
	referralHash,
	vpReferenceHash,
	vpShowApplicationHash,
	vpReferenceConstant,
	vpBinaryHash,
	dealFoundHash,
	convoTypeHash,
	convoIntentionalHash,
	problemSolveHash,
	dateIntegerHash,
	reverseMonthHash,
	tempIdKeys,
	inputFormatOptions,
	vpAppStatusHash,

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
};