const express               = require('express');
const router                = express.Router();
const fs = require('fs');
router.use(express.json());

const { 
	convertArrayToObject,
	hexToRgb } = require('conjunction-junction');

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { jwtStrategy } = require('./auth');
const userContainer = {};
router.use((req, res, next)=>jwtStrategy(req, res, next, userContainer));

const formatLists = data => {
	const valueListHash = {};
	const fullHash = {};
	data.forEach(d=>{
		const rgb = hexToRgb(d.color);
		const luma = rgb.luma || 50;
		if(!Array.isArray(valueListHash[d.list])){
			valueListHash[d.list] = [];
		}
		const valueD = {
			id: d.id,
			label: d.label,
		};
		const fullD = {
			label: d.label,
			color: d.color || '#cccccc',
			luma,
		}
		if(d.value !== null){
			fullD.value = d.value;
		}		
		if(d.category !== null){
			fullD.category = d.category;
		}
		valueListHash[d.list].push(valueD);
		fullHash[`${d.id}`] = fullD;
	});
	return {valueListHash, fullHash};
};

router.get('/get-lists', (req, res)=>{

	let contacts = [];
	let contactsHash = {};
	let deals = [];
	let dealsHash = {};
	let coreValuesHash = {};
	let coreValues = [];

	let id_agent = 1;

	return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
		// GET CONTACTS
		return supabase
			.from('contacts')
			.select('*')
			.eq('id_agent', id_agent)
	})
	.then(r=>{
		contacts = Array.isArray(r.data) ? r.data : [];
		contactsHash = convertArrayToObject(contacts, 'id_contact');

		// GET DEALS
		return supabase
			.from('deals')
			.select('*')
			.eq('id_agent', id_agent)
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
		if(Array.isArray(data)){
			const {valueListHash, fullHash} = formatLists(data);
			valueListHash.contact = contacts.map(c=>{
				return {id: c.id_contact, label: `${c.contact_name_first} ${c.contact_name_last}`};
			});
			valueListHash.deal = deals.map(d=>{
				return {id: d.id_deal, label: d.deal_name};
			});
			valueListHash['core value'] = coreValues.map(v=>{
				return {id: v.id_cv, label: v.cv_label};
			});
			return res.status(200).json({valueListHash, fullHash, contactsHash, dealsHash, coreValuesHash});
		}
		return res.status(204).json({});
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
});

router.get('/core-values', (req, res)=>{

	let contacts = [];
	let contactsHash = {};
	let deals = [];
	let dealsHash = {};
	let coreValuesHash = {};
	let coreValues = [];

	let id_agent = 1;

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
		coreValues = Array.isArray(r.data) ? r.data : [];
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