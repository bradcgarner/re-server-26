const express               = require('express');
const router                = express.Router();
const generator             = require('generate-password');
router.use(express.json());
const {getIdAgent, vpAppFields, vpAppStatusHash} = require('./activities-helpers');
const { 
	convertArrayToObject,
	hexToRgb } = require('conjunction-junction');

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getVPAppCompletionStatus = a => {
	let status = 2; // returned, i.e. complete
	for(let k in vpAppFields){
		const isUserEnteredField = !!vpAppFields[k];
		if(isUserEnteredField && !a[k]){ // if not entered
			status = 1; // sent to vendor, i.e. not complete
		}
	}
	return status;
};

const getAppById = (vp_temp_id, res) => {

	return new Promise(resolve => {
		resolve();
	})
	.then(r=>{
		return supabase
			.from('vp_app')
			.select(`*,
				agents(
					agent_name_first,
					agent_name_last
				)`)
			.eq('vp_temp_id', vp_temp_id);
	})
	.then(r=>{
		const { data, error } = r;
		const appFromDB = Array.isArray(data) && data[0] ? data[0] : {};
		if(!appFromDB.vp_temp_id){
			appFromDB.vp_temp_id = generator.generate({
				length: 30,
				numbers: true,
				strict: true,
			});
		}
		appFromDB.vpAppStatusHash = vpAppStatusHash;
		return res.status(200).json(appFromDB);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})
};

router.get('/:vp_temp_id', (req, res)=>{

	const vp_temp_id = req.params.vp_temp_id;

	return getAppById(vp_temp_id, res);
});

router.put('/', (req, res)=>{

	const appRaw = req.body;
	const id_vp_app = appRaw.id_vp_app;

	const vpAppStatusData = vpAppStatusHash[`${appRaw.vp_app_status}`] || {};
	const editable = vpAppStatusData.editable;
	if(editable){
		appRaw.vp_app_status = getVPAppCompletionStatus(appRaw);
	} 

	const appConformed = {};
	for(let k in vpAppFields){
		appConformed[k] = appRaw[k] || null;
	}
	delete appConformed.id_vp_app;
	if(!appConformed.vp_app_status){
		appConformed.vp_app_status = 0;
	}

	if(!id_vp_app){
		appConformed.vp_temp_id = generator.generate({
			length: 30,
			numbers: true,
			strict: true,
		});
		return new Promise(resolve => {
			resolve();
		})
		.then(r=>{
			return supabase
				.from('vp_app')
				.insert(appConformed)
		})
		.then(r=>{
			const {data, error} = r;
			return getAppById(appConformed.vp_temp_id, res);
		})
		.catch(err => {
			console.error(err);
			return res.status(500).json(err);
		})
	}

	return new Promise(resolve => {
		resolve();
	})
	.then(r=>{
		return supabase
			.from('vp_app')
			.update(appConformed)
			.eq('id_vp_app',id_vp_app)
	})
	.then(r=>{
		const {data, error} = r;
		return getAppById(appConformed.vp_temp_id, res);
	})
	.catch(err => {
		console.error(err);
		return res.status(500).json(err);
	})

});

module.exports = {
	router,
};