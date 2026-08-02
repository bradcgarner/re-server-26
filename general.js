'use strict';
// EXPRESS
const express               = require('express');
const router                = express.Router();
router.use(express.json());
// DATABASE
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// AUTH
const { jwtStrategy } = require('./auth');
const userContainer = {};
router.use((req, res, next)=>jwtStrategy(req, res, next, userContainer));
// OTHER LIBRARIES
const { 
	convertArrayToObject,
	hexToRgb } = require('conjunction-junction');
// INTERNAL REFERENCES
const {getIdAgent} = require('./helpers');
const {vpAppStatusHash,
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
} = require('./db-static');

// @@@@@@@@@@@ START ROUTER @@@@@@@@@@@@


const formatLists = data => {
	const vLGroupsHash = {};
	const vLItemsHash = {};
	data.forEach(d=>{
		const rgb = hexToRgb(d.color);
		const luma = rgb.luma || 50;
		if(!Array.isArray(vLGroupsHash[d.list])){
			vLGroupsHash[d.list] = [];
		}
		const newD = {
			id: d.id,
			label: d.label,
			color: d.color || '#cccccc',
			luma,
		}
		if(d.value !== null){
			newD.value = d.value;
		}		
		if(d.category !== null){
			newD.category = d.category;
		}
		vLGroupsHash[d.list].push(newD);
		vLItemsHash[`${d.id}`] = newD;
	});
	return {vLGroupsHash, vLItemsHash};
};

router.get('/get-lists', (req, res)=>{

	let proformae = {};
	let contacts = [];
	let contactsHash = {};
	let deals = [];
	let dealsHash = {};
	let coreValuesHash = {};
	let coreValues = [];
	let vpCategories = [];
	let vpAreas = [];

	const id_agent = getIdAgent(userContainer);
	
	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		// GET VP CATEGORIES
		return supabase
			.from('vp_categories')
			.select(`*`)
			.order('vp_category')
	})
	.then(r=>{
		const { data, error } = r;
		vpCategories = Array.isArray(data) ? data : [] ;

		// GET VP AREAS
		return supabase
			.from('vp_areas')
			.select(`*`)
			.order('sort_order')
	})
	.then(r=>{
		const { data, error } = r;
		vpAreas = Array.isArray(data) ? data : [] ;

		// GET PROFORMAE
		return supabase
			.from('proformae')
			.select('*')
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		proformae = Array.isArray(r.data) && r.data[0] ? r.data[0] : {};

		// GET CONTACTS
		return supabase
			.from('contacts')
			.select('*')
			.eq('id_agent', id_agent)
			.order('contact_name_first','contact_name_last')
	})
	.then(r=>{
		contacts = Array.isArray(r.data) ? r.data : [];
		contactsHash = convertArrayToObject(contacts, 'id_contact');

		// GET DEALS
		return supabase
			.from('deals')
			.select('*')
			.eq('id_agent', id_agent)
			.order('deal_name')
	})
	.then(r=>{
		deals = Array.isArray(r.data) ? r.data : [];
		dealsHash = convertArrayToObject(deals, 'id_deal');

		// GET CORE VALUES
		return supabase
			.from('core_values')
			.select('*')
			.eq('id_agent', id_agent)
			.order('sort_order')
	})
	.then(r=>{
		coreValues = Array.isArray(r.data) ? r.data : [];
		coreValuesHash = convertArrayToObject(coreValues, 'id_cv');

		// GET VALUE LISTS
		return supabase
			.from('value_lists')
			.select('*')
			.order('sort_order');
	})
	.then(r=>{
		const { data, error } = r;
		const valueLists = Array.isArray(data) ? data : [] ;
		
		const {vLGroupsHash, vLItemsHash} = formatLists(valueLists);
		vLGroupsHash.contact = contacts.map(c=>{
			const label = c.contact_vp_status === vlStatic.contactVPStatusYes ?
			`${c.contact_company} (${c.contact_name_first} ${c.contact_name_last})` :
			`${c.contact_name_first} ${c.contact_name_last}`;
			return {id: c.id_contact, label};
		});
		vLGroupsHash.deal = deals.map(d=>{
			return {id: d.id_deal, label: d.deal_name};
		});
		vLGroupsHash['core value'] = coreValues.map(v=>{
			return {id: v.id_cv, label: v.cv_label};
		});
		return res.status(200).json({
			vpCategories,
			vpAreas,
			proformae,
			vLGroupsHash,
			vLItemsHash, 
			contactsHash, 
			dealsHash, 
			coreValuesHash,
			vpAppStatusHash,
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
			inputFormatOptions,
			tempIdKeys,
		});
		
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.get('/core-values/:id_agent', (req, res)=>{

	const id_agent = req.params.id_agent;

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		return supabase
			.from('core_values')
			.select('*')
			.eq('id_agent', id_agent)
			.order('sort_order')
	})
	.then(r=>{
		const coreValues = Array.isArray(r.data) ? r.data : [];
		return res.status(200).json(coreValues);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

module.exports = {
	router,
};